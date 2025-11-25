using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Debtor entity (Schuldner) - person or company owing money
/// </summary>
public class Debtor : BaseEntity
{
    /// <summary>
    /// Tenant (creditor) this debtor belongs to
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Agent assigned to this debtor (optional)
    /// </summary>
    public Guid? AgentId { get; set; }

    // Identity Information
    /// <summary>
    /// Whether the debtor is a company
    /// </summary>
    public bool IsCompany { get; set; }

    /// <summary>
    /// Company name (required if IsCompany = true)
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// First name (required if IsCompany = false)
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name (required if IsCompany = false)
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Email address
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Phone number
    /// </summary>
    public string? Phone { get; set; }

    // Address Information (embedded)
    /// <summary>
    /// Street address
    /// </summary>
    public string? Street { get; set; }

    /// <summary>
    /// ZIP/Postal code
    /// </summary>
    public string? ZipCode { get; set; }

    /// <summary>
    /// City
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// Country
    /// </summary>
    public string Country { get; set; } = "Deutschland";

    /// <summary>
    /// Address validation status
    /// </summary>
    public AddressStatus AddressStatus { get; set; } = AddressStatus.UNKNOWN;

    /// <summary>
    /// When the address was last verified
    /// </summary>
    public DateTime? AddressLastChecked { get; set; }

    // Risk & Statistics
    /// <summary>
    /// Collection risk score (A-E)
    /// </summary>
    public RiskScore RiskScore { get; set; } = RiskScore.C;

    /// <summary>
    /// Total debt across all cases
    /// </summary>
    public decimal TotalDebt { get; set; }

    /// <summary>
    /// Number of open cases
    /// </summary>
    public int OpenCases { get; set; }

    /// <summary>
    /// Internal notes about the debtor
    /// </summary>
    public string? Notes { get; set; }

    // Navigation Properties
    /// <summary>
    /// The tenant this debtor belongs to
    /// </summary>
    public Tenant Tenant { get; set; } = null!;

    /// <summary>
    /// The agent handling this debtor
    /// </summary>
    public User? Agent { get; set; }

    /// <summary>
    /// Collection cases for this debtor
    /// </summary>
    public ICollection<Case> Cases { get; set; } = new List<Case>();

    /// <summary>
    /// Documents related to this debtor
    /// </summary>
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
