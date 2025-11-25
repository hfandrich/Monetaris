using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Services;
using Monetaris.Case.Models;
using Monetaris.Shared.Models;

namespace Monetaris.Case.Api;

/// <summary>
/// 🤖 TEMPLATE for POST endpoints (Create operations)
/// AI: Copy this file and modify only the marked sections
/// </summary>
[ApiController]
[Route("api/cases")]
public class _TEMPLATE_Post : ControllerBase
{
    private readonly ICaseService _service;
    private readonly ILogger<_TEMPLATE_Post> _logger;

    public _TEMPLATE_Post(ICaseService service, ILogger<_TEMPLATE_Post> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// 🤖 AI: POST endpoints create new resources
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Handle([FromBody] CreateCaseRequest request)
    {
        _logger.LogInformation("Creating new case: {InvoiceNumber}", request.InvoiceNumber);

        // 🤖 AI: REPLACE THIS - Get current user from claims
        // var currentUser = await GetCurrentUserAsync();
        // if (currentUser == null) return Unauthorized();

        // 🤖 AI: Call service to create
        // var result = await _service.CreateAsync(request, currentUser);
        var result = Result<CaseDto>.Failure("Template not implemented");

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Create case failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        // 🤖 AI: POST returns 201 Created with Location header
        return CreatedAtAction(
            nameof(GetCaseById.Handle),  // 🤖 AI: Reference the GET endpoint
            new { id = result.Data!.Id },
            result.Data
        );
    }
}
