using Monetaris.Shared.Enums;

namespace Monetaris.Inquiry.Models;

/// <summary>
/// Inquiry data transfer object
/// </summary>
public class InquiryDto
{
    public Guid Id { get; set; }
    public Guid CaseId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string? Answer { get; set; }
    public InquiryStatus Status { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public string CaseNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
}
