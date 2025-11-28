using System.ComponentModel.DataAnnotations.Schema;
using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Mandant/Gläubiger - Client organization using the collection system
/// </summary>
[Table("kreditoren")]
public class Kreditor : BaseEntity
{
    /// <summary>
    /// Organization name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Registration number (Registernummer)
    /// </summary>
    public string RegistrationNumber { get; set; } = string.Empty;

    /// <summary>
    /// Contact email address
    /// </summary>
    public string ContactEmail { get; set; } = string.Empty;

    /// <summary>
    /// Bank account IBAN for settlements
    /// </summary>
    public string BankAccountIBAN { get; set; } = string.Empty;

    // Entity Type
    /// <summary>
    /// Type of legal entity (Natural Person, Legal Entity, Partnership)
    /// </summary>
    public EntityType EntityType { get; set; } = EntityType.LEGAL_ENTITY;

    // Natural Person Fields
    /// <summary>
    /// First name (for natural persons)
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name (for natural persons)
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
    /// Date of birth
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

    // Legal Entity Fields
    /// <summary>
    /// Register court (Zuständiges Handelsregister/Amtsgericht)
    /// </summary>
    public string? RegisterCourt { get; set; }

    /// <summary>
    /// VAT ID (USt-ID-Nr)
    /// </summary>
    public string? VatId { get; set; }

    // Address Fields
    /// <summary>
    /// Street address
    /// </summary>
    public string? Street { get; set; }

    /// <summary>
    /// House number (Hausnummer)
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

    // Representative
    /// <summary>
    /// Represented by (Vertreten durch)
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

    // Extended Contact
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

    // Banking (extended)
    /// <summary>
    /// Bank BIC/SWIFT
    /// </summary>
    public string? BankBIC { get; set; }

    /// <summary>
    /// Bank name
    /// </summary>
    public string? BankName { get; set; }

    // Partnership
    /// <summary>
    /// JSON array of partner names (for Personengesellschaften)
    /// </summary>
    public string? Partners { get; set; }

    // Business
    /// <summary>
    /// File reference (Aktenzeichen)
    /// </summary>
    public string? FileReference { get; set; }

    // Navigation Properties
    /// <summary>
    /// Debtors associated with this kreditor
    /// </summary>
    public ICollection<Debtor> Debtors { get; set; } = new List<Debtor>();

    /// <summary>
    /// Cases associated with this kreditor
    /// </summary>
    public ICollection<Case> Cases { get; set; } = new List<Case>();
}
