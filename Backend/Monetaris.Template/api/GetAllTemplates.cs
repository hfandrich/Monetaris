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
/// GET endpoint to retrieve all communication templates
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize]
public class GetAllTemplates : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAllTemplates> _logger;

    public GetAllTemplates(
        ITemplateService service,
        IApplicationDbContext context,
        ILogger<GetAllTemplates> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all communication templates (filtered by user role and tenant access)
    /// </summary>
    /// <returns>List of accessible templates</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<TemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetAllTemplates endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt to GetAllTemplates");
            return Unauthorized();
        }

        var result = await _service.GetAllAsync(currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetAllTemplates failed for user {UserId}: {Error}",
                currentUser.Id, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved {Count} templates for user {UserId}",
            result.Data!.Count, currentUser.Id);
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
