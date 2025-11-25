using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Inquiry.Models;
using Monetaris.Inquiry.Services;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for managing inquiries
/// </summary>
[ApiController]
[Route("api/inquiries")]
[Authorize]
public class InquiryController : ControllerBase
{
    private readonly IInquiryService _inquiryService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<InquiryController> _logger;

    public InquiryController(
        IInquiryService inquiryService,
        IApplicationDbContext context,
        ILogger<InquiryController> logger)
    {
        _inquiryService = inquiryService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all inquiries accessible to the current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InquiryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _inquiryService.GetAllAsync(currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Create a new inquiry
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InquiryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateInquiryRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _inquiryService.CreateAsync(request, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetAll), null, result.Data);
    }

    /// <summary>
    /// Resolve an inquiry
    /// </summary>
    [HttpPut("{id}/resolve")]
    [ProducesResponseType(typeof(InquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Resolve(Guid id, [FromBody] ResolveInquiryRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _inquiryService.ResolveAsync(id, request, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Inquiry not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
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
