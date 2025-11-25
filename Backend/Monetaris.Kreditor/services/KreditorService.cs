using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Kreditor.Models;

namespace Monetaris.Kreditor.Services;

/// <summary>
/// Service implementation for Kreditor operations
/// </summary>
public class KreditorService : IKreditorService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<KreditorService> _logger;

    public KreditorService(IApplicationDbContext context, ILogger<KreditorService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<KreditorDto>>> GetAllAsync(User currentUser)
    {
        try
        {
            IQueryable<Tenant> query = _context.Tenants;

            // Role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                // CLIENT users can only see their own tenant
                if (currentUser.TenantId == null)
                {
                    return Result<List<KreditorDto>>.Failure("Client user has no assigned tenant");
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

            var kreditorDtos = tenants.Select(t => new KreditorDto
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

            _logger.LogInformation("Retrieved {Count} kreditoren for user {UserId} ({Role})",
                kreditorDtos.Count, currentUser.Id, currentUser.Role);

            return Result<List<KreditorDto>>.Success(kreditorDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving kreditoren for user {UserId}", currentUser.Id);
            return Result<List<KreditorDto>>.Failure("An error occurred while retrieving kreditoren");
        }
    }

    public async Task<Result<KreditorDto>> GetByIdAsync(Guid id, User currentUser)
    {
        try
        {
            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result<KreditorDto>.Failure("Kreditor not found");
            }

            // Authorization check
            if (currentUser.Role == UserRole.CLIENT && currentUser.TenantId != id)
            {
                return Result<KreditorDto>.Failure("Access denied");
            }

            if (currentUser.Role == UserRole.AGENT)
            {
                var hasAccess = await _context.UserTenantAssignments
                    .AnyAsync(uta => uta.UserId == currentUser.Id && uta.TenantId == id);

                if (!hasAccess)
                {
                    return Result<KreditorDto>.Failure("Access denied");
                }
            }

            var kreditorDto = new KreditorDto
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

            _logger.LogInformation("Retrieved kreditor {KreditorId} for user {UserId}", id, currentUser.Id);

            return Result<KreditorDto>.Success(kreditorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving kreditor {KreditorId} for user {UserId}", id, currentUser.Id);
            return Result<KreditorDto>.Failure("An error occurred while retrieving the kreditor");
        }
    }

    public async Task<Result<KreditorDto>> CreateAsync(CreateKreditorRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can create tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<KreditorDto>.Failure("Only administrators can create kreditoren");
            }

            // Check for duplicate registration number
            var existingTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RegistrationNumber == request.RegistrationNumber);

            if (existingTenant != null)
            {
                return Result<KreditorDto>.Failure("A kreditor with this registration number already exists");
            }

            var tenant = new Tenant
            {
                Name = request.Name,
                RegistrationNumber = request.RegistrationNumber,
                ContactEmail = request.ContactEmail,
                BankAccountIBAN = request.BankAccountIBAN
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var kreditorDto = new KreditorDto
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

            _logger.LogInformation("Kreditor {KreditorId} created by user {UserId}", tenant.Id, currentUser.Id);

            return Result<KreditorDto>.Success(kreditorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating kreditor by user {UserId}", currentUser.Id);
            return Result<KreditorDto>.Failure("An error occurred while creating the kreditor");
        }
    }

    public async Task<Result<KreditorDto>> UpdateAsync(Guid id, UpdateKreditorRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can update tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<KreditorDto>.Failure("Only administrators can update kreditoren");
            }

            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result<KreditorDto>.Failure("Kreditor not found");
            }

            // Check for duplicate registration number (excluding current tenant)
            var duplicateTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RegistrationNumber == request.RegistrationNumber && t.Id != id);

            if (duplicateTenant != null)
            {
                return Result<KreditorDto>.Failure("A kreditor with this registration number already exists");
            }

            tenant.Name = request.Name;
            tenant.RegistrationNumber = request.RegistrationNumber;
            tenant.ContactEmail = request.ContactEmail;
            tenant.BankAccountIBAN = request.BankAccountIBAN;

            await _context.SaveChangesAsync();

            var kreditorDto = new KreditorDto
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

            _logger.LogInformation("Kreditor {KreditorId} updated by user {UserId}", id, currentUser.Id);

            return Result<KreditorDto>.Success(kreditorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating kreditor {KreditorId} by user {UserId}", id, currentUser.Id);
            return Result<KreditorDto>.Failure("An error occurred while updating the kreditor");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can delete tenants
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result.Failure("Only administrators can delete kreditoren");
            }

            var tenant = await _context.Tenants
                .Include(t => t.Debtors)
                .Include(t => t.Cases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return Result.Failure("Kreditor not found");
            }

            // Check if tenant has dependencies
            if (tenant.Debtors.Any() || tenant.Cases.Any())
            {
                return Result.Failure("Cannot delete kreditor with existing debtors or cases");
            }

            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Kreditor {KreditorId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting kreditor {KreditorId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the kreditor");
        }
    }
}
