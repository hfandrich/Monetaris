using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Document.Api;

/// <summary>
/// 🤖 TEMPLATE for GET endpoints
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/documents")]
public class _TEMPLATE_Get : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly ILogger<_TEMPLATE_Get> _logger;

    // 🤖 AI: Constructor injection pattern - ALWAYS use this
    public _TEMPLATE_Get(IDocumentService service, ILogger<_TEMPLATE_Get> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: Change method name, route, and service call
    /// </summary>
    [HttpGet]  // 🤖 AI: Use [HttpGet], [HttpGet("{id}")], etc.
    [ProducesResponseType(typeof(List<DocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle()  // 🤖 AI: Can add parameters here
    {
        _logger.LogInformation("Template GET endpoint called");

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call appropriate service method
        // var result = await _service.GetAllAsync(currentUser);
        var result = Result<List<DocumentDto>>.Failure("Template not implemented");

        // 🤖 AI: ALWAYS use Result<T> pattern - DO NOT change this
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Template GET failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}
