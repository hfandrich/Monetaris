namespace Monetaris.Debtor.Models;

/// <summary>
/// Lightweight debtor DTO for search results
/// </summary>
public class DebtorSearchDto
{
    public Guid Id { get; set; }
    public bool IsCompany { get; set; }
    public string? CompanyName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public decimal TotalDebt { get; set; }
    public int OpenCases { get; set; }

    public string DisplayName => IsCompany ? CompanyName ?? "Unknown" : $"{FirstName} {LastName}";
}
