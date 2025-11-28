using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Debtor entity (Schuldner) - person or company owing money
/// </summary>
public class Debtor : BaseEntity
{
    /// <summary>
    /// Kreditor (creditor) this debtor belongs to
    /// </summary>
    public Guid KreditorId { get; set; }

    /// <summary>
    /// Agent assigned to this debtor (optional)
    /// </summary>
    public Guid? AgentId { get; set; }

    // Identity Information
    /// <summary>
    /// Type of legal entity (Natural Person, Legal Entity, Partnership)
    /// </summary>
    public EntityType EntityType { get; set; } = EntityType.NATURAL_PERSON;

    /// <summary>
    /// Company name (required if EntityType = LEGAL_ENTITY)
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// First name (required if EntityType = NATURAL_PERSON)
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name (required if EntityType = NATURAL_PERSON)
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Birth name / maiden name (Geburtsname)
    /// </summary>
    public string? BirthName { get; set; }

    /// <summary>
    /// Gender (Geschlecht m/w/d)
    /// </summary>
    public Gender? Gender { get; set; }

    /// <summary>
    /// Date of birth (required for debtor authentication)
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Place of birth (Geburtsort)
    /// </summary>
    public string? BirthPlace { get; set; }

    /// <summary>
    /// Country of birth (Geburtsland)
    /// </summary>
    public string? BirthCountry { get; set; }

    /// <summary>
    /// Email address
    /// </summary>
    public string? Email { get; set; }

    // Address Information (embedded)
    /// <summary>
    /// Street address
    /// </summary>
    public string? Street { get; set; }

    /// <summary>
    /// House number (Hausnummer) - separate from Street
    /// </summary>
    public string? HouseNumber { get; set; }

    /// <summary>
    /// ZIP/Postal code
    /// </summary>
    public string? ZipCode { get; set; }

    /// <summary>
    /// City
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// City district (Ortsteil)
    /// </summary>
    public string? CityDistrict { get; set; }

    /// <summary>
    /// Floor (Etage)
    /// </summary>
    public string? Floor { get; set; }

    /// <summary>
    /// Door position (Welche Tür Re/Li/Mitte)
    /// </summary>
    public DoorPosition? DoorPosition { get; set; }

    /// <summary>
    /// Additional address info (c/o, bei, Zusatzangaben)
    /// </summary>
    public string? AdditionalAddressInfo { get; set; }

    /// <summary>
    /// PO Box (Postfach)
    /// </summary>
    public string? POBox { get; set; }

    /// <summary>
    /// PO Box ZIP code (PLZ Postfach)
    /// </summary>
    public string? POBoxZipCode { get; set; }

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

    // Representative & Death Information
    /// <summary>
    /// Represented by (Vertreten durch - Eltern, Betreuer, Vormund)
    /// </summary>
    public string? RepresentedBy { get; set; }

    /// <summary>
    /// Is deceased (Verstorben)
    /// </summary>
    public bool IsDeceased { get; set; } = false;

    /// <summary>
    /// Place of death (Sterbeort)
    /// </summary>
    public string? PlaceOfDeath { get; set; }

    // Extended Contact Fields
    /// <summary>
    /// Landline phone (Telefon Festnetz)
    /// </summary>
    public string? PhoneLandline { get; set; }

    /// <summary>
    /// Mobile phone (Telefon Mobil)
    /// </summary>
    public string? PhoneMobile { get; set; }

    /// <summary>
    /// Fax number
    /// </summary>
    public string? Fax { get; set; }

    /// <summary>
    /// Electronic legal communication address (Ebo-Adresse)
    /// </summary>
    public string? EboAddress { get; set; }

    // Banking Information
    /// <summary>
    /// Bank IBAN
    /// </summary>
    public string? BankIBAN { get; set; }

    /// <summary>
    /// Bank BIC/SWIFT
    /// </summary>
    public string? BankBIC { get; set; }

    /// <summary>
    /// Bank name
    /// </summary>
    public string? BankName { get; set; }

    // Legal Entity Specific Fields
    /// <summary>
    /// Register court (Zuständiges Handelsregister/Amtsgericht)
    /// </summary>
    public string? RegisterCourt { get; set; }

    /// <summary>
    /// Commercial register number (Handelsregister-Nummer)
    /// </summary>
    public string? RegisterNumber { get; set; }

    /// <summary>
    /// VAT ID (USt-ID-Nr)
    /// </summary>
    public string? VatId { get; set; }

    // Partnership Specific
    /// <summary>
    /// JSON array of partner names (for Personengesellschaften)
    /// </summary>
    public string? Partners { get; set; }

    // Business Reference
    /// <summary>
    /// File reference (Aktenzeichen)
    /// </summary>
    public string? FileReference { get; set; }

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
    /// The kreditor this debtor belongs to
    /// </summary>
    public Kreditor Kreditor { get; set; } = null!;

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
