using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Lightweight debtor DTO for search results
/// </summary>
public class DebtorSearchDto
{
    public Guid Id { get; set; }
    public EntityType EntityType { get; set; }
    public string? CompanyName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public decimal TotalDebt { get; set; }
    public int OpenCases { get; set; }

    // Backwards Compatibility
    public bool IsCompany => EntityType != EntityType.NATURAL_PERSON;

    public string DisplayName => EntityType switch
    {
        EntityType.LEGAL_ENTITY => CompanyName ?? "Unbekannt",
        EntityType.PARTNERSHIP => CompanyName ?? "Unbekannte Gesellschaft",
        _ => $"{FirstName} {LastName}".Trim()
    };
}
