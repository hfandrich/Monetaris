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
/// POST endpoint to create a new collection case
/// </summary>
[ApiController]
[Route("api/cases")]
[Authorize(Roles = "ADMIN,AGENT,CLIENT")]
public class CreateCase : ControllerBase
{
    private readonly ICaseService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateCase> _logger;

    public CreateCase(
        ICaseService service,
        IApplicationDbContext context,
        ILogger<CreateCase> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new collection case (starts in NEW status)
    /// Validates debtor exists, user has access to kreditor, and invoice number is unique
    /// </summary>
    /// <param name="request">Case creation data</param>
    /// <returns>Created case with full details</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromBody] CreateCaseRequest request)
    {
        _logger.LogInformation("CreateCase endpoint called by user for kreditor {KreditorId}, debtor {DebtorId}, invoice {InvoiceNumber}",
            request.KreditorId, request.DebtorId, request.InvoiceNumber);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("CreateCase failed for user {UserId}: {Error}", currentUser.Id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Case {CaseId} created successfully by user {UserId}", result.Data!.Id, currentUser.Id);
        return CreatedAtAction(
            actionName: "Handle",
            controllerName: "GetCaseById",
            routeValues: new { id = result.Data.Id },
            value: result.Data);
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
