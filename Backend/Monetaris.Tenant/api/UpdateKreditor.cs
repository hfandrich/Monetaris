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
/// Updates an existing Kreditor (ADMIN only)
/// </summary>
[ApiController]
[Route("api/kreditoren")]
[Authorize(Roles = "ADMIN")]
public class UpdateKreditor : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateKreditor> _logger;

    public UpdateKreditor(
        IKreditorService service,
        IApplicationDbContext context,
        ILogger<UpdateKreditor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing Kreditor
    /// Only ADMIN users can update Kreditoren
    /// Validates that RegistrationNumber is unique (excluding current Kreditor)
    /// </summary>
    /// <param name="id">The Kreditor ID to update</param>
    /// <param name="request">Updated Kreditor data</param>
    /// <returns>Updated Kreditor DTO</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateKreditorRequest request)
    {
        _logger.LogInformation("Updating Kreditor {KreditorId}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateKreditor");
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Tenant not found")
            {
                _logger.LogWarning("Kreditor {KreditorId} not found for update", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("Failed to update Kreditor {KreditorId}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully updated Kreditor {KreditorId} by user {UserId}",
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
