using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Document.Api;

/// <summary>
/// 🤖 TEMPLATE for POST endpoints (Create operations)
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/documents")]
public class _TEMPLATE_Post : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly ILogger<_TEMPLATE_Post> _logger;

    public _TEMPLATE_Post(IDocumentService service, ILogger<_TEMPLATE_Post> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: POST endpoints create new resources
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromBody] object request)
    {
        _logger.LogInformation("Creating new document");

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call service to create
        // var result = await _service.CreateAsync(request, currentUser);
        var result = Result<DocumentDto>.Failure("Template not implemented");

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Create document failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        // 🤖 AI: POST returns 201 Created with Location header
        return CreatedAtAction(
            nameof(GetDocumentById.Handle),  // 🤖 AI: Reference the GET endpoint
            new { id = result.Data!.Id },
            result.Data
        );
    }
}
