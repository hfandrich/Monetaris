using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// 🤖 TEMPLATE for PUT endpoints (Update operations)
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/kreditoren")]
public class _TEMPLATE_Put : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly ILogger<_TEMPLATE_Put> _logger;

    public _TEMPLATE_Put(IKreditorService service, ILogger<_TEMPLATE_Put> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: PUT endpoints update existing resources
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(KreditorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] UpdateKreditorRequest request)
    {
        _logger.LogInformation("Updating kreditor: {Id}", id);

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call service to update
        // var result = await _service.UpdateAsync(id, request, currentUser);
        var result = Result<KreditorDto>.Failure("Template not implemented");

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Update kreditor {Id} failed: {Error}", id, result.ErrorMessage);

            // 🤖 AI: Return 404 if not found, 400 for validation
            return result.ErrorMessage!.Contains("not found")
                ? NotFound(new { error = result.ErrorMessage })
                : BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}
