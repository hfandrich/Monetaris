using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Shared.Models;

namespace Monetaris.Kreditor.Api;

/// <summary>
/// 🤖 TEMPLATE for DELETE endpoints
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/kreditoren")]
public class _TEMPLATE_Delete : ControllerBase
{
    private readonly IKreditorService _service;
    private readonly ILogger<_TEMPLATE_Delete> _logger;

    public _TEMPLATE_Delete(IKreditorService service, ILogger<_TEMPLATE_Delete> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: DELETE endpoints remove resources
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("Deleting kreditor: {Id}", id);

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call service to delete
        // var result = await _service.DeleteAsync(id, currentUser);
        var result = Result.Failure("Template not implemented");

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Delete kreditor {Id} failed: {Error}", id, result.ErrorMessage);
            return NotFound(new { error = result.ErrorMessage });
        }

        // 🤖 AI: DELETE returns 204 No Content on success
        return NoContent();
    }
}
