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
/// GET endpoint for global search across all entities
/// </summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class GlobalSearch : ControllerBase
{
    private readonly IDashboardService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GlobalSearch> _logger;

    public GlobalSearch(
        IDashboardService service,
        IApplicationDbContext context,
        ILogger<GlobalSearch> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Search across cases, debtors, and tenants
    /// </summary>
    /// <param name="query">Search query string</param>
    /// <returns>List of matching results</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<SearchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromQuery] string query)
    {
        _logger.LogInformation("GlobalSearch endpoint called with query: {Query}", query);

        if (string.IsNullOrWhiteSpace(query))
        {
            _logger.LogWarning("GlobalSearch called with empty query");
            return BadRequest(new { error = "Query parameter is required" });
        }

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to GlobalSearch");
            return Unauthorized();
        }

        var result = await _service.SearchAsync(query, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GlobalSearch failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("GlobalSearch found {Count} results for user {UserId}",
            result.Data!.Count, currentUser.Id);

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
