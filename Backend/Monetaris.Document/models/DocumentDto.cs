using Monetaris.Shared.Enums;

namespace Monetaris.Document.Models;

/// <summary>
/// Document data transfer object
/// </summary>
public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid DebtorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DocumentType Type { get; set; }
    public long SizeBytes { get; set; }
    public string? PreviewUrl { get; set; }
    public DateTime UploadedAt { get; set; }

    // Display
    public string SizeFormatted => FormatFileSize(SizeBytes);

    private static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
