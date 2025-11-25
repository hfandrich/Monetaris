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
/// PUT endpoint to advance case workflow status through ZPO-compliant transitions
/// This is the CORE workflow management endpoint for German legal debt collection
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize(Roles = "ADMIN,AGENT")]
public class AdvanceWorkflow : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AdvanceWorkflow> _logger;

    public AdvanceWorkflow(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<AdvanceWorkflow> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Advance case workflow status (e.g., NEW → REMINDER_1 → REMINDER_2 → PREPARE_MB → MB_REQUESTED)
    ///
    /// WORKFLOW PHASES:
    /// 1. Pre-Court: DRAFT → NEW → REMINDER_1 → REMINDER_2 → ADDRESS_RESEARCH
    /// 2. Court Dunning: PREPARE_MB → MB_REQUESTED → MB_ISSUED → MB_OBJECTION
    /// 3. Enforcement Order: PREPARE_VB → VB_REQUESTED → VB_ISSUED → TITLE_OBTAINED
    /// 4. Enforcement: ENFORCEMENT_PREP → GV_MANDATED → EV_TAKEN
    /// 5. Closure: PAID / SETTLED / INSOLVENCY / UNCOLLECTIBLE
    ///
    /// BUSINESS RULES:
    /// - Validates transition via WorkflowEngine (ZPO compliance)
    /// - Creates audit log entry (CaseHistory) with actor and note
    /// - Auto-calculates NextActionDate based on new status
    /// - Updates debtor statistics on closure
    /// - Cannot go backwards or skip required states
    /// - Final states cannot transition further
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <param name="request">New status and optional note</param>
    /// <returns>Updated case with new workflow status</returns>
    [HttpPut("{id}/advance")]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] AdvanceWorkflowRequest request)
    {
        _logger.LogInformation("AdvanceWorkflow endpoint called for case {CaseId} to status {NewStatus}",
            id, request.NewStatus);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.AdvanceWorkflowAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Case not found")
            {
                _logger.LogWarning("Case {CaseId} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                _logger.LogWarning("Access denied for case {CaseId} by user {UserId}", id, currentUser.Id);
                return Forbid();
            }
            if (result.ErrorMessage!.Contains("Invalid workflow transition"))
            {
                _logger.LogWarning("Invalid workflow transition for case {CaseId}: {Error}", id, result.ErrorMessage);
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Case {CaseId} workflow advanced to {NewStatus} by user {UserId}",
            id, request.NewStatus, currentUser.Id);

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
