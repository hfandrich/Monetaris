using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Document.Api;

/// <summary>
/// GET endpoint to download document file
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize]
public class DownloadDocument : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DownloadDocument> _logger;

    public DownloadDocument(
        IDocumentService service,
        IApplicationDbContext context,
        ILogger<DownloadDocument> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Download document file stream (authorization checks based on debtor access)
    /// </summary>
    [HttpGet("{id}/download")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("DownloadDocument endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        // Get metadata first
        var metadataResult = await _service.GetDocumentMetadataAsync(id, currentUser);
        if (!metadataResult.IsSuccess)
        {
            _logger.LogWarning("Get document metadata failed: {Error}", metadataResult.ErrorMessage);

            if (metadataResult.ErrorMessage == "Document not found")
            {
                return NotFound(new { error = metadataResult.ErrorMessage });
            }
            if (metadataResult.ErrorMessage == "Access denied")
            {
                return Forbid();
            }
            return BadRequest(new { error = metadataResult.ErrorMessage });
        }

        // Get file stream
        var streamResult = await _service.DownloadAsync(id, currentUser);
        if (!streamResult.IsSuccess)
        {
            _logger.LogWarning("Download document failed: {Error}", streamResult.ErrorMessage);
            return BadRequest(new { error = streamResult.ErrorMessage });
        }

        var (fileName, contentType) = metadataResult.Data;

        _logger.LogInformation("Document {Id} downloaded successfully", id);

        return File(streamResult.Data!, contentType, fileName);
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
