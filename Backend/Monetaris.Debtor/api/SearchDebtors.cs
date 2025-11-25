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
/// GET endpoint for full-text search across debtor fields
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize]
public class SearchDebtors : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SearchDebtors> _logger;

    public SearchDebtors(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<SearchDebtors> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Search debtors by query string (across multiple fields)
    /// </summary>
    /// <param name="q">Search query (min 2 characters)</param>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<DebtorSearchDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromQuery] string q)
    {
        _logger.LogInformation("SearchDebtors endpoint called with query: {Query}", q);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.SearchAsync(q, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("SearchDebtors failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Search found {Count} debtors for query '{Query}' by user {UserId}",
            result.Data!.Count, q, currentUser.Id);

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
