namespace Monetaris.Tenant.DTOs;

/// <summary>
/// Request model for updating an existing tenant
/// </summary>
public class UpdateTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string BankAccountIBAN { get; set; } = string.Empty;
}
