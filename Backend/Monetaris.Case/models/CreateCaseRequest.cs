namespace Monetaris.Case.Models;

/// <summary>
/// Request model for creating a new case
/// </summary>
public class CreateCaseRequest
{
    public Guid TenantId { get; set; }
    public Guid DebtorId { get; set; }
    public Guid? AgentId { get; set; }

    // Financial Information
    public decimal PrincipalAmount { get; set; }
    public decimal Costs { get; set; } = 0;
    public decimal Interest { get; set; } = 0;
    public string Currency { get; set; } = "EUR";

    // Workflow Information
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }

    // Legal Information
    public string CompetentCourt { get; set; } = "Amtsgericht Coburg - Zentrales Mahngericht";
    public string? CourtFileNumber { get; set; }
}
