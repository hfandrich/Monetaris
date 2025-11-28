using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Collection case entity (Inkassofall) following ZPO workflow
/// </summary>
public class Case : BaseEntity
{
    /// <summary>
    /// Kreditor (creditor) this case belongs to
    /// </summary>
    public Guid KreditorId { get; set; }

    /// <summary>
    /// Debtor this case is against
    /// </summary>
    public Guid DebtorId { get; set; }

    /// <summary>
    /// Agent assigned to this case (optional)
    /// </summary>
    public Guid? AgentId { get; set; }

    // Financial Information
    /// <summary>
    /// Principal amount (Hauptforderung)
    /// </summary>
    public decimal PrincipalAmount { get; set; }

    /// <summary>
    /// Collection/court costs (Mahn-/Gerichtskosten)
    /// </summary>
    public decimal Costs { get; set; }

    /// <summary>
    /// Interest (Zinsen)
    /// </summary>
    public decimal Interest { get; set; }

    /// <summary>
    /// Currency code (default: EUR)
    /// </summary>
    public string Currency { get; set; } = "EUR";

    // Workflow Information
    /// <summary>
    /// Original invoice number
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    /// <summary>
    /// Date of the original invoice
    /// </summary>
    public DateTime InvoiceDate { get; set; }

    /// <summary>
    /// Original due date
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Current workflow status (ZPO-compliant)
    /// </summary>
    public CaseStatus Status { get; set; } = CaseStatus.NEW;

    /// <summary>
    /// When the next action should be taken
    /// </summary>
    public DateTime? NextActionDate { get; set; }

    // Legal Information
    /// <summary>
    /// Competent court for this case
    /// </summary>
    public string CompetentCourt { get; set; } = "Amtsgericht Coburg - Zentrales Mahngericht";

    /// <summary>
    /// Court file number (Aktenzeichen)
    /// </summary>
    public string? CourtFileNumber { get; set; }

    // AI Analysis
    /// <summary>
    /// AI-generated analysis and recommendations
    /// </summary>
    public string? AiAnalysis { get; set; }

    // Claim Details (Forderung)
    /// <summary>
    /// Date when claim originated (Tag der Entstehung)
    /// </summary>
    public DateTime? DateOfOrigin { get; set; }

    /// <summary>
    /// Exact description for statute of limitations (Exakte Beschreibung)
    /// </summary>
    public string? ClaimDescription { get; set; }

    /// <summary>
    /// Interest start date (Zinslauf Beginn)
    /// </summary>
    public DateTime? InterestStartDate { get; set; }

    /// <summary>
    /// Interest rate percentage (Zinshöhe)
    /// </summary>
    public decimal? InterestRate { get; set; }

    /// <summary>
    /// Is variable interest rate tied to base rate (Basiszins gekoppelt)
    /// </summary>
    public bool IsVariableInterest { get; set; } = false;

    /// <summary>
    /// Interest end date (Zinsende)
    /// </summary>
    public DateTime? InterestEndDate { get; set; }

    /// <summary>
    /// Additional costs (Nebenkosten)
    /// </summary>
    public decimal AdditionalCosts { get; set; }

    /// <summary>
    /// Procedure costs (Verfahrenskosten)
    /// </summary>
    public decimal ProcedureCosts { get; set; }

    /// <summary>
    /// Interest accrues on costs (Zinslauf Verfahrenskosten)
    /// </summary>
    public bool InterestOnCosts { get; set; } = false;

    /// <summary>
    /// Statute of limitations date (Verjährungsfrist)
    /// </summary>
    public DateTime? StatuteOfLimitationsDate { get; set; }

    /// <summary>
    /// Payment allocation notes per §§ 366, 367 BGB
    /// </summary>
    public string? PaymentAllocationNotes { get; set; }

    // Computed Properties
    /// <summary>
    /// Total amount (sum of principal, costs, and interest)
    /// </summary>
    public decimal TotalAmount => PrincipalAmount + Costs + Interest;

    // Navigation Properties
    /// <summary>
    /// The kreditor (creditor) this case belongs to
    /// </summary>
    public Kreditor Kreditor { get; set; } = null!;

    /// <summary>
    /// The debtor this case is against
    /// </summary>
    public Debtor Debtor { get; set; } = null!;

    /// <summary>
    /// The agent handling this case
    /// </summary>
    public User? Agent { get; set; }

    /// <summary>
    /// Audit history of all changes to this case
    /// </summary>
    public ICollection<CaseHistory> History { get; set; } = new List<CaseHistory>();

    /// <summary>
    /// Inquiries/questions about this case
    /// </summary>
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
}
