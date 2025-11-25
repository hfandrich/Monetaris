using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Tenant.DTOs;

namespace Monetaris.Tenant.Services;

/// <summary>
/// Service implementation for Tenant operations
/// </summary>
public class TenantService : ITenantService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TenantService> _logger;

    public TenantService(IApplicationDbContext context, ILogger<TenantService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<TenantDto>>> GetAllAsync(User currentUser)
    {
        try
        {
            IQueryable<Shared.Models.Entities.Tenant> query = _context.Tenants;

            // Role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                // CLIENT users can only see their own tenant
                if (currentUser.TenantId == null)
                {
                    return Result<List<TenantDto>>.Failure("Client user has no assigned tenant");
                }
                query = query.Where(t => t.Id == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                // AGENT users can see assigned tenants
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                query = query.Where(t => assignedTenantIds.Contains(t.Id));
            }
            // ADMIN sees all tenants (no filter)

            var tenants = await query
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .ToListAsync();

            var tenantDtos = tenants.Select(t => new TenantDto
            {
                Id = t.Id,
                Name = t.Name,
                RegistrationNumber = t.RegistrationNumber,
                ContactEmail = t.ContactEmail,
                BankAccountIBAN = t.BankAccountIBAN,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                TotalDebtors = t.Debtors.Count,
                TotalCases = t.Cases.Count,
                TotalVolume = t.Cases.Sum(c => c.TotalAmount)
            }).ToList();

            _logger.LogInformation("Retrieved {Count} tenants for user {UserId} ({Role})",
                tenantDtos.Count, currentUser.Id, currentUser.Role);

            return Result<List<TenantDto>>.Success(tenantDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenants for user {UserId}", currentUser.Id);
            return Result<List<TenantDto>>.Failure("An error occurred while retrieving tenants");
        }
    }

    public async Task<Result<TenantDto>> GetByIdAsync(Guid id, User currentUser)
    {
        try
        {
            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result<TenantDto>.Failure("Tenant not found");
            }

            // Authorization check
            if (currentUser.Role == UserRole.CLIENT && currentUser.TenantId != id)
            {
                return Result<TenantDto>.Failure("Access denied");
            }

            if (currentUser.Role == UserRole.AGENT)
            {
                var hasAccess = await _context.UserTenantAssignments
                    .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == id);

                if (!hasAccess)
                {
                    return Result<TenantDto>.Failure("Access denied");
                }
            }

            var tenantDto = new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                RegistrationNumber = tenant.RegistrationNumber,
                ContactEmail = tenant.ContactEmail,
                BankAccountIBAN = tenant.BankAccountIBAN,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt,
                TotalDebtors = tenant.Debtors.Count,
                TotalCases = tenant.Cases.Count,
                TotalVolume = tenant.Cases.Sum(c => c.TotalAmount)
            };

            _logger.LogInformation("Retrieved tenant {TenantId} for user {UserId}", id, currentUser.Id);

            return Result<TenantDto>.Success(tenantDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenant {TenantId} for user {UserId}", id, currentUser.Id);
            return Result<TenantDto>.Failure("An error occurred while retrieving the tenant");
        }
    }

    public async Task<Result<TenantDto>> CreateAsync(CreateTenantRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can create tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<TenantDto>.Failure("Only administrators can create tenants");
            }

            // Check for duplicate registration number
            var existingTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RegistrationNumber == request.RegistrationNumber);

            if (existingTenant != null)
            {
                return Result<TenantDto>.Failure("A tenant with this registration number already exists");
            }

            var tenant = new Shared.Models.Entities.Tenant
            {
                Name = request.Name,
                RegistrationNumber = request.RegistrationNumber,
                ContactEmail = request.ContactEmail,
                BankAccountIBAN = request.BankAccountIBAN
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var tenantDto = new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                RegistrationNumber = tenant.RegistrationNumber,
                ContactEmail = tenant.ContactEmail,
                BankAccountIBAN = tenant.BankAccountIBAN,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt,
                TotalDebtors = 0,
                TotalCases = 0,
                TotalVolume = 0
            };

            _logger.LogInformation("Tenant {TenantId} created by user {UserId}", tenant.Id, currentUser.Id);

            return Result<TenantDto>.Success(tenantDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant by user {UserId}", currentUser.Id);
            return Result<TenantDto>.Failure("An error occurred while creating the tenant");
        }
    }

    public async Task<Result<TenantDto>> UpdateAsync(Guid id, UpdateTenantRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can update tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<TenantDto>.Failure("Only administrators can update tenants");
            }

            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result<TenantDto>.Failure("Tenant not found");
            }

            // Check for duplicate registration number (excluding current tenant)
            var duplicateTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RegistrationNumber == request.RegistrationNumber && t.Id != id);

            if (duplicateTenant != null)
            {
                return Result<TenantDto>.Failure("A tenant with this registration number already exists");
            }

            tenant.Name = request.Name;
            tenant.RegistrationNumber = request.RegistrationNumber;
            tenant.ContactEmail = request.ContactEmail;
            tenant.BankAccountIBAN = request.BankAccountIBAN;

            await _context.SaveChangesAsync();

            var tenantDto = new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                RegistrationNumber = tenant.RegistrationNumber,
                ContactEmail = tenant.ContactEmail,
                BankAccountIBAN = tenant.BankAccountIBAN,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt,
                TotalDebtors = tenant.Debtors.Count,
                TotalCases = tenant.Cases.Count,
                TotalVolume = tenant.Cases.Sum(c => c.TotalAmount)
            };

            _logger.LogInformation("Tenant {TenantId} updated by user {UserId}", id, currentUser.Id);

            return Result<TenantDto>.Success(tenantDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tenant {TenantId} by user {UserId}", id, currentUser.Id);
            return Result<TenantDto>.Failure("An error occurred while updating the tenant");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can delete tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result.Failure("Only administrators can delete tenants");
            }

            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result.Failure("Tenant not found");
            }

            // Check if tenant has dependencies
            if (tenant.Debtors.Any() || tenant.Cases.Any())
            {
                return Result.Failure("Cannot delete tenant with existing debtors or cases");
            }

            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tenant {TenantId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the tenant");
        }
    }
}
