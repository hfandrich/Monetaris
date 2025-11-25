using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Document entity for file attachments (PDFs, images, etc.)
/// </summary>
public class Document : BaseEntity
{
    /// <summary>
    /// Debtor this document belongs to
    /// </summary>
    public Guid DebtorId { get; set; }

    /// <summary>
    /// Document filename
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Type of document (PDF, IMAGE, WORD, EXCEL)
    /// </summary>
    public DocumentType Type { get; set; }

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long SizeBytes { get; set; }

    /// <summary>
    /// File path in storage
    /// </summary>
    public string FilePath { get; set; } = string.Empty;

    /// <summary>
    /// URL for document preview (optional)
    /// </summary>
    public string? PreviewUrl { get; set; }

    /// <summary>
    /// When the document was uploaded
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    /// <summary>
    /// The debtor this document belongs to
    /// </summary>
    public Debtor Debtor { get; set; } = null!;
}
