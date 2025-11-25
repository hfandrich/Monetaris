using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Services;
using Monetaris.Case.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Case.Api;

/// <summary>
/// GET endpoint to retrieve all cases with filtering and pagination
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize]
public class GetAllCases : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAllCases> _logger;

    public GetAllCases(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<GetAllCases> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all cases with optional filtering by status, kreditor, debtor, agent
    /// Results are automatically scoped by user role (ADMIN sees all, AGENT sees assigned, CLIENT sees own)
    /// </summary>
    /// <param name="filters">Filter and pagination parameters</param>
    /// <returns>Paginated list of cases</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<CaseListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromQuery] CaseFilterRequest filters)
    {
        _logger.LogInformation("GetAllCases endpoint called with filters: TenantId={TenantId}, Status={Status}, Page={Page}, PageSize={PageSize}",
            filters.TenantId, filters.Status, filters.Page, filters.PageSize);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetAllAsync(filters, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetAllCases failed for user {UserId}: {Error}", currentUser.Id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Retrieved {Count} cases for user {UserId} (page {Page})",
            result.Data!.Items.Count, currentUser.Id, filters.Page);

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
