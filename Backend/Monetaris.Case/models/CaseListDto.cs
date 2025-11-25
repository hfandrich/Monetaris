using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Lightweight case DTO for list views
/// </summary>
public class CaseListDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public CaseStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime? NextActionDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
