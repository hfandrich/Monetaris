using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Template.Services;
using Monetaris.Template.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Template.Api;

/// <summary>
/// POST endpoint to create a new communication template (ADMIN only)
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize(Roles = "ADMIN")]
public class CreateTemplate : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateTemplate> _logger;

    public CreateTemplate(
        ITemplateService service,
        IApplicationDbContext context,
        ILogger<CreateTemplate> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new communication template
    /// </summary>
    /// <param name="request">Template creation request</param>
    /// <returns>Created template</returns>
    [HttpPost]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromBody] CreateTemplateRequest request)
    {
        _logger.LogInformation("CreateTemplate endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to CreateTemplate");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Failed to create template: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully created template {Id} by user {UserId}",
            result.Data!.Id, currentUser.Id);

        return CreatedAtAction(
            actionName: "Handle",
            controllerName: "GetTemplateById",
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
