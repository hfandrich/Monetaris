using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Services;
using Monetaris.Case.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Case.Api;

/// <summary>
/// GET endpoint to retrieve case history/audit log
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize]
public class GetCaseHistory : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetCaseHistory> _logger;

    public GetCaseHistory(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<GetCaseHistory> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get complete audit log for a case (chronological list of all status changes and actions)
    /// Includes: timestamp, action type, details, and actor who performed the action
    /// Authorization enforced: Must have access to the case
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <returns>List of history entries (newest first)</returns>
    [HttpGet("{id}/history")]
    [ProducesResponseType(typeof(List<CaseHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetCaseHistory endpoint called for case {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetHistoryAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                _logger.LogWarning("Case {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for case {Id} history by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("GetCaseHistory failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Retrieved {Count} history entries for case {Id}", result.Data!.Count, id);
        return Ok(result.Data);
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
