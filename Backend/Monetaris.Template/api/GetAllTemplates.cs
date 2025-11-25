using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Template.Services;
using Monetaris.Template.Models;
using Monetaris.Shared.Models;

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
    private readonly ILogger<GetAllTemplates> _logger;

    public GetAllTemplates(
        ITemplateService service,
        ILogger<GetAllTemplates> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all communication templates
    /// </summary>
    /// <returns>List of all templates</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<TemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetAllTemplates endpoint called");

        var result = await _service.GetAllAsync();

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetAllTemplates failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Successfully retrieved {Count} templates", result.Data!.Count);
        return Ok(result.Data);
    }
}
