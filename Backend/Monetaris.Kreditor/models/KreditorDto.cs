namespace Monetaris.Kreditor.Models;

/// <summary>
/// Kreditor (Creditor/Mandant) data transfer object with statistics
/// </summary>
public class KreditorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BankAccountIBAN { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Statistics
    public int TotalDebtors { get; set; }
    public int TotalCases { get; set; }
    public decimal TotalVolume { get; set; }
}
