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
/// GET endpoint to retrieve a specific case by ID with full details
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize]
public class GetCaseById : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetCaseById> _logger;

    public GetCaseById(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<GetCaseById> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get a case by ID with full details including navigation properties
    /// Authorization enforced: Must have access to the case (scoped by tenant/role)
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <returns>Complete case details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetCaseById endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetByIdAsync(id, currentUser);

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
            _logger.LogWarning("GetCaseById failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved case {Id} for user {UserId}", id, currentUser.Id);
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
