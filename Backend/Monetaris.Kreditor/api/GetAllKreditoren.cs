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
/// GET endpoint to retrieve all kreditoren accessible to the current user
/// </summary>
[ApiController]
[Route("api/kreditoren")]
[Authorize]
public class GetAllKreditoren : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAllKreditoren> _logger;

    public GetAllKreditoren(
        IKreditorService service,
        IApplicationDbContext context,
        ILogger<GetAllKreditoren> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all kreditoren (filtered by user role and permissions)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<KreditorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetAllKreditoren endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetAllAsync(currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetAllKreditoren failed: {Error}", result.ErrorMessage);
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
