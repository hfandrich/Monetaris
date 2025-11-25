using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// Creates a new Kreditor (ADMIN only)
/// </summary>
[ApiController]
[Route("api/kreditoren")]
[Authorize(Roles = "ADMIN")]
public class CreateKreditor : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateKreditor> _logger;

    public CreateKreditor(
        IKreditorService service,
        IApplicationDbContext context,
        ILogger<CreateKreditor> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new Kreditor organization
    /// Only ADMIN users can create Kreditoren
    /// Validates that RegistrationNumber is unique
    /// </summary>
    /// <param name="request">Kreditor creation data</param>
    /// <returns>Created Kreditor DTO</returns>
    [HttpPost]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromBody] CreateKreditorRequest request)
    {
        _logger.LogInformation("Creating new Kreditor with name: {Name}", request.Name);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to CreateKreditor");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Failed to create Kreditor: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully created Kreditor {KreditorId} by user {UserId}",
            result.Data!.Id, currentUser.Id);

        return CreatedAtAction(
            actionName: "Handle",
            controllerName: "GetKreditorById",
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
