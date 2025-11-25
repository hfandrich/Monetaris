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
/// GET endpoint to retrieve all debtors with filtering and pagination
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize]
public class GetAllDebtors : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAllDebtors> _logger;

    public GetAllDebtors(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<GetAllDebtors> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all debtors with filtering and pagination (filtered by user role and permissions)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<DebtorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromQuery] DebtorFilterRequest filters)
    {
        _logger.LogInformation("GetAllDebtors endpoint called - Page: {Page}, PageSize: {PageSize}",
            filters.Page, filters.PageSize);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetAllAsync(filters, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetAllDebtors failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Retrieved {Count} debtors for user {UserId}",
            result.Data!.Items.Count, currentUser.Id);

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
