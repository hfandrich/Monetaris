using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Case.Models;
using Monetaris.Case.Services;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for managing collection cases with ZPO workflow
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize]
public class CaseController : ControllerBase
{
    private readonly ICaseService _caseService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CaseController> _logger;

    public CaseController(
        ICaseService caseService,
        IApplicationDbContext context,
        ILogger<CaseController> logger)
    {
        _caseService = caseService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all cases with filtering and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<CaseListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] CaseFilterRequest filters)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.GetAllAsync(filters, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Get a specific case by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.GetByIdAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
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
    /// Create a new case
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCaseRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Update an existing case
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaseRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Delete a case
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

        var result = await _caseService.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return NoContent();
    }

    /// <summary>
    /// Advance case workflow to new status
    /// </summary>
    [HttpPost("{id}/advance")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdvanceWorkflow(Guid id, [FromBody] AdvanceWorkflowRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.AdvanceWorkflowAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Get case history/audit log
    /// </summary>
    [HttpGet("{id}/history")]
    [ProducesResponseType(typeof(List<CaseHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _caseService.GetHistoryAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
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
