using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Debtor.Services;
using Monetaris.Debtor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Debtor.Api;

/// <summary>
/// GET endpoint to retrieve a specific debtor by ID
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize]
public class GetDebtorById : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetDebtorById> _logger;

    public GetDebtorById(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<GetDebtorById> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get a debtor by ID (with authorization checks)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetDebtorById endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetByIdAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                _logger.LogWarning("Debtor {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for debtor {Id} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("GetDebtorById failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Retrieved debtor {Id} for user {UserId}", id, currentUser.Id);
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
