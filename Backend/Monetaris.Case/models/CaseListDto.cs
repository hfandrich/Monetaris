using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Lightweight case DTO for list views
/// </summary>
public class CaseListDto
{
    public Guid Id { get; set; }
    public Guid KreditorId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public string KreditorName { get; set; } = string.Empty;
    public CaseStatus Status { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal Costs { get; set; }
    public decimal Interest { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "EUR";
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? NextActionDate { get; set; }
    public string? CourtFileNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}
