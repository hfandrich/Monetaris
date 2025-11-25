using Monetaris.Debtor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Debtor.Services;

/// <summary>
/// Service interface for Debtor operations
/// </summary>
public interface IDebtorService
{
    /// <summary>
    /// Get all debtors with filtering and pagination
    /// </summary>
    Task<Result<PaginatedResult<DebtorDto>>> GetAllAsync(DebtorFilterRequest filters, User currentUser);

    /// <summary>
    /// Get a debtor by ID (with authorization check)
    /// </summary>
    Task<Result<DebtorDto>> GetByIdAsync(Guid id, User currentUser);

    /// <summary>
    /// Search debtors by query string
    /// </summary>
    Task<Result<List<DebtorSearchDto>>> SearchAsync(string query, User currentUser);

    /// <summary>
    /// Create a new debtor
    /// </summary>
    Task<Result<DebtorDto>> CreateAsync(CreateDebtorRequest request, User currentUser);

    /// <summary>
    /// Update an existing debtor
    /// </summary>
    Task<Result<DebtorDto>> UpdateAsync(Guid id, UpdateDebtorRequest request, User currentUser);

    /// <summary>
    /// Delete a debtor
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);
}
