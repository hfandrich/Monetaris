using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Inquiry.Models;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Inquiry.Services;

/// <summary>
/// Service implementation for Inquiry operations
/// </summary>
public class InquiryService : IInquiryService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<InquiryService> _logger;

    public InquiryService(IApplicationDbContext context, ILogger<InquiryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<InquiryDto>>> GetAllAsync(User currentUser)
    {
        try
        {
            IQueryable<Shared.Models.Entities.Inquiry> query = _context.Inquiries
                .Include(i => i.Case)
                    .ThenInclude(c => c.Debtor)
                .Include(i => i.Case)
                    .ThenInclude(c => c.Tenant)
                .Include(i => i.CreatedByUser);

            // Role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                if (currentUser.TenantId == null)
                {
                    return Result<List<InquiryDto>>.Failure("Client user has no assigned tenant");
                }
                query = query.Where(i => i.Case.TenantId == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                query = query.Where(i => assignedTenantIds.Contains(i.Case.TenantId));
            }
            // ADMIN sees all

            var inquiries = await query
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            var inquiryDtos = inquiries.Select(MapToDto).ToList();

            _logger.LogInformation("Retrieved {Count} inquiries for user {UserId}",
                inquiryDtos.Count, currentUser.Id);

            return Result<List<InquiryDto>>.Success(inquiryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving inquiries for user {UserId}", currentUser.Id);
            return Result<List<InquiryDto>>.Failure("An error occurred while retrieving inquiries");
        }
    }

    public async Task<Result<InquiryDto>> CreateAsync(CreateInquiryRequest request, User currentUser)
    {
        try
        {
            // Verify case exists and user has access
            var caseEntity = await _context.Cases
                .Include(c => c.Tenant)
                .Include(c => c.Debtor)
                .FirstOrDefaultAsync(c => c.Id == request.CaseId);

            if (caseEntity == null)
            {
                return Result<InquiryDto>.Failure("Case not found");
            }

            if (!await HasAccessToCase(caseEntity, currentUser))
            {
                return Result<InquiryDto>.Failure("Access denied to this case");
            }

            var inquiry = new Shared.Models.Entities.Inquiry
            {
                CaseId = request.CaseId,
                Question = request.Question,
                Status = InquiryStatus.OPEN,
                CreatedBy = currentUser.Id
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            inquiry = await _context.Inquiries
                .Include(i => i.Case)
                    .ThenInclude(c => c.Debtor)
                .Include(i => i.Case)
                    .ThenInclude(c => c.Tenant)
                .Include(i => i.CreatedByUser)
                .FirstAsync(i => i.Id == inquiry.Id);

            var inquiryDto = MapToDto(inquiry);

            _logger.LogInformation("Inquiry {InquiryId} created by user {UserId}", inquiry.Id, currentUser.Id);

            return Result<InquiryDto>.Success(inquiryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating inquiry by user {UserId}", currentUser.Id);
            return Result<InquiryDto>.Failure("An error occurred while creating the inquiry");
        }
    }

    public async Task<Result<InquiryDto>> ResolveAsync(Guid id, ResolveInquiryRequest request, User currentUser)
    {
        try
        {
            var inquiry = await _context.Inquiries
                .Include(i => i.Case)
                    .ThenInclude(c => c.Debtor)
                .Include(i => i.Case)
                    .ThenInclude(c => c.Tenant)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inquiry == null)
            {
                return Result<InquiryDto>.Failure("Inquiry not found");
            }

            if (!await HasAccessToCase(inquiry.Case, currentUser))
            {
                return Result<InquiryDto>.Failure("Access denied");
            }

            if (inquiry.Status == InquiryStatus.RESOLVED)
            {
                return Result<InquiryDto>.Failure("Inquiry is already resolved");
            }

            inquiry.Answer = request.Answer;
            inquiry.Status = InquiryStatus.RESOLVED;
            inquiry.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var inquiryDto = MapToDto(inquiry);

            _logger.LogInformation("Inquiry {InquiryId} resolved by user {UserId}", id, currentUser.Id);

            return Result<InquiryDto>.Success(inquiryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving inquiry {InquiryId} by user {UserId}", id, currentUser.Id);
            return Result<InquiryDto>.Failure("An error occurred while resolving the inquiry");
        }
    }

    // Helper methods

    private async Task<bool> HasAccessToCase(Case caseEntity, User currentUser)
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

    private InquiryDto MapToDto(Shared.Models.Entities.Inquiry inquiry)
    {
        var debtorName = inquiry.Case.Debtor.IsCompany
            ? inquiry.Case.Debtor.CompanyName ?? "Unknown"
            : $"{inquiry.Case.Debtor.FirstName} {inquiry.Case.Debtor.LastName}";

        return new InquiryDto
        {
            Id = inquiry.Id,
            CaseId = inquiry.CaseId,
            Question = inquiry.Question,
            Answer = inquiry.Answer,
            Status = inquiry.Status,
            CreatedBy = inquiry.CreatedBy,
            ResolvedAt = inquiry.ResolvedAt,
            CreatedAt = inquiry.CreatedAt,
            CaseNumber = inquiry.Case.InvoiceNumber,
            DebtorName = debtorName,
            CreatedByName = inquiry.CreatedByUser?.Name ?? "Unknown"
        };
    }
}
