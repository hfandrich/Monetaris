using Microsoft.AspNetCore.Http;
using Monetaris.Document.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Document.Services;

/// <summary>
/// Service interface for Document operations
/// </summary>
public interface IDocumentService
{
    /// <summary>
    /// Upload a document for a debtor
    /// </summary>
    Task<Result<DocumentDto>> UploadAsync(Guid debtorId, IFormFile file, User currentUser);

    /// <summary>
    /// Get all documents for a debtor
    /// </summary>
    Task<Result<List<DocumentDto>>> GetByDebtorIdAsync(Guid debtorId, User currentUser);

    /// <summary>
    /// Download a document
    /// </summary>
    Task<Result<Stream>> DownloadAsync(Guid id, User currentUser);

    /// <summary>
    /// Get document metadata (for download filename and content type)
    /// </summary>
    Task<Result<(string FileName, string ContentType)>> GetDocumentMetadataAsync(Guid id, User currentUser);

    /// <summary>
    /// Delete a document
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);
}
