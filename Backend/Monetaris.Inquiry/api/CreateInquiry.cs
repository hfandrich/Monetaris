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
/// POST endpoint to create a new inquiry
/// </summary>
[ApiController]
[Route("api/inquiries")]
[Authorize(Roles = "ADMIN,AGENT,CLIENT")]
public class CreateInquiry : ControllerBase
{
    private readonly IInquiryService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateInquiry> _logger;

    public CreateInquiry(
        IInquiryService service,
        IApplicationDbContext context,
        ILogger<CreateInquiry> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new inquiry (ADMIN, AGENT, CLIENT can create)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InquiryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Handle([FromBody] CreateInquiryRequest request)
    {
        _logger.LogInformation("CreateInquiry endpoint called for case {CaseId}", request.CaseId);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("CreateInquiry failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Inquiry created successfully: {InquiryId}", result.Data!.Id);

        return CreatedAtAction(
            nameof(GetInquiries.Handle),
            null,
            result.Data
        );
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
