using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Kreditor.Models;

namespace Monetaris.Kreditor.Services;

/// <summary>
/// Service interface for Kreditor operations
/// </summary>
public interface IKreditorService
{
    /// <summary>
    /// Get all kreditoren accessible to the current user
    /// </summary>
    Task<Result<List<KreditorDto>>> GetAllAsync(User currentUser);

    /// <summary>
    /// Get a kreditor by ID (with authorization check)
    /// </summary>
    Task<Result<KreditorDto>> GetByIdAsync(Guid id, User currentUser);

    /// <summary>
    /// Create a new kreditor (ADMIN only)
    /// </summary>
    Task<Result<KreditorDto>> CreateAsync(CreateKreditorRequest request, User currentUser);

    /// <summary>
    /// Update an existing kreditor (ADMIN only)
    /// </summary>
    Task<Result<KreditorDto>> UpdateAsync(Guid id, UpdateKreditorRequest request, User currentUser);

    /// <summary>
    /// Delete a kreditor (ADMIN only)
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);
}
