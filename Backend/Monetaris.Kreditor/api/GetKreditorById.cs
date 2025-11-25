using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// GET endpoint to retrieve a specific kreditor by ID
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
    /// Get a kreditor by ID (with authorization checks)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetKreditorById endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetByIdAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Kreditor not found")
            {
                _logger.LogWarning("Kreditor {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for kreditor {Id} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("GetKreditorById failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

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
