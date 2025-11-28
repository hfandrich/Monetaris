using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Full case data transfer object with all details
/// </summary>
public class CaseDto
{
    public Guid Id { get; set; }
    public Guid KreditorId { get; set; }
    public Guid DebtorId { get; set; }
    public Guid? AgentId { get; set; }

    // Financial Information
    public decimal PrincipalAmount { get; set; }
    public decimal Costs { get; set; }
    public decimal Interest { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "EUR";

    // Workflow Information
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public CaseStatus Status { get; set; }
    public DateTime? NextActionDate { get; set; }

    // Legal Information
    public string CompetentCourt { get; set; } = string.Empty;
    public string? CourtFileNumber { get; set; }
    public string? AiAnalysis { get; set; }

    // Claim Details
    public DateTime? DateOfOrigin { get; set; }
    public string? ClaimDescription { get; set; }
    public DateTime? InterestStartDate { get; set; }
    public decimal? InterestRate { get; set; }
    public bool IsVariableInterest { get; set; }
    public DateTime? InterestEndDate { get; set; }
    public decimal AdditionalCosts { get; set; }
    public decimal ProcedureCosts { get; set; }
    public bool InterestOnCosts { get; set; }
    public DateTime? StatuteOfLimitationsDate { get; set; }
    public string? PaymentAllocationNotes { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public string KreditorName { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public string? AgentName { get; set; }
}
