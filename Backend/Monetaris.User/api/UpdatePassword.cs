using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Interfaces;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Update user password endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class UpdatePassword : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<UpdatePasswordRequest> _validator;
    private readonly ILogger<UpdatePassword> _logger;

    public UpdatePassword(
        IApplicationDbContext context,
        IValidator<UpdatePasswordRequest> validator,
        ILogger<UpdatePassword> logger)
    {
        _context = context;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Update user password
    /// </summary>
    /// <param name="request">Password update data</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Password updated successfully</response>
    /// <response code="400">Validation error or incorrect current password</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="404">User not found</response>
    [HttpPut("password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdatePasswordRequest request)
    {
        // Validate request
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            _logger.LogWarning("Password update validation failed");
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = string.Join(", ", errors),
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Get user ID from JWT claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Invalid or missing user ID claim in token");
            return Unauthorized(new { error = "Invalid token" });
        }

        // Find user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            _logger.LogWarning("User not found for password update: {UserId}", userId);
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Detail = "User account not found",
                Status = StatusCodes.Status404NotFound
            });
        }

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            _logger.LogWarning("Incorrect current password for user: {UserId}", userId);
            return BadRequest(new ProblemDetails
            {
                Title = "Incorrect Password",
                Detail = "Das aktuelle Passwort ist falsch",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Hash new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password updated successfully for user: {UserId}", userId);

        return NoContent();
    }
}
