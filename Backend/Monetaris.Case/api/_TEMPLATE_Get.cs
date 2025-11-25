using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Services;
using Monetaris.Case.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Case.Api;

/// <summary>
/// 🤖 TEMPLATE for GET endpoints
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/cases")]
public class _TEMPLATE_Get : ControllerBase
{
    private readonly ICaseService _service;
    private readonly ILogger<_TEMPLATE_Get> _logger;

    // 🤖 AI: Constructor injection pattern - ALWAYS use this
    public _TEMPLATE_Get(ICaseService service, ILogger<_TEMPLATE_Get> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: Change method name, route, and service call
    /// </summary>
    [HttpGet]  // 🤖 AI: Use [HttpGet], [HttpGet("{id}")], etc.
    [ProducesResponseType(typeof(List<CaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()  // 🤖 AI: Can add parameters here
    {
        _logger.LogInformation("Template GET endpoint called");

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call appropriate service method
        // var result = await _service.GetAllAsync(currentUser);
        var result = Result<List<CaseDto>>.Failure("Template not implemented");

        // 🤖 AI: ALWAYS use Result<T> pattern - DO NOT change this
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Template GET failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}
