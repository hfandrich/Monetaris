namespace Monetaris.Tenant.DTOs;

/// <summary>
/// Request model for creating a new tenant
/// </summary>
public class CreateTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BankAccountIBAN { get; set; } = string.Empty;
}
