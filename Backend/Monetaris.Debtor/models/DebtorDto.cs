using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Full debtor data transfer object with statistics
/// </summary>
public class DebtorDto
{
    public Guid Id { get; set; }
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
    public AddressStatus AddressStatus { get; set; }
    public DateTime? AddressLastChecked { get; set; }

    // Risk & Statistics
    public RiskScore RiskScore { get; set; }
    public decimal TotalDebt { get; set; }
    public int OpenCases { get; set; }
    public string? Notes { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public string TenantName { get; set; } = string.Empty;
    public string? AgentName { get; set; }

    // Display Name
    public string DisplayName => IsCompany ? CompanyName ?? "Unknown" : $"{FirstName} {LastName}";
}
