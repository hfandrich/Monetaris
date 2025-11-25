using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// Retrieves a single Kreditor by ID with authorization checks
/// </summary>
[ApiController]
[Route("api/kreditoren")]
[Authorize]
public class GetKreditorById : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetKreditorById> _logger;

    public GetKreditorById(
        IKreditorService service,
        IApplicationDbContext context,
        ILogger<GetKreditorById> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get a specific Kreditor by ID
    /// Enforces role-based access control:
    /// - ADMIN: Can access any Kreditor
    /// - AGENT: Can access assigned Kreditoren only
    /// - CLIENT: Can access own Kreditor only
    /// </summary>
    /// <param name="id">The Kreditor ID</param>
    /// <returns>Kreditor DTO</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("Fetching Kreditor {KreditorId}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to GetKreditorById");
            return Unauthorized();
        }

        var result = await _service.GetByIdAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Tenant not found")
            {
                _logger.LogWarning("Kreditor {KreditorId} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied to Kreditor {KreditorId} for user {UserId}",
                    id, currentUser.Id);
                return Forbid();
            }

            _logger.LogWarning("Failed to fetch Kreditor {KreditorId}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved Kreditor {KreditorId} for user {UserId}",
            id, currentUser.Id);

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
