using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using Monetaris.Template.Models;
using Monetaris.Template.Services;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for managing communication templates
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize]
public class TemplateController : ControllerBase
{
    private readonly ITemplateService _templateService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TemplateController> _logger;

    public TemplateController(
        ITemplateService templateService,
        IApplicationDbContext context,
        ILogger<TemplateController> logger)
    {
        _templateService = templateService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all templates
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TemplateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _templateService.GetAllAsync();

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Get a specific template by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _templateService.GetByIdAsync(id);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Create a new template (ADMIN/AGENT only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,AGENT")]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateTemplateRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _templateService.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Update an existing template (ADMIN/AGENT only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,AGENT")]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTemplateRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _templateService.UpdateAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Delete a template (ADMIN only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _templateService.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return NoContent();
    }

    /// <summary>
    /// Render a template with variable replacement
    /// </summary>
    [HttpPost("{id}/render")]
    [ProducesResponseType(typeof(RenderTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Render(Guid id, [FromBody] RenderTemplateRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _templateService.RenderAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

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
