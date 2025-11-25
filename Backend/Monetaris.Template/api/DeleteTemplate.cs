using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Template.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using System.Security.Claims;

namespace Monetaris.Template.Api;

/// <summary>
/// DELETE endpoint to remove a template (ADMIN only)
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize(Roles = "ADMIN")]
public class DeleteTemplate : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteTemplate> _logger;

    public DeleteTemplate(
        ITemplateService service,
        IApplicationDbContext context,
        ILogger<DeleteTemplate> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Delete a template
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>204 No Content on success</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("DeleteTemplate endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to DeleteTemplate");
            return Unauthorized();
        }

        var result = await _service.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                _logger.LogWarning("Template {Id} not found for deletion", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("Failed to delete template {Id}: {Error}",
                id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully deleted template {Id} by user {UserId}",
            id, currentUser.Id);

        return NoContent();
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
