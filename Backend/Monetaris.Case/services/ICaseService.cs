using Monetaris.Case.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Case.Services;

/// <summary>
/// Service interface for Case operations with workflow management
/// </summary>
public interface ICaseService
{
    /// <summary>
    /// Get all cases with filtering and pagination
    /// </summary>
    Task<Result<PaginatedResult<CaseListDto>>> GetAllAsync(CaseFilterRequest filters, User currentUser);

    /// <summary>
    /// Get a case by ID (with authorization check)
    /// </summary>
    Task<Result<CaseDto>> GetByIdAsync(Guid id, User currentUser);

    /// <summary>
    /// Create a new case
    /// </summary>
    Task<Result<CaseDto>> CreateAsync(CreateCaseRequest request, User currentUser);

    /// <summary>
    /// Update an existing case
    /// </summary>
    Task<Result<CaseDto>> UpdateAsync(Guid id, UpdateCaseRequest request, User currentUser);

    /// <summary>
    /// Delete a case
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);

    /// <summary>
    /// Advance case workflow to new status
    /// </summary>
    Task<Result<CaseDto>> AdvanceWorkflowAsync(Guid id, AdvanceWorkflowRequest request, User currentUser);

    /// <summary>
    /// Get case history/audit log
    /// </summary>
    Task<Result<List<CaseHistoryDto>>> GetHistoryAsync(Guid id, User currentUser);
}
