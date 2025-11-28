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
/// Update user profile endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class UpdateProfile : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<UpdateProfileRequest> _validator;
    private readonly ILogger<UpdateProfile> _logger;

    public UpdateProfile(
        IApplicationDbContext context,
        IValidator<UpdateProfileRequest> validator,
        ILogger<UpdateProfile> logger)
    {
        _context = context;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Update user profile (name and email)
    /// </summary>
    /// <param name="request">Profile update data</param>
    /// <returns>Updated user information</returns>
    /// <response code="200">Profile updated successfully</response>
    /// <response code="400">Validation error or email already exists</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="404">User not found</response>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfileAsync([FromBody] UpdateProfileRequest request)
    {
        // Validate request
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            _logger.LogWarning("Profile update validation failed: {Errors}", string.Join(", ", errors));
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
            .Include(u => u.KreditorAssignments)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Detail = "User account not found",
                Status = StatusCodes.Status404NotFound
            });
        }

        // Check if email is already taken by another user
        if (request.Email != user.Email)
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && u.Id != userId);

            if (emailExists)
            {
                _logger.LogWarning("Email already exists: {Email}", request.Email);
                return BadRequest(new ProblemDetails
                {
                    Title = "Email Already Exists",
                    Detail = "Diese E-Mail-Adresse wird bereits verwendet",
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        // Update user profile
        user.Name = request.Name;
        user.Email = request.Email;
        user.UpdatedAt = DateTime.UtcNow;

        // Update avatar initials if name changed
        user.AvatarInitials = GetInitials(request.Name);

        await _context.SaveChangesAsync();

        _logger.LogInformation("Profile updated successfully for user: {UserId}", userId);

        // Return updated user DTO
        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            KreditorId = user.KreditorId,
            AssignedKreditorIds = user.KreditorAssignments.Select(ka => ka.KreditorId).ToList(),
            AvatarInitials = user.AvatarInitials
        };

        return Ok(userDto);
    }

    /// <summary>
    /// Generate initials from full name
    /// </summary>
    private string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "??";

        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1)
            return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();

        return (parts[0][0].ToString() + parts[^1][0].ToString()).ToUpper();
    }
}
