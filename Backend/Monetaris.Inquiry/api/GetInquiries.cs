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
/// GET endpoint to retrieve all inquiries accessible to the current user
/// </summary>
[ApiController]
[Route("api/inquiries")]
[Authorize]
public class GetInquiries : ControllerBase
{
    private readonly IInquiryService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetInquiries> _logger;

    public GetInquiries(
        IInquiryService service,
        IApplicationDbContext context,
        ILogger<GetInquiries> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all inquiries (scoped by user role and access)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InquiryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Handle()
    {
        _logger.LogInformation("GetInquiries endpoint called");

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.GetAllAsync(currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("GetInquiries failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

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
