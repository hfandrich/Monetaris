namespace Monetaris.Kreditor.Models;

/// <summary>
/// Request model for updating an existing kreditor
/// </summary>
public class UpdateKreditorRequest
{
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BankAccountIBAN { get; set; } = string.Empty;
}
