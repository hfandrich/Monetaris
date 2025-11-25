using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Dashboard.Models;
using Monetaris.Dashboard.Services;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for dashboard and search operations
/// </summary>
[ApiController]
[Route("api")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        IApplicationDbContext context,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard/stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _dashboardService.GetStatsAsync(currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Get financial data for charts
    /// </summary>
    [HttpGet("dashboard/financial")]
    [ProducesResponseType(typeof(FinancialChartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFinancialData()
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _dashboardService.GetFinancialDataAsync(currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Global search across all entities
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<SearchResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _dashboardService.SearchAsync(q, currentUser);

        if (!result.IsSuccess)
        {
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
