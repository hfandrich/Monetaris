using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Document.Models;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Document.Services;

/// <summary>
/// Service implementation for Document operations
/// </summary>
public class DocumentService : IDocumentService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DocumentService> _logger;
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
    private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx" };
    private readonly string _uploadPath;

    public DocumentService(IApplicationDbContext context, ILogger<DocumentService> logger)
    {
        _context = context;
        _logger = logger;
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<Result<DocumentDto>> UploadAsync(Guid debtorId, IFormFile file, User currentUser)
    {
        try
        {
            // Verify debtor exists and user has access
            var debtor = await _context.Debtors
                .Include(d => d.Tenant)
                .FirstOrDefaultAsync(d => d.Id == debtorId);

            if (debtor == null)
            {
                return Result<DocumentDto>.Failure("Debtor not found");
            }

            if (!await HasAccessToDebtor(debtor, currentUser))
            {
                return Result<DocumentDto>.Failure("Access denied");
            }

            // Validate file
            if (file == null || file.Length == 0)
            {
                return Result<DocumentDto>.Failure("No file provided");
            }

            if (file.Length > MaxFileSize)
            {
                return Result<DocumentDto>.Failure($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024} MB");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return Result<DocumentDto>.Failure($"File type '{extension}' is not allowed");
            }

            // Determine document type
            var docType = GetDocumentType(extension);

            // Create debtor-specific directory
            var debtorDir = Path.Combine(_uploadPath, debtorId.ToString());
            if (!Directory.Exists(debtorDir))
            {
                Directory.CreateDirectory(debtorDir);
            }

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(debtorDir, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document entity
            var document = new Shared.Models.Entities.Document
            {
                DebtorId = debtorId,
                Name = file.FileName,
                Type = docType,
                SizeBytes = file.Length,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            var documentDto = MapToDto(document);

            _logger.LogInformation("Document {DocumentId} uploaded for debtor {DebtorId} by user {UserId}",
                document.Id, debtorId, currentUser.Id);

            return Result<DocumentDto>.Success(documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for debtor {DebtorId} by user {UserId}",
                debtorId, currentUser.Id);
            return Result<DocumentDto>.Failure("An error occurred while uploading the document");
        }
    }

    public async Task<Result<List<DocumentDto>>> GetByDebtorIdAsync(Guid debtorId, User currentUser)
    {
        try
        {
            var debtor = await _context.Debtors
                .Include(d => d.Tenant)
                .FirstOrDefaultAsync(d => d.Id == debtorId);

            if (debtor == null)
            {
                return Result<List<DocumentDto>>.Failure("Debtor not found");
            }

            if (!await HasAccessToDebtor(debtor, currentUser))
            {
                return Result<List<DocumentDto>>.Failure("Access denied");
            }

            var documents = await _context.Documents
                .Where(d => d.DebtorId == debtorId)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var documentDtos = documents.Select(MapToDto).ToList();

            _logger.LogInformation("Retrieved {Count} documents for debtor {DebtorId} by user {UserId}",
                documentDtos.Count, debtorId, currentUser.Id);

            return Result<List<DocumentDto>>.Success(documentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documents for debtor {DebtorId} by user {UserId}",
                debtorId, currentUser.Id);
            return Result<List<DocumentDto>>.Failure("An error occurred while retrieving documents");
        }
    }

    public async Task<Result<Stream>> DownloadAsync(Guid id, User currentUser)
    {
        try
        {
            var document = await _context.Documents
                .Include(d => d.Debtor)
                .ThenInclude(d => d.Tenant)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return Result<Stream>.Failure("Document not found");
            }

            if (!await HasAccessToDebtor(document.Debtor, currentUser))
            {
                return Result<Stream>.Failure("Access denied");
            }

            if (!File.Exists(document.FilePath))
            {
                _logger.LogWarning("Document file not found at path: {FilePath}", document.FilePath);
                return Result<Stream>.Failure("Document file not found on disk");
            }

            var stream = new FileStream(document.FilePath, FileMode.Open, FileAccess.Read, FileShare.Read);

            _logger.LogInformation("Document {DocumentId} downloaded by user {UserId}", id, currentUser.Id);

            return Result<Stream>.Success(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document {DocumentId} by user {UserId}", id, currentUser.Id);
            return Result<Stream>.Failure("An error occurred while downloading the document");
        }
    }

    public async Task<Result<(string FileName, string ContentType)>> GetDocumentMetadataAsync(Guid id, User currentUser)
    {
        try
        {
            var document = await _context.Documents
                .Include(d => d.Debtor)
                .ThenInclude(d => d.Tenant)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return Result<(string, string)>.Failure("Document not found");
            }

            if (!await HasAccessToDebtor(document.Debtor, currentUser))
            {
                return Result<(string, string)>.Failure("Access denied");
            }

            var contentType = GetContentType(document.Type);

            return Result<(string, string)>.Success((document.Name, contentType));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document metadata {DocumentId}", id);
            return Result<(string, string)>.Failure("An error occurred while retrieving document metadata");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            var document = await _context.Documents
                .Include(d => d.Debtor)
                .ThenInclude(d => d.Tenant)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return Result.Failure("Document not found");
            }

            if (!await HasAccessToDebtor(document.Debtor, currentUser))
            {
                return Result.Failure("Access denied");
            }

            // Delete physical file
            if (File.Exists(document.FilePath))
            {
                File.Delete(document.FilePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the document");
        }
    }

    // Helper methods

    private async Task<bool> HasAccessToDebtor(Shared.Models.Entities.Debtor debtor, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.TenantId == debtor.TenantId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserTenantAssignments
                .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == debtor.TenantId);
        }

        return false;
    }

    private DocumentType GetDocumentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".pdf" => DocumentType.PDF,
            ".jpg" or ".jpeg" or ".png" => DocumentType.IMAGE,
            ".doc" or ".docx" => DocumentType.WORD,
            ".xls" or ".xlsx" => DocumentType.EXCEL,
            _ => DocumentType.PDF
        };
    }

    private string GetContentType(DocumentType docType)
    {
        return docType switch
        {
            DocumentType.PDF => "application/pdf",
            DocumentType.IMAGE => "image/jpeg",
            DocumentType.WORD => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            DocumentType.EXCEL => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };
    }

    private DocumentDto MapToDto(Shared.Models.Entities.Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            DebtorId = document.DebtorId,
            Name = document.Name,
            Type = document.Type,
            SizeBytes = document.SizeBytes,
            PreviewUrl = document.PreviewUrl,
            UploadedAt = document.UploadedAt
        };
    }
}
