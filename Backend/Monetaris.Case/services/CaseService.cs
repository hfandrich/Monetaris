using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Models;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Case.Services;

/// <summary>
/// Service implementation for Case operations with ZPO workflow
/// </summary>
public class CaseService : ICaseService
{
    private readonly IApplicationDbContext _context;
    private readonly IWorkflowEngine _workflowEngine;
    private readonly ILogger<CaseService> _logger;

    public CaseService(
        IApplicationDbContext context,
        IWorkflowEngine workflowEngine,
        ILogger<CaseService> logger)
    {
        _context = context;
        _workflowEngine = workflowEngine;
        _logger = logger;
    }

    public async Task<Result<PaginatedResult<CaseListDto>>> GetAllAsync(CaseFilterRequest filters, User currentUser)
    {
        try
        {
            IQueryable<Shared.Models.Entities.Case> query = _context.Cases
                .Include(c => c.Debtor)
                .Include(c => c.Tenant);

            // Role-based filtering
            query = ApplyRoleBasedFiltering(query, currentUser);

            // Apply filters
            if (filters.TenantId.HasValue)
            {
                query = query.Where(c => c.TenantId == filters.TenantId.Value);
            }

            if (filters.DebtorId.HasValue)
            {
                query = query.Where(c => c.DebtorId == filters.DebtorId.Value);
            }

            if (filters.AgentId.HasValue)
            {
                query = query.Where(c => c.AgentId == filters.AgentId.Value);
            }

            if (filters.Status.HasValue)
            {
                query = query.Where(c => c.Status == filters.Status.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var cases = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((filters.Page - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToListAsync();

            var caseDtos = cases.Select(MapToListDto).ToList();

            var result = new PaginatedResult<CaseListDto>
            {
                Items = caseDtos,
                Page = filters.Page,
                PageSize = filters.PageSize,
                TotalCount = totalCount
            };

            _logger.LogInformation("Retrieved {Count} cases (page {Page}) for user {UserId}",
                caseDtos.Count, filters.Page, currentUser.Id);

            return Result<PaginatedResult<CaseListDto>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cases for user {UserId}", currentUser.Id);
            return Result<PaginatedResult<CaseListDto>>.Failure("An error occurred while retrieving cases");
        }
    }

    public async Task<Result<CaseDto>> GetByIdAsync(Guid id, User currentUser)
    {
        try
        {
            var caseEntity = await _context.Cases
                .Include(c => c.Tenant)
                .Include(c => c.Debtor)
                .Include(c => c.Agent)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (caseEntity == null)
            {
                return Result<CaseDto>.Failure("Case not found");
            }

            // Authorization check
            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result<CaseDto>.Failure("Access denied");
            }

            var caseDto = MapToDto(caseEntity);

            _logger.LogInformation("Retrieved case {CaseId} for user {UserId}", id, currentUser.Id);

            return Result<CaseDto>.Success(caseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving case {CaseId} for user {UserId}", id, currentUser.Id);
            return Result<CaseDto>.Failure("An error occurred while retrieving the case");
        }
    }

    public async Task<Result<CaseDto>> CreateAsync(CreateCaseRequest request, User currentUser)
    {
        try
        {
            // Verify tenant exists and user has access
            var tenant = await _context.Tenants.FindAsync(request.TenantId);
            if (tenant == null)
            {
                return Result<CaseDto>.Failure("Tenant not found");
            }

            if (!await HasAccessToTenant(request.TenantId, currentUser))
            {
                return Result<CaseDto>.Failure("Access denied to this tenant");
            }

            // Verify debtor exists and belongs to the tenant
            var debtor = await _context.Debtors.FindAsync(request.DebtorId);
            if (debtor == null)
            {
                return Result<CaseDto>.Failure("Debtor not found");
            }

            if (debtor.TenantId != request.TenantId)
            {
                return Result<CaseDto>.Failure("Debtor does not belong to the specified tenant");
            }

            // Verify agent if specified
            if (request.AgentId.HasValue)
            {
                var agent = await _context.Users.FindAsync(request.AgentId.Value);
                if (agent == null || agent.Role != UserRole.AGENT)
                {
                    return Result<CaseDto>.Failure("Invalid agent ID");
                }
            }

            // Check for duplicate invoice number within tenant
            var existingCase = await _context.Cases
                .FirstOrDefaultAsync(c => c.TenantId == request.TenantId && c.InvoiceNumber == request.InvoiceNumber);

            if (existingCase != null)
            {
                return Result<CaseDto>.Failure("A case with this invoice number already exists for this tenant");
            }

            var caseEntity = new Shared.Models.Entities.Case
            {
                TenantId = request.TenantId,
                DebtorId = request.DebtorId,
                AgentId = request.AgentId,
                PrincipalAmount = request.PrincipalAmount,
                Costs = request.Costs,
                Interest = request.Interest,
                Currency = request.Currency,
                InvoiceNumber = request.InvoiceNumber,
                InvoiceDate = request.InvoiceDate,
                DueDate = request.DueDate,
                Status = CaseStatus.NEW,
                CompetentCourt = request.CompetentCourt,
                CourtFileNumber = request.CourtFileNumber,
                NextActionDate = _workflowEngine.CalculateNextActionDate(CaseStatus.NEW)
            };

            _context.Cases.Add(caseEntity);

            // Create initial audit log entry
            var historyEntry = new CaseHistory
            {
                CaseId = caseEntity.Id,
                Action = "CREATED",
                Details = $"Case created with status {CaseStatus.NEW}",
                Actor = currentUser.Name
            };
            _context.CaseHistories.Add(historyEntry);

            // Update debtor statistics
            debtor.TotalDebt += caseEntity.TotalAmount;
            debtor.OpenCases += 1;

            await _context.SaveChangesAsync();

            // Reload with navigation properties
            caseEntity = await _context.Cases
                .Include(c => c.Tenant)
                .Include(c => c.Debtor)
                .Include(c => c.Agent)
                .FirstAsync(c => c.Id == caseEntity.Id);

            var caseDto = MapToDto(caseEntity);

            _logger.LogInformation("Case {CaseId} created by user {UserId}", caseEntity.Id, currentUser.Id);

            return Result<CaseDto>.Success(caseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating case by user {UserId}", currentUser.Id);
            return Result<CaseDto>.Failure("An error occurred while creating the case");
        }
    }

    public async Task<Result<CaseDto>> UpdateAsync(Guid id, UpdateCaseRequest request, User currentUser)
    {
        try
        {
            var caseEntity = await _context.Cases
                .Include(c => c.Tenant)
                .Include(c => c.Debtor)
                .Include(c => c.Agent)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (caseEntity == null)
            {
                return Result<CaseDto>.Failure("Case not found");
            }

            // Authorization check
            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result<CaseDto>.Failure("Access denied");
            }

            // Verify agent if specified
            if (request.AgentId.HasValue)
            {
                var agent = await _context.Users.FindAsync(request.AgentId.Value);
                if (agent == null || agent.Role != UserRole.AGENT)
                {
                    return Result<CaseDto>.Failure("Invalid agent ID");
                }
            }

            // Calculate old total for debtor statistics update
            var oldTotal = caseEntity.TotalAmount;

            caseEntity.AgentId = request.AgentId;
            caseEntity.PrincipalAmount = request.PrincipalAmount;
            caseEntity.Costs = request.Costs;
            caseEntity.Interest = request.Interest;
            caseEntity.Currency = request.Currency;
            caseEntity.CompetentCourt = request.CompetentCourt;
            caseEntity.CourtFileNumber = request.CourtFileNumber;
            caseEntity.AiAnalysis = request.AiAnalysis;

            // Calculate new total
            var newTotal = caseEntity.TotalAmount;

            // Update debtor statistics if amount changed
            if (oldTotal != newTotal)
            {
                var debtor = caseEntity.Debtor;
                debtor.TotalDebt = debtor.TotalDebt - oldTotal + newTotal;
            }

            // Create audit log entry
            var historyEntry = new CaseHistory
            {
                CaseId = caseEntity.Id,
                Action = "UPDATED",
                Details = "Case details updated",
                Actor = currentUser.Name
            };
            _context.CaseHistories.Add(historyEntry);

            await _context.SaveChangesAsync();

            var caseDto = MapToDto(caseEntity);

            _logger.LogInformation("Case {CaseId} updated by user {UserId}", id, currentUser.Id);

            return Result<CaseDto>.Success(caseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating case {CaseId} by user {UserId}", id, currentUser.Id);
            return Result<CaseDto>.Failure("An error occurred while updating the case");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            var caseEntity = await _context.Cases
                .Include(c => c.Debtor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (caseEntity == null)
            {
                return Result.Failure("Case not found");
            }

            // Authorization check
            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result.Failure("Access denied");
            }

            // Only allow deletion of draft or new cases
            if (caseEntity.Status != CaseStatus.DRAFT && caseEntity.Status != CaseStatus.NEW)
            {
                return Result.Failure("Only draft or new cases can be deleted");
            }

            // Update debtor statistics
            var debtor = caseEntity.Debtor;
            debtor.TotalDebt -= caseEntity.TotalAmount;
            debtor.OpenCases -= 1;

            _context.Cases.Remove(caseEntity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Case {CaseId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting case {CaseId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the case");
        }
    }

    public async Task<Result<CaseDto>> AdvanceWorkflowAsync(Guid id, AdvanceWorkflowRequest request, User currentUser)
    {
        try
        {
            var caseEntity = await _context.Cases
                .Include(c => c.Tenant)
                .Include(c => c.Debtor)
                .Include(c => c.Agent)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (caseEntity == null)
            {
                return Result<CaseDto>.Failure("Case not found");
            }

            // Authorization check
            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result<CaseDto>.Failure("Access denied");
            }

            // Validate workflow transition
            if (!_workflowEngine.CanTransition(caseEntity.Status, request.NewStatus))
            {
                return Result<CaseDto>.Failure(
                    $"Invalid workflow transition from {caseEntity.Status} to {request.NewStatus}");
            }

            var oldStatus = caseEntity.Status;
            caseEntity.Status = request.NewStatus;

            // Calculate next action date based on new status
            caseEntity.NextActionDate = _workflowEngine.CalculateNextActionDate(request.NewStatus);

            // Update debtor open cases count if case is being closed
            if (IsClosureStatus(request.NewStatus) && !IsClosureStatus(oldStatus))
            {
                var debtor = caseEntity.Debtor;
                debtor.OpenCases -= 1;

                // If paid or settled, reduce total debt
                if (request.NewStatus == CaseStatus.PAID || request.NewStatus == CaseStatus.SETTLED)
                {
                    debtor.TotalDebt -= caseEntity.TotalAmount;
                }
            }

            // Create detailed audit log entry
            var historyDetails = $"Status changed from {oldStatus} to {request.NewStatus}";
            if (!string.IsNullOrWhiteSpace(request.Note))
            {
                historyDetails += $". Note: {request.Note}";
            }

            var historyEntry = new CaseHistory
            {
                CaseId = caseEntity.Id,
                Action = "STATUS_CHANGE",
                Details = historyDetails,
                Actor = currentUser.Name
            };
            _context.CaseHistories.Add(historyEntry);

            await _context.SaveChangesAsync();

            var caseDto = MapToDto(caseEntity);

            _logger.LogInformation(
                "Case {CaseId} workflow advanced from {OldStatus} to {NewStatus} by user {UserId}",
                id, oldStatus, request.NewStatus, currentUser.Id);

            return Result<CaseDto>.Success(caseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error advancing workflow for case {CaseId} by user {UserId}", id, currentUser.Id);
            return Result<CaseDto>.Failure("An error occurred while advancing the workflow");
        }
    }

    public async Task<Result<List<CaseHistoryDto>>> GetHistoryAsync(Guid id, User currentUser)
    {
        try
        {
            var caseEntity = await _context.Cases.FindAsync(id);

            if (caseEntity == null)
            {
                return Result<List<CaseHistoryDto>>.Failure("Case not found");
            }

            // Authorization check
            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result<List<CaseHistoryDto>>.Failure("Access denied");
            }

            var history = await _context.CaseHistories
                .Where(h => h.CaseId == id)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            var historyDtos = history.Select(h => new CaseHistoryDto
            {
                Id = h.Id,
                Action = h.Action,
                Details = h.Details,
                Actor = h.Actor,
                CreatedAt = h.CreatedAt
            }).ToList();

            _logger.LogInformation("Retrieved {Count} history entries for case {CaseId}", historyDtos.Count, id);

            return Result<List<CaseHistoryDto>>.Success(historyDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving history for case {CaseId}", id);
            return Result<List<CaseHistoryDto>>.Failure("An error occurred while retrieving case history");
        }
    }

    // Helper methods

    private IQueryable<Shared.Models.Entities.Case> ApplyRoleBasedFiltering(
        IQueryable<Shared.Models.Entities.Case> query,
        User currentUser)
    {
        if (currentUser.Role == UserRole.CLIENT)
        {
            if (currentUser.TenantId == null)
            {
                return query.Where(c => false); // Return empty
            }
            query = query.Where(c => c.TenantId == currentUser.TenantId.Value);
        }
        else if (currentUser.Role == UserRole.AGENT)
        {
            var assignedTenantIds = _context.UserTenantAssignments
                .Where(uta => uta.UserId == currentUser.Id)
                .Select(uta => uta.TenantId);

            query = query.Where(c => assignedTenantIds.Contains(c.TenantId));
        }
        // ADMIN sees all

        return query;
    }

    private async Task<bool> HasAccessToCase(Shared.Models.Entities.Case caseEntity, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.TenantId == caseEntity.TenantId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserTenantAssignments
                .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == caseEntity.TenantId);
        }

        return false;
    }

    private async Task<bool> HasAccessToTenant(Guid tenantId, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.TenantId == tenantId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserTenantAssignments
                .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == tenantId);
        }

        return false;
    }

    private bool IsClosureStatus(CaseStatus status)
    {
        return status == CaseStatus.PAID ||
               status == CaseStatus.SETTLED ||
               status == CaseStatus.INSOLVENCY ||
               status == CaseStatus.UNCOLLECTIBLE;
    }

    private CaseDto MapToDto(Shared.Models.Entities.Case caseEntity)
    {
        var debtorName = caseEntity.Debtor.IsCompany
            ? caseEntity.Debtor.CompanyName ?? "Unknown"
            : $"{caseEntity.Debtor.FirstName} {caseEntity.Debtor.LastName}";

        return new CaseDto
        {
            Id = caseEntity.Id,
            TenantId = caseEntity.TenantId,
            DebtorId = caseEntity.DebtorId,
            AgentId = caseEntity.AgentId,
            PrincipalAmount = caseEntity.PrincipalAmount,
            Costs = caseEntity.Costs,
            Interest = caseEntity.Interest,
            TotalAmount = caseEntity.TotalAmount,
            Currency = caseEntity.Currency,
            InvoiceNumber = caseEntity.InvoiceNumber,
            InvoiceDate = caseEntity.InvoiceDate,
            DueDate = caseEntity.DueDate,
            Status = caseEntity.Status,
            NextActionDate = caseEntity.NextActionDate,
            CompetentCourt = caseEntity.CompetentCourt,
            CourtFileNumber = caseEntity.CourtFileNumber,
            AiAnalysis = caseEntity.AiAnalysis,
            CreatedAt = caseEntity.CreatedAt,
            UpdatedAt = caseEntity.UpdatedAt,
            TenantName = caseEntity.Tenant?.Name ?? string.Empty,
            DebtorName = debtorName,
            AgentName = caseEntity.Agent?.Name
        };
    }

    private CaseListDto MapToListDto(Shared.Models.Entities.Case caseEntity)
    {
        var debtorName = caseEntity.Debtor.IsCompany
            ? caseEntity.Debtor.CompanyName ?? "Unknown"
            : $"{caseEntity.Debtor.FirstName} {caseEntity.Debtor.LastName}";

        return new CaseListDto
        {
            Id = caseEntity.Id,
            InvoiceNumber = caseEntity.InvoiceNumber,
            DebtorName = debtorName,
            Status = caseEntity.Status,
            TotalAmount = caseEntity.TotalAmount,
            NextActionDate = caseEntity.NextActionDate,
            CreatedAt = caseEntity.CreatedAt
        };
    }
}
