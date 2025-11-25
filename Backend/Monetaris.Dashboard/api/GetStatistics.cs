using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Dashboard.Services;
using Monetaris.Dashboard.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Dashboard.Api;

/// <summary>
/// GET endpoint to retrieve dashboard statistics (scoped by user role)
/// </summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class GetStatistics : ControllerBase
{
    private readonly IDashboardService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetStatistics> _logger;

    public GetStatistics(
        IDashboardService service,
        IApplicationDbContext context,
        ILogger<GetStatistics> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard KPI statistics
    /// </summary>
    /// <returns>Dashboard statistics scoped to user's access</returns>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetStatistics endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to GetStatistics");
            return Unauthorized();
        }

        var result = await _service.GetStatsAsync(currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetStatistics failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved statistics for user {UserId}",
            currentUser.Id);

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
