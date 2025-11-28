using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Debtor.Services;
using Monetaris.Debtor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Enums;
using System.Security.Claims;

namespace Monetaris.Debtor.Api;

/// <summary>
/// POST endpoint to create a new debtor
/// </summary>
[ApiController]
[Route("api/debtors")]
[Authorize(Roles = "ADMIN,AGENT")]
public class CreateDebtor : ControllerBase
{
    private readonly IDebtorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateDebtor> _logger;

    public CreateDebtor(
        IDebtorService service,
        IApplicationDbContext context,
        ILogger<CreateDebtor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new debtor (ADMIN/AGENT only)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DebtorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromBody] CreateDebtorRequest request)
    {
        _logger.LogInformation("CreateDebtor endpoint called: {Name}",
            request.EntityType != EntityType.NATURAL_PERSON ? request.CompanyName : $"{request.FirstName} {request.LastName}");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("CreateDebtor failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Debtor created successfully: {Id}", result.Data!.Id);
        return CreatedAtAction(
            nameof(GetDebtorById.Handle),
            nameof(GetDebtorById).Replace("Controller", ""),
            new { id = result.Data.Id },
            result.Data
        );
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
