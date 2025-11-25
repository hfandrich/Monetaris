using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Case.Api;

/// <summary>
/// DELETE endpoint to soft-delete a case (ADMIN only)
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize(Roles = "ADMIN")]
public class DeleteCase : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteCase> _logger;

    public DeleteCase(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<DeleteCase> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Delete a case (soft-delete)
    /// RESTRICTIONS:
    /// - Only ADMIN role can delete cases
    /// - Can only delete cases in DRAFT or NEW status
    /// - Cannot delete cases in court proceedings (MB_REQUESTED or later)
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <returns>204 No Content on success</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("DeleteCase endpoint called for case {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                _logger.LogWarning("Case {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for case {Id} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("DeleteCase failed for case {Id}: {Error}", id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Case {Id} deleted successfully by user {UserId}", id, currentUser.Id);
        return NoContent();
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _context.Users.FindAsync(userId);
    }
}
