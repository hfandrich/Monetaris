using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Request model for updating an existing case
/// </summary>
public class UpdateCaseRequest
{
    public Guid? AgentId { get; set; }

    // Financial Information
    public decimal PrincipalAmount { get; set; }
    public decimal Costs { get; set; }
    public decimal Interest { get; set; }
    public string Currency { get; set; } = "EUR";

    // Legal Information
    public string CompetentCourt { get; set; } = string.Empty;
    public string? CourtFileNumber { get; set; }
    public string? AiAnalysis { get; set; }

    // Status Update (for Kanban drag & drop)
    public CaseStatus? Status { get; set; }
}
