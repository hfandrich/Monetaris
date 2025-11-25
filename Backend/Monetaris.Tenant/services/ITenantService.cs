using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Tenant.DTOs;

namespace Monetaris.Tenant.Services;

/// <summary>
/// Service interface for Tenant operations
/// </summary>
public interface ITenantService
{
    /// <summary>
    /// Get all tenants accessible to the current user
    /// </summary>
    Task<Result<List<TenantDto>>> GetAllAsync(User currentUser);

    /// <summary>
    /// Get a tenant by ID (with authorization check)
    /// </summary>
    Task<Result<TenantDto>> GetByIdAsync(Guid id, User currentUser);

    /// <summary>
    /// Create a new tenant (ADMIN only)
    /// </summary>
    Task<Result<TenantDto>> CreateAsync(CreateTenantRequest request, User currentUser);

    /// <summary>
    /// Update an existing tenant (ADMIN only)
    /// </summary>
    Task<Result<TenantDto>> UpdateAsync(Guid id, UpdateTenantRequest request, User currentUser);

    /// <summary>
    /// Delete a tenant (ADMIN only)
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);
}
