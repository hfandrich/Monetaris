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
/// PUT endpoint to update an existing debtor
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize(Roles = "ADMIN,AGENT")]
public class UpdateDebtor : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateDebtor> _logger;

    public UpdateDebtor(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<UpdateDebtor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing debtor (ADMIN/AGENT only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateDebtorRequest request)
    {
        _logger.LogInformation("UpdateDebtor endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                _logger.LogWarning("Debtor {Id} not found for update", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for updating debtor {Id} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("UpdateDebtor failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Debtor updated successfully: {Id}", id);
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
