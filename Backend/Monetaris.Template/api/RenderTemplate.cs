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
/// POST endpoint to render a template with variable substitution
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize(Roles = "ADMIN,AGENT")]
public class RenderTemplate : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<RenderTemplate> _logger;

    public RenderTemplate(
        ITemplateService service,
        IApplicationDbContext context,
        ILogger<RenderTemplate> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Render template with variable values
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <param name="request">Variable values for rendering</param>
    /// <returns>Rendered template content</returns>
    [HttpPost("{id}/render")]
    [ProducesResponseType(typeof(RenderTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] RenderTemplateRequest request)
    {
        _logger.LogInformation("RenderTemplate endpoint called for template {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to RenderTemplate");
            return Unauthorized();
        }

        var result = await _service.RenderAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                _logger.LogWarning("Template {Id} not found for rendering", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("Failed to render template {Id}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully rendered template {Id} for user {UserId}",
            id, currentUser.Id);

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
