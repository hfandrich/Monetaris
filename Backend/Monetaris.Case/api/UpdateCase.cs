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
/// PUT endpoint to update an existing case's details (NOT workflow status)
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize(Roles = "ADMIN,AGENT")]
public class UpdateCase : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateCase> _logger;

    public UpdateCase(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<UpdateCase> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Update case details (financial amounts, agent, court info, AI analysis)
    /// NOTE: To change workflow status, use the AdvanceWorkflow endpoint instead
    /// Cannot update cases in final states (PAID, SETTLED, UNCOLLECTIBLE, INSOLVENCY)
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <param name="request">Updated case data</param>
    /// <returns>Updated case with full details</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateCaseRequest request)
    {
        _logger.LogInformation("UpdateCase endpoint called for case {Id} by user", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                _logger.LogWarning("Case {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for case {Id} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            _logger.LogWarning("UpdateCase failed for case {Id}: {Error}", id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Case {Id} updated successfully by user {UserId}", id, currentUser.Id);
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
