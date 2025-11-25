using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetaris.Document.DTOs;
using Monetaris.Document.Services;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace MonetarisApi.Controllers;

/// <summary>
/// Controller for managing documents
/// </summary>
[ApiController]
[Route("api")]
[Authorize]
public class DocumentController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DocumentController> _logger;

    public DocumentController(
        IDocumentService documentService,
        IApplicationDbContext context,
        ILogger<DocumentController> logger)
    {
        _documentService = documentService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Upload a document for a debtor
    /// </summary>
    [HttpPost("debtors/{debtorId}/documents")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(Guid debtorId, IFormFile file)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _documentService.UploadAsync(debtorId, file, currentUser);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetByDebtor), new { debtorId }, result.Data);
    }

    /// <summary>
    /// Get all documents for a debtor
    /// </summary>
    [HttpGet("debtors/{debtorId}/documents")]
    [ProducesResponseType(typeof(List<DocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByDebtor(Guid debtorId)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _documentService.GetByDebtorIdAsync(debtorId, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Debtor not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                return Forbid();
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Download a document
    /// </summary>
    [HttpGet("documents/{id}/download")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var metadataResult = await _documentService.GetDocumentMetadataAsync(id, currentUser);
        if (!metadataResult.IsSuccess)
        {
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

        var streamResult = await _documentService.DownloadAsync(id, currentUser);
        if (!streamResult.IsSuccess)
        {
            return BadRequest(new { error = streamResult.ErrorMessage });
        }

        var (fileName, contentType) = metadataResult.Data;

        return File(streamResult.Data!, contentType, fileName);
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("documents/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var result = await _documentService.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            if (result.ErrorMessage == "Document not found")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            if (result.ErrorMessage == "Access denied")
            {
                return Forbid();
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return NoContent();
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
