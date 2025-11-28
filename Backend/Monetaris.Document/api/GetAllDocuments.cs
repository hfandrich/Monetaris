using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Document.Api;

/// <summary>
/// GET endpoint to retrieve all documents (filtered by debtorId)
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize]
public class GetAllDocuments : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAllDocuments> _logger;

    public GetAllDocuments(
        IApplicationDbContext context,
        ILogger<GetAllDocuments> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all documents for a debtor (authorization checks based on debtor access)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(DocumentListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromQuery] Guid? debtorId)
    {
        _logger.LogInformation("GetAllDocuments endpoint called with debtorId: {DebtorId}", debtorId);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var query = _context.Documents
            .Include(d => d.Debtor)
            .ThenInclude(d => d.Kreditor)
            .AsQueryable();

        // Filter by debtorId if provided
        if (debtorId.HasValue)
        {
            query = query.Where(d => d.DebtorId == debtorId.Value);
        }

        // Apply access control based on user role
        if (currentUser.Role == Shared.Enums.UserRole.CLIENT)
        {
            query = query.Where(d => d.Debtor.KreditorId == currentUser.KreditorId);
        }
        else if (currentUser.Role == Shared.Enums.UserRole.AGENT)
        {
            var assignedKreditorIds = await _context.UserKreditorAssignments
                .Where(uka => uka.UserId == currentUser.Id)
                .Select(uka => uka.KreditorId)
                .ToListAsync();
            query = query.Where(d => assignedKreditorIds.Contains(d.Debtor.KreditorId));
        }
        // ADMIN can see all

        var documents = await query
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        var documentDtos = documents.Select(d => new DocumentDto
        {
            Id = d.Id,
            DebtorId = d.DebtorId,
            Name = d.Name,
            Type = d.Type,
            SizeBytes = d.SizeBytes,
            PreviewUrl = d.PreviewUrl,
            UploadedAt = d.UploadedAt
        }).ToList();

        _logger.LogInformation("Returning {Count} documents", documentDtos.Count);

        return Ok(new DocumentListResponse
        {
            Data = documentDtos,
            Total = documentDtos.Count
        });
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

/// <summary>
/// Response wrapper for document list
/// </summary>
public class DocumentListResponse
{
    public List<DocumentDto> Data { get; set; } = new();
    public int Total { get; set; }
}
