using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// Deletes a Kreditor (ADMIN only)
/// </summary>
[ApiController]
[Route("api/kreditoren")]
[Authorize(Roles = "ADMIN")]
public class DeleteKreditor : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteKreditor> _logger;

    public DeleteKreditor(
        IKreditorService service,
        IApplicationDbContext context,
        ILogger<DeleteKreditor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Delete a Kreditor
    /// Only ADMIN users can delete Kreditoren
    /// Cannot delete if Kreditor has existing debtors or cases
    /// </summary>
    /// <param name="id">The Kreditor ID to delete</param>
    /// <returns>204 No Content on success</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("Deleting Kreditor {KreditorId}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to DeleteKreditor");
            return Unauthorized();
        }

        var result = await _service.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Tenant not found")
            {
                _logger.LogWarning("Kreditor {KreditorId} not found for deletion", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("Failed to delete Kreditor {KreditorId}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully deleted Kreditor {KreditorId} by user {UserId}",
            id, currentUser.Id);

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
