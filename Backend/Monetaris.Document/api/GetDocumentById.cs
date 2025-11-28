using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Document.Api;

/// <summary>
/// GET endpoint to retrieve document metadata by ID
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize]
public class GetDocumentById : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetDocumentById> _logger;

    public GetDocumentById(
        IApplicationDbContext context,
        ILogger<GetDocumentById> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get document metadata by ID (authorization checks based on debtor access)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("GetDocumentById endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var document = await _context.Documents
            .Include(d => d.Debtor)
            .ThenInclude(d => d.Kreditor)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            _logger.LogWarning("Document {Id} not found", id);
            return NotFound(new { error = "Document not found" });
        }

        // Check access based on debtor
        if (!HasAccessToDebtor(document.Debtor, currentUser))
        {
            _logger.LogWarning("Access denied for document {Id} by user {UserId}", id, currentUser.Id);
            return Forbid();
        }

        var documentDto = new DocumentDto
        {
            Id = document.Id,
            DebtorId = document.DebtorId,
            Name = document.Name,
            Type = document.Type,
            SizeBytes = document.SizeBytes,
            PreviewUrl = document.PreviewUrl,
            UploadedAt = document.UploadedAt
        };

        return Ok(documentDto);
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

    private bool HasAccessToDebtor(Shared.Models.Entities.Debtor debtor, User currentUser)
    {
        if (currentUser.Role == Shared.Enums.UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == Shared.Enums.UserRole.CLIENT)
        {
            return currentUser.KreditorId == debtor.KreditorId;
        }

        if (currentUser.Role == Shared.Enums.UserRole.AGENT)
        {
            return _context.UserKreditorAssignments
                .Any(uka => uka.UserId == currentUser.Id && uka.KreditorId == debtor.KreditorId);
        }

        return false;
    }
}
