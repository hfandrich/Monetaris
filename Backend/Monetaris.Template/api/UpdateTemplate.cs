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
/// PUT endpoint to update an existing template (ADMIN only)
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize(Roles = "ADMIN")]
public class UpdateTemplate : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateTemplate> _logger;

    public UpdateTemplate(
        ITemplateService service,
        IApplicationDbContext context,
        ILogger<UpdateTemplate> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing template
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <param name="request">Template update request</param>
    /// <returns>Updated template</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateTemplateRequest request)
    {
        _logger.LogInformation("UpdateTemplate endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTemplate");
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                _logger.LogWarning("Template {Id} not found for update", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("Failed to update template {Id}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully updated template {Id} by user {UserId}",
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
