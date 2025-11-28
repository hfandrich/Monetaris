using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Document.Api;

/// <summary>
/// 🤖 TEMPLATE for PUT endpoints (Update operations)
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/documents")]
public class _TEMPLATE_Put : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly ILogger<_TEMPLATE_Put> _logger;

    public _TEMPLATE_Put(IDocumentService service, ILogger<_TEMPLATE_Put> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: PUT endpoints update existing resources
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] object request)
    {
        _logger.LogInformation("Updating document: {Id}", id);

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call service to update
        // var result = await _service.UpdateAsync(id, request, currentUser);
        var result = Result<DocumentDto>.Failure("Template not implemented");

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Update document {Id} failed: {Error}", id, result.ErrorMessage);

            // 🤖 AI: Return 404 if not found, 400 for validation
            return result.ErrorMessage!.Contains("not found")
                ? NotFound(new { error = result.ErrorMessage })
                : BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}
