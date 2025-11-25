using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Services;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;
using System.Security.Claims;

namespace Monetaris.Document.Api;

/// <summary>
/// POST endpoint to upload a document for a debtor
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize(Roles = "ADMIN,AGENT,CLIENT")]
public class UploadDocument : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UploadDocument> _logger;

    public UploadDocument(
        IDocumentService service,
        IApplicationDbContext context,
        ILogger<UploadDocument> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Upload a new document for a debtor
    /// </summary>
    /// <param name="debtorId">Debtor ID to attach document to</param>
    /// <param name="file">Document file (max 10MB, allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX)</param>
    [HttpPost]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Handle([FromForm] Guid debtorId, [FromForm] IFormFile file)
    {
        _logger.LogInformation("UploadDocument endpoint called for debtor {DebtorId}", debtorId);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.UploadAsync(debtorId, file, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Upload document failed: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Document uploaded successfully: {DocumentId}", result.Data!.Id);

        return CreatedAtAction(
            nameof(GetDocumentById.Handle),
            new { id = result.Data.Id },
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
