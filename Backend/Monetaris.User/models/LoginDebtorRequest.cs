namespace Monetaris.User.Models;

/// <summary>
/// Request model for debtor "magic link" login
/// Uses case number + zip code for authentication
/// </summary>
public class LoginDebtorRequest
{
    /// <summary>
    /// Invoice/case number
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    /// <summary>
    /// Zip code from debtor's address
    /// </summary>
    public string ZipCode { get; set; } = string.Empty;
}
