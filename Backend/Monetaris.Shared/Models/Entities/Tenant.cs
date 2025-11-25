namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Mandant/Gläubiger - Client organization using the collection system
/// </summary>
public class Tenant : BaseEntity
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

    // Navigation Properties
    /// <summary>
    /// Debtors associated with this tenant
    /// </summary>
    public ICollection<Debtor> Debtors { get; set; } = new List<Debtor>();

    /// <summary>
    /// Cases associated with this tenant
    /// </summary>
    public ICollection<Case> Cases { get; set; } = new List<Case>();
}
