using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Full debtor data transfer object with statistics
/// </summary>
public class DebtorDto
{
    public Guid Id { get; set; }
    public Guid KreditorId { get; set; }
    public Guid? AgentId { get; set; }

    // Identity Information
    public EntityType EntityType { get; set; }
    public string? CompanyName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? BirthName { get; set; }
    public Gender? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BirthPlace { get; set; }
    public string? BirthCountry { get; set; }
    public string? Email { get; set; }

    // Address Information
    public string? Street { get; set; }
    public string? HouseNumber { get; set; }
    public string? ZipCode { get; set; }
    public string? City { get; set; }
    public string? CityDistrict { get; set; }
    public string? Floor { get; set; }
    public DoorPosition? DoorPosition { get; set; }
    public string? AdditionalAddressInfo { get; set; }
    public string? POBox { get; set; }
    public string? POBoxZipCode { get; set; }
    public string Country { get; set; } = "Deutschland";
    public AddressStatus AddressStatus { get; set; }
    public DateTime? AddressLastChecked { get; set; }

    // Representative & Death Information
    public string? RepresentedBy { get; set; }
    public bool IsDeceased { get; set; }
    public string? PlaceOfDeath { get; set; }

    // Extended Contact Fields
    public string? PhoneLandline { get; set; }
    public string? PhoneMobile { get; set; }
    public string? Fax { get; set; }
    public string? EboAddress { get; set; }

    // Banking Information
    public string? BankIBAN { get; set; }
    public string? BankBIC { get; set; }
    public string? BankName { get; set; }

    // Legal Entity Specific Fields
    public string? RegisterCourt { get; set; }
    public string? RegisterNumber { get; set; }
    public string? VatId { get; set; }

    // Partnership Specific
    public string? Partners { get; set; }

    // Business Reference
    public string? FileReference { get; set; }

    // Risk & Statistics
    public RiskScore RiskScore { get; set; }
    public decimal TotalDebt { get; set; }
    public int OpenCases { get; set; }
    public string? Notes { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public string KreditorName { get; set; } = string.Empty;
    public string? AgentName { get; set; }

    // Backwards Compatibility
    public bool IsCompany => EntityType != EntityType.NATURAL_PERSON;
    public string? Phone => PhoneLandline ?? PhoneMobile;

    // Display Name
    public string DisplayName => EntityType switch
    {
        EntityType.LEGAL_ENTITY => CompanyName ?? "Unbekannt",
        EntityType.PARTNERSHIP => CompanyName ?? "Unbekannte Gesellschaft",
        _ => $"{FirstName} {LastName}".Trim()
    };
}
