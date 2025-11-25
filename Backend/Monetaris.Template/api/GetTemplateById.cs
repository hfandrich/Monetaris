using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Template.Services;
using Monetaris.Template.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Template.Api;

/// <summary>
/// GET endpoint to retrieve a single template by ID
/// </summary>
[ApiController]
[Route("api/templates")]
[Authorize]
public class GetTemplateById : ControllerBase
{
    private readonly ITemplateService _service;
    private readonly ILogger<GetTemplateById> _logger;

    public GetTemplateById(
        ITemplateService service,
        ILogger<GetTemplateById> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get template by ID
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>Template details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetTemplateById endpoint called for ID: {Id}", id);

        var result = await _service.GetByIdAsync(id);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Template not found")
            {
                _logger.LogWarning("Template {Id} not found", id);
                return NotFound(new { error = result.ErrorMessage });
            }

            _logger.LogWarning("GetTemplateById failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved template {Id}", id);
        return Ok(result.Data);
    }
}
