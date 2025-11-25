using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Debtor.Models;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Debtor.Services;

/// <summary>
/// Service implementation for Debtor operations
/// </summary>
public class DebtorService : IDebtorService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DebtorService> _logger;

    public DebtorService(IApplicationDbContext context, ILogger<DebtorService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PaginatedResult<DebtorDto>>> GetAllAsync(DebtorFilterRequest filters, User currentUser)
    {
        try
        {
            IQueryable<Shared.Models.Entities.Debtor> query = _context.Debtors
                .Include(d => d.Tenant)
                .Include(d => d.Agent)
                .Include(d => d.Cases);

            // Role-based filtering
            query = ApplyRoleBasedFiltering(query, currentUser);

            // Apply filters
            if (filters.TenantId.HasValue)
            {
                query = query.Where(d => d.TenantId == filters.TenantId.Value);
            }

            if (filters.AgentId.HasValue)
            {
                query = query.Where(d => d.AgentId == filters.AgentId.Value);
            }

            if (filters.RiskScore.HasValue)
            {
                query = query.Where(d => d.RiskScore == filters.RiskScore.Value);
            }

            // Search query
            if (!string.IsNullOrWhiteSpace(filters.SearchQuery))
            {
                var searchLower = filters.SearchQuery.ToLower();
                query = query.Where(d =>
                    (d.CompanyName != null && d.CompanyName.ToLower().Contains(searchLower)) ||
                    (d.FirstName != null && d.FirstName.ToLower().Contains(searchLower)) ||
                    (d.LastName != null && d.LastName.ToLower().Contains(searchLower)) ||
                    (d.Email != null && d.Email.ToLower().Contains(searchLower)));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var debtors = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((filters.Page - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToListAsync();

            var debtorDtos = debtors.Select(d => MapToDto(d)).ToList();

            var result = new PaginatedResult<DebtorDto>
            {
                Items = debtorDtos,
                Page = filters.Page,
                PageSize = filters.PageSize,
                TotalCount = totalCount
            };

            _logger.LogInformation("Retrieved {Count} debtors (page {Page}) for user {UserId}",
                debtorDtos.Count, filters.Page, currentUser.Id);

            return Result<PaginatedResult<DebtorDto>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving debtors for user {UserId}", currentUser.Id);
            return Result<PaginatedResult<DebtorDto>>.Failure("An error occurred while retrieving debtors");
        }
    }

    public async Task<Result<DebtorDto>> GetByIdAsync(Guid id, User currentUser)
    {
        try
        {
            var debtor = await _context.Debtors
                .Include(d => d.Tenant)
                .Include(d => d.Agent)
                .Include(d => d.Cases)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (debtor == null)
            {
                return Result<DebtorDto>.Failure("Debtor not found");
            }

            // Authorization check
            if (!await HasAccessToDebtor(debtor, currentUser))
            {
                return Result<DebtorDto>.Failure("Access denied");
            }

            var debtorDto = MapToDto(debtor);

            _logger.LogInformation("Retrieved debtor {DebtorId} for user {UserId}", id, currentUser.Id);

            return Result<DebtorDto>.Success(debtorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving debtor {DebtorId} for user {UserId}", id, currentUser.Id);
            return Result<DebtorDto>.Failure("An error occurred while retrieving the debtor");
        }
    }

    public async Task<Result<List<DebtorSearchDto>>> SearchAsync(string query, User currentUser)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Result<List<DebtorSearchDto>>.Success(new List<DebtorSearchDto>());
            }

            var searchLower = query.ToLower();

            IQueryable<Shared.Models.Entities.Debtor> debtorQuery = _context.Debtors
                .Include(d => d.Cases);

            // Role-based filtering
            debtorQuery = ApplyRoleBasedFiltering(debtorQuery, currentUser);

            var debtors = await debtorQuery
                .Where(d =>
                    (d.CompanyName != null && d.CompanyName.ToLower().Contains(searchLower)) ||
                    (d.FirstName != null && d.FirstName.ToLower().Contains(searchLower)) ||
                    (d.LastName != null && d.LastName.ToLower().Contains(searchLower)) ||
                    (d.Email != null && d.Email.ToLower().Contains(searchLower)) ||
                    (d.City != null && d.City.ToLower().Contains(searchLower)))
                .Take(10) // Limit search results
                .ToListAsync();

            var searchDtos = debtors.Select(d => new DebtorSearchDto
            {
                Id = d.Id,
                IsCompany = d.IsCompany,
                CompanyName = d.CompanyName,
                FirstName = d.FirstName,
                LastName = d.LastName,
                Email = d.Email,
                City = d.City,
                TotalDebt = d.TotalDebt,
                OpenCases = d.OpenCases
            }).ToList();

            _logger.LogInformation("Search found {Count} debtors for query '{Query}' by user {UserId}",
                searchDtos.Count, query, currentUser.Id);

            return Result<List<DebtorSearchDto>>.Success(searchDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching debtors for user {UserId}", currentUser.Id);
            return Result<List<DebtorSearchDto>>.Failure("An error occurred while searching debtors");
        }
    }

    public async Task<Result<DebtorDto>> CreateAsync(CreateDebtorRequest request, User currentUser)
    {
        try
        {
            // Verify tenant exists and user has access
            var tenant = await _context.Tenants.FindAsync(request.TenantId);
            if (tenant == null)
            {
                return Result<DebtorDto>.Failure("Tenant not found");
            }

            if (!await HasAccessToTenant(request.TenantId, currentUser))
            {
                return Result<DebtorDto>.Failure("Access denied to this tenant");
            }

            // Verify agent if specified
            if (request.AgentId.HasValue)
            {
                var agent = await _context.Users.FindAsync(request.AgentId.Value);
                if (agent == null || agent.Role != UserRole.AGENT)
                {
                    return Result<DebtorDto>.Failure("Invalid agent ID");
                }
            }

            var debtor = new Shared.Models.Entities.Debtor
            {
                TenantId = request.TenantId,
                AgentId = request.AgentId,
                IsCompany = request.IsCompany,
                CompanyName = request.CompanyName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                Street = request.Street,
                ZipCode = request.ZipCode,
                City = request.City,
                Country = request.Country,
                AddressStatus = request.AddressStatus,
                RiskScore = request.RiskScore,
                Notes = request.Notes,
                TotalDebt = 0,
                OpenCases = 0
            };

            _context.Debtors.Add(debtor);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            debtor = await _context.Debtors
                .Include(d => d.Tenant)
                .Include(d => d.Agent)
                .Include(d => d.Cases)
                .FirstAsync(d => d.Id == debtor.Id);

            var debtorDto = MapToDto(debtor);

            _logger.LogInformation("Debtor {DebtorId} created by user {UserId}", debtor.Id, currentUser.Id);

            return Result<DebtorDto>.Success(debtorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating debtor by user {UserId}", currentUser.Id);
            return Result<DebtorDto>.Failure("An error occurred while creating the debtor");
        }
    }

    public async Task<Result<DebtorDto>> UpdateAsync(Guid id, UpdateDebtorRequest request, User currentUser)
    {
        try
        {
            var debtor = await _context.Debtors
                .Include(d => d.Tenant)
                .Include(d => d.Agent)
                .Include(d => d.Cases)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (debtor == null)
            {
                return Result<DebtorDto>.Failure("Debtor not found");
            }

            // Authorization check
            if (!await HasAccessToDebtor(debtor, currentUser))
            {
                return Result<DebtorDto>.Failure("Access denied");
            }

            // Verify agent if specified
            if (request.AgentId.HasValue)
            {
                var agent = await _context.Users.FindAsync(request.AgentId.Value);
                if (agent == null || agent.Role != UserRole.AGENT)
                {
                    return Result<DebtorDto>.Failure("Invalid agent ID");
                }
            }

            debtor.AgentId = request.AgentId;
            debtor.IsCompany = request.IsCompany;
            debtor.CompanyName = request.CompanyName;
            debtor.FirstName = request.FirstName;
            debtor.LastName = request.LastName;
            debtor.Email = request.Email;
            debtor.Phone = request.Phone;
            debtor.Street = request.Street;
            debtor.ZipCode = request.ZipCode;
            debtor.City = request.City;
            debtor.Country = request.Country;
            debtor.AddressStatus = request.AddressStatus;
            debtor.RiskScore = request.RiskScore;
            debtor.Notes = request.Notes;

            if (debtor.AddressStatus != AddressStatus.UNKNOWN)
            {
                debtor.AddressLastChecked = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var debtorDto = MapToDto(debtor);

            _logger.LogInformation("Debtor {DebtorId} updated by user {UserId}", id, currentUser.Id);

            return Result<DebtorDto>.Success(debtorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating debtor {DebtorId} by user {UserId}", id, currentUser.Id);
            return Result<DebtorDto>.Failure("An error occurred while updating the debtor");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            var debtor = await _context.Debtors
                .Include(d => d.Cases)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (debtor == null)
            {
                return Result.Failure("Debtor not found");
            }

            // Authorization check
            if (!await HasAccessToDebtor(debtor, currentUser))
            {
                return Result.Failure("Access denied");
            }

            // Check if debtor has cases
            if (debtor.Cases.Any())
            {
                return Result.Failure("Cannot delete debtor with existing cases");
            }

            _context.Debtors.Remove(debtor);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Debtor {DebtorId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting debtor {DebtorId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the debtor");
        }
    }

    // Helper methods

    private IQueryable<Shared.Models.Entities.Debtor> ApplyRoleBasedFiltering(
        IQueryable<Shared.Models.Entities.Debtor> query,
        User currentUser)
    {
        if (currentUser.Role == UserRole.CLIENT)
        {
            if (currentUser.TenantId == null)
            {
                return query.Where(d => false); // Return empty
            }
            query = query.Where(d => d.TenantId == currentUser.TenantId.Value);
        }
        else if (currentUser.Role == UserRole.AGENT)
        {
            var assignedTenantIds = _context.UserTenantAssignments
                .Where(uta => uta.UserId == currentUser.Id)
                .Select(uta => uta.TenantId);

            query = query.Where(d => assignedTenantIds.Contains(d.TenantId));
        }
        // ADMIN sees all

        return query;
    }

    private async Task<bool> HasAccessToDebtor(Shared.Models.Entities.Debtor debtor, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.TenantId == debtor.TenantId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserTenantAssignments
                .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == debtor.TenantId);
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

    private DebtorDto MapToDto(Shared.Models.Entities.Debtor debtor)
    {
        return new DebtorDto
        {
            Id = debtor.Id,
            TenantId = debtor.TenantId,
            AgentId = debtor.AgentId,
            IsCompany = debtor.IsCompany,
            CompanyName = debtor.CompanyName,
            FirstName = debtor.FirstName,
            LastName = debtor.LastName,
            Email = debtor.Email,
            Phone = debtor.Phone,
            Street = debtor.Street,
            ZipCode = debtor.ZipCode,
            City = debtor.City,
            Country = debtor.Country,
            AddressStatus = debtor.AddressStatus,
            AddressLastChecked = debtor.AddressLastChecked,
            RiskScore = debtor.RiskScore,
            TotalDebt = debtor.TotalDebt,
            OpenCases = debtor.OpenCases,
            Notes = debtor.Notes,
            CreatedAt = debtor.CreatedAt,
            UpdatedAt = debtor.UpdatedAt,
            TenantName = debtor.Tenant?.Name ?? string.Empty,
            AgentName = debtor.Agent?.Name
        };
    }
}
