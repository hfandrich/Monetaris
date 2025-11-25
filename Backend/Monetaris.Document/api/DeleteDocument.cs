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
/// DELETE endpoint to remove a document
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize(Roles = "ADMIN,AGENT")]
public class DeleteDocument : ControllerBase
{
    private readonly IDocumentService _service;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteDocument> _logger;

    public DeleteDocument(
        IDocumentService service,
        IApplicationDbContext context,
        ILogger<DeleteDocument> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Delete a document (ADMIN and AGENT only)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Handle(Guid id)
    {
        _logger.LogInformation("DeleteDocument endpoint called for ID: {Id}", id);

        var currentUser = await GetCurrentUserAsync();
        if (currentUser == null)
        {
            _logger.LogWarning("Unauthorized access attempt - user not found");
            return Unauthorized();
        }

        var result = await _service.DeleteAsync(id, currentUser);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Delete document {Id} failed: {Error}", id, result.ErrorMessage);

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

        _logger.LogInformation("Document {Id} deleted successfully", id);

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
