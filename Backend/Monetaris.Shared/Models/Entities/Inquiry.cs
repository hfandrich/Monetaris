using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Inquiry/question about a case that needs resolution
/// </summary>
public class Inquiry : BaseEntity
{
    /// <summary>
    /// Case this inquiry is about
    /// </summary>
    public Guid CaseId { get; set; }

    /// <summary>
    /// The question or inquiry text
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// The answer or resolution (optional until resolved)
    /// </summary>
    public string? Answer { get; set; }

    /// <summary>
    /// Status of the inquiry (OPEN or RESOLVED)
    /// </summary>
    public InquiryStatus Status { get; set; } = InquiryStatus.OPEN;

    /// <summary>
    /// User who created the inquiry
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// When the inquiry was resolved (if applicable)
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    // Navigation Properties
    /// <summary>
    /// The case this inquiry is about
    /// </summary>
    public Case Case { get; set; } = null!;

    /// <summary>
    /// The user who created this inquiry
    /// </summary>
    public User CreatedByUser { get; set; } = null!;
}
