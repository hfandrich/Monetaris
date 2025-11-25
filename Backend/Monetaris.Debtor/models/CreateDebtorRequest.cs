using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Request model for creating a new debtor
/// </summary>
public class CreateDebtorRequest
{
    public Guid TenantId { get; set; }
    public Guid? AgentId { get; set; }

    // Identity Information
    public bool IsCompany { get; set; }
    public string? CompanyName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Address Information
    public string? Street { get; set; }
    public string? ZipCode { get; set; }
    public string? City { get; set; }
    public string Country { get; set; } = "Deutschland";
    public AddressStatus AddressStatus { get; set; } = AddressStatus.UNKNOWN;

    // Risk Assessment
    public RiskScore RiskScore { get; set; } = RiskScore.C;
    public string? Notes { get; set; }
}
