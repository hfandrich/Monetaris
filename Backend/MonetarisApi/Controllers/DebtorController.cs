using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Debtor.Models;
using Monetaris.Debtor.Services;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for managing debtors (Schuldner)
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize]
public class DebtorController : ControllerBase
{
    private readonly IDebtorService _debtorService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DebtorController> _logger;

    public DebtorController(
        IDebtorService debtorService,
        IApplicationDbContext context,
        ILogger<DebtorController> logger)
    {
        _debtorService = debtorService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all debtors with filtering and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<DebtorDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] DebtorFilterRequest filters)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.GetAllAsync(filters, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Get a specific debtor by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.GetByIdAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                return Forbid();
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Search debtors by query string
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<DebtorSearchDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.SearchAsync(q, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Create a new debtor
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateDebtorRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Update an existing debtor
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDebtorRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Delete a debtor
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _debtorService.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return NoContent();
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
