using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Inquiry.Services;
using Monetaris.Inquiry.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Inquiry.Api;

/// <summary>
/// PUT endpoint to resolve an inquiry
/// </summary>
[ApiController]
[Route("api/inquiries")]
[Authorize(Roles = "ADMIN,AGENT")]
public class ResolveInquiry : ControllerBase
{
    private readonly IInquiryService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ResolveInquiry> _logger;

    public ResolveInquiry(
        IInquiryService service,
        IApplicationDbContext context,
        ILogger<ResolveInquiry> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Resolve an inquiry (ADMIN and AGENT only)
    /// </summary>
    [HttpPut("{id}/resolve")]
    [ProducesResponseType(typeof(InquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id, [FromBody] ResolveInquiryRequest request)
    {
        _logger.LogInformation("ResolveInquiry endpoint called for inquiry {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.ResolveAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("ResolveInquiry failed: {Error}", result.ErrorMessage);

            if (result.ErrorMessage.Contains("not found"))
            {
                return NotFound(new { error = result.ErrorMessage });
            }

            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Inquiry {Id} resolved successfully", id);

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
