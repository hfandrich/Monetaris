using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Request model for creating a new debtor
/// </summary>
public class CreateDebtorRequest
{
    public Guid KreditorId { get; set; }
    public Guid? AgentId { get; set; }

    // Identity Information
    public EntityType EntityType { get; set; } = EntityType.NATURAL_PERSON;
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
    public AddressStatus AddressStatus { get; set; } = AddressStatus.UNKNOWN;

    // Representative & Death Information
    public string? RepresentedBy { get; set; }
    public bool IsDeceased { get; set; } = false;
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

    // Risk Assessment
    public RiskScore RiskScore { get; set; } = RiskScore.C;
    public string? Notes { get; set; }
}
