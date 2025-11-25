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
/// PUT endpoint to update an existing kreditor
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
    /// Update an existing kreditor (ADMIN only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateKreditorRequest request)
    {
        _logger.LogInformation("UpdateKreditor endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage!.Contains("not found"))
            {
                _logger.LogWarning("Kreditor {Id} not found for update", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            _logger.LogWarning("UpdateKreditor failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Kreditor updated successfully: {Id}", id);
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
