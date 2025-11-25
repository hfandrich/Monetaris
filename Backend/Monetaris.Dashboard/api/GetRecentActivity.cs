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
/// GET endpoint to retrieve recent activity (case updates)
/// </summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class GetRecentActivity : ControllerBase
{
    private readonly IDashboardService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetRecentActivity> _logger;

    public GetRecentActivity(
        IDashboardService service,
        IApplicationDbContext context,
        ILogger<GetRecentActivity> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get recent activity and case updates
    /// </summary>
    /// <returns>Financial chart data scoped to user's access</returns>
    [HttpGet("activity")]
    [ProducesResponseType(typeof(FinancialChartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetRecentActivity endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to GetRecentActivity");
            return Unauthorized();
        }

        var result = await _service.GetFinancialDataAsync(currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetRecentActivity failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved recent activity for user {UserId}",
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
