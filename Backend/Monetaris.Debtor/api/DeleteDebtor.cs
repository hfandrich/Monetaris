using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Debtor.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Debtor.Api;

/// <summary>
/// DELETE endpoint to remove a debtor
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize(Roles = "ADMIN")]
public class DeleteDebtor : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteDebtor> _logger;

    public DeleteDebtor(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<DeleteDebtor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Delete a debtor (ADMIN only). Cannot delete debtor with active cases.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("DeleteDebtor endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                _logger.LogWarning("Debtor {Id} not found for deletion", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Cannot delete debtor with existing cases")
            {
                _logger.LogWarning("Cannot delete debtor {Id} - has active cases", id);
                return BadRequest(new { error = result.ErrorMessage });
            }
            _logger.LogWarning("DeleteDebtor failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Debtor deleted successfully: {Id}", id);
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
