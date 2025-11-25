namespace Monetaris.Kreditor.Models;

/// <summary>
/// Request model for creating a new kreditor
/// </summary>
public class CreateKreditorRequest
{
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BankAccountIBAN { get; set; } = string.Empty;
}
