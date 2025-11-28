using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Helpers;

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
            IQueryable<Shared.Models.Entities.Kreditor> query = _context.Kreditoren;

            // Role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                // CLIENT users can only see their own kreditor
                if (currentUser.KreditorId == null)
                {
                    return Result<List<KreditorDto>>.Failure("Client user has no assigned kreditor");
                }
                query = query.Where(k => k.Id == currentUser.KreditorId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                // AGENT users can see assigned kreditoren
                var assignedKreditorIds = await _context.UserKreditorAssignments
                    .Where(uka => uka.UserId == currentUser.Id)
                    .Select(uka => uka.KreditorId)
                    .ToListAsync();

                query = query.Where(k => assignedKreditorIds.Contains(k.Id));
            }
            // ADMIN sees all kreditoren (no filter)

            var kreditoren = await query
                .Include(k => k.Debtors)
                .Include(k => k.Cases)
                .ToListAsync();

            var kreditorDtos = kreditoren.Select(k => new KreditorDto
            {
                Id = k.Id,
                Name = k.Name,
                RegistrationNumber = k.RegistrationNumber,
                ContactEmail = k.ContactEmail,
                BankAccountIBAN = SensitiveDataHelper.CanViewFullIBAN(currentUser.Role)
                    ? k.BankAccountIBAN
                    : SensitiveDataHelper.MaskIBAN(k.BankAccountIBAN),
                CreatedAt = k.CreatedAt,
                UpdatedAt = k.UpdatedAt,
                TotalDebtors = k.Debtors.Count,
                TotalCases = k.Cases.Count,
                TotalVolume = k.Cases.Sum(c => c.TotalAmount)
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
            var kreditor = await _context.Kreditoren
                .Include(k => k.Debtors)
                .Include(k => k.Cases)
                .FirstOrDefaultAsync(k => k.Id == id);

            if (kreditor == null)
            {
                return Result<KreditorDto>.Failure("Kreditor not found");
            }

            // Authorization check
            if (currentUser.Role == UserRole.CLIENT && currentUser.KreditorId != id)
            {
                return Result<KreditorDto>.Failure("Access denied");
            }

            if (currentUser.Role == UserRole.AGENT)
            {
                var hasAccess = await _context.UserKreditorAssignments
                    .AnyAsync(uka => uka.UserId == currentUser.Id && uka.KreditorId == id);

                if (!hasAccess)
                {
                    return Result<KreditorDto>.Failure("Access denied");
                }
            }

            // Mask IBAN based on user role
            var showFullIBAN = SensitiveDataHelper.CanViewFullIBAN(currentUser.Role);
            if (showFullIBAN)
            {
                _logger.LogInformation("Full IBAN accessed for Kreditor {KreditorId} by User {UserId} ({Role})",
                    id, currentUser.Id, currentUser.Role);
            }

            var kreditorDto = new KreditorDto
            {
                Id = kreditor.Id,
                Name = kreditor.Name,
                RegistrationNumber = kreditor.RegistrationNumber,
                ContactEmail = kreditor.ContactEmail,
                BankAccountIBAN = showFullIBAN
                    ? kreditor.BankAccountIBAN
                    : SensitiveDataHelper.MaskIBAN(kreditor.BankAccountIBAN),
                CreatedAt = kreditor.CreatedAt,
                UpdatedAt = kreditor.UpdatedAt,
                TotalDebtors = kreditor.Debtors.Count,
                TotalCases = kreditor.Cases.Count,
                TotalVolume = kreditor.Cases.Sum(c => c.TotalAmount)
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
            // Authorization: Only ADMIN can create kreditoren
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<KreditorDto>.Failure("Only administrators can create kreditoren");
            }

            // Check for duplicate registration number
            var existingKreditor = await _context.Kreditoren
                .FirstOrDefaultAsync(k => k.RegistrationNumber == request.RegistrationNumber);

            if (existingKreditor != null)
            {
                return Result<KreditorDto>.Failure("A kreditor with this registration number already exists");
            }

            var kreditor = new Shared.Models.Entities.Kreditor
            {
                Name = request.Name,
                RegistrationNumber = request.RegistrationNumber,
                ContactEmail = request.ContactEmail,
                BankAccountIBAN = request.BankAccountIBAN
            };

            _context.Kreditoren.Add(kreditor);
            await _context.SaveChangesAsync();

            var kreditorDto = new KreditorDto
            {
                Id = kreditor.Id,
                Name = kreditor.Name,
                RegistrationNumber = kreditor.RegistrationNumber,
                ContactEmail = kreditor.ContactEmail,
                BankAccountIBAN = kreditor.BankAccountIBAN,
                CreatedAt = kreditor.CreatedAt,
                UpdatedAt = kreditor.UpdatedAt,
                TotalDebtors = 0,
                TotalCases = 0,
                TotalVolume = 0
            };

            _logger.LogInformation("Kreditor {KreditorId} created by user {UserId}", kreditor.Id, currentUser.Id);

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
            // Authorization: Only ADMIN can update kreditoren
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result<KreditorDto>.Failure("Only administrators can update kreditoren");
            }

            var kreditor = await _context.Kreditoren
                .Include(k => k.Debtors)
                .Include(k => k.Cases)
                .FirstOrDefaultAsync(k => k.Id == id);

            if (kreditor == null)
            {
                return Result<KreditorDto>.Failure("Kreditor not found");
            }

            // Check for duplicate registration number (excluding current kreditor)
            var duplicateKreditor = await _context.Kreditoren
                .FirstOrDefaultAsync(k => k.RegistrationNumber == request.RegistrationNumber && k.Id != id);

            if (duplicateKreditor != null)
            {
                return Result<KreditorDto>.Failure("A kreditor with this registration number already exists");
            }

            kreditor.Name = request.Name;
            kreditor.RegistrationNumber = request.RegistrationNumber;
            kreditor.ContactEmail = request.ContactEmail;
            kreditor.BankAccountIBAN = request.BankAccountIBAN;

            await _context.SaveChangesAsync();

            var kreditorDto = new KreditorDto
            {
                Id = kreditor.Id,
                Name = kreditor.Name,
                RegistrationNumber = kreditor.RegistrationNumber,
                ContactEmail = kreditor.ContactEmail,
                BankAccountIBAN = kreditor.BankAccountIBAN,
                CreatedAt = kreditor.CreatedAt,
                UpdatedAt = kreditor.UpdatedAt,
                TotalDebtors = kreditor.Debtors.Count,
                TotalCases = kreditor.Cases.Count,
                TotalVolume = kreditor.Cases.Sum(c => c.TotalAmount)
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
            // Authorization: Only ADMIN can delete kreditoren
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result.Failure("Only administrators can delete kreditoren");
            }

            var kreditor = await _context.Kreditoren
                .Include(k => k.Debtors)
                .Include(k => k.Cases)
                .FirstOrDefaultAsync(k => k.Id == id);

            if (kreditor == null)
            {
                return Result.Failure("Kreditor not found");
            }

            // Check if kreditor has dependencies
            if (kreditor.Debtors.Any() || kreditor.Cases.Any())
            {
                return Result.Failure("Cannot delete kreditor with existing debtors or cases");
            }

            _context.Kreditoren.Remove(kreditor);
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
