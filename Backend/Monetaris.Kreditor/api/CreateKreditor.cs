using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// POST endpoint to create a new kreditor
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
    /// Create a new kreditor (ADMIN only)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromBody] CreateKreditorRequest request)
    {
        _logger.LogInformation("CreateKreditor endpoint called: {Name}", request.Name);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("CreateKreditor failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Kreditor created successfully: {Id}", result.Data!.Id);
        return CreatedAtAction(
            nameof(GetKreditorById.Handle),
            nameof(GetKreditorById).Replace("Controller", ""),
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
