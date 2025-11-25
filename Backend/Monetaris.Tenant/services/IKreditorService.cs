using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Kreditor.Models;

namespace Monetaris.Kreditor.Services;

/// <summary>
/// Service interface for Kreditor operations
/// Manages creditor/client organizations that submit collection cases
/// </summary>
public interface IKreditorService
{
    /// <summary>
    /// Get all Kreditoren accessible to the current user
    /// Scoping rules:
    /// - ADMIN: All Kreditoren
    /// - AGENT: Assigned Kreditoren only
    /// - CLIENT: Own Kreditor only
    /// </summary>
    Task<Result<List<KreditorDto>>> GetAllAsync(User currentUser);

    /// <summary>
    /// Get a Kreditor by ID (with authorization check)
    /// </summary>
    Task<Result<KreditorDto>> GetByIdAsync(Guid id, User currentUser);

    /// <summary>
    /// Create a new Kreditor (ADMIN only)
    /// Validates unique RegistrationNumber
    /// </summary>
    Task<Result<KreditorDto>> CreateAsync(CreateKreditorRequest request, User currentUser);

    /// <summary>
    /// Update an existing Kreditor (ADMIN only)
    /// Validates unique RegistrationNumber (excluding current Kreditor)
    /// </summary>
    Task<Result<KreditorDto>> UpdateAsync(Guid id, UpdateKreditorRequest request, User currentUser);

    /// <summary>
    /// Delete a Kreditor (ADMIN only)
    /// Cannot delete if Kreditor has existing debtors or cases
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);
}
