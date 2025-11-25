using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Interfaces;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Get current user endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class GetCurrentUser : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetCurrentUser> _logger;

    public GetCurrentUser(IApplicationDbContext context, ILogger<GetCurrentUser> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get current authenticated user details
    /// </summary>
    /// <returns>Current user information without sensitive data</returns>
    /// <response code="200">User found - returns user details</response>
    /// <response code="401">Invalid token or user not authenticated</response>
    /// <response code="404">User not found in database</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Invalid or missing user ID claim in token");
            return Unauthorized(new { error = "Invalid token" });
        }

        var user = await _context.Users
            .Include(u => u.TenantAssignments)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = "User not found" });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            TenantId = user.TenantId,
            AssignedTenantIds = user.TenantAssignments.Select(ta => ta.TenantId).ToList(),
            AvatarInitials = user.AvatarInitials
        };

        _logger.LogInformation("Current user retrieved: {UserId}", userId);
        return Ok(userDto);
    }
}
