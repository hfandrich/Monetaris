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
                .Include(d => d.Kreditor)
                .Include(d => d.Agent)
                .Include(d => d.Cases);

            // Role-based filtering
            query = ApplyRoleBasedFiltering(query, currentUser);

            // Apply filters
            if (filters.KreditorId.HasValue)
            {
                query = query.Where(d => d.KreditorId == filters.KreditorId.Value);
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

            // Exact email filter (for debtor portal lookup)
            if (!string.IsNullOrWhiteSpace(filters.Email))
            {
                var emailLower = filters.Email.ToLower();
                query = query.Where(d => d.Email != null && d.Email.ToLower() == emailLower);
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
                .Include(d => d.Kreditor)
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
                EntityType = d.EntityType,
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
            // Verify kreditor exists and user has access
            var kreditor = await _context.Kreditoren.FindAsync(request.KreditorId);
            if (kreditor == null)
            {
                return Result<DebtorDto>.Failure("Kreditor not found");
            }

            if (!await HasAccessToKreditor(request.KreditorId, currentUser))
            {
                return Result<DebtorDto>.Failure("Access denied to this kreditor");
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
                KreditorId = request.KreditorId,
                AgentId = request.AgentId,
                EntityType = request.EntityType,
                CompanyName = request.CompanyName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                BirthName = request.BirthName,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                BirthPlace = request.BirthPlace,
                BirthCountry = request.BirthCountry,
                Email = request.Email,
                Street = request.Street,
                HouseNumber = request.HouseNumber,
                ZipCode = request.ZipCode,
                City = request.City,
                CityDistrict = request.CityDistrict,
                Floor = request.Floor,
                DoorPosition = request.DoorPosition,
                AdditionalAddressInfo = request.AdditionalAddressInfo,
                POBox = request.POBox,
                POBoxZipCode = request.POBoxZipCode,
                Country = request.Country,
                AddressStatus = request.AddressStatus,
                RepresentedBy = request.RepresentedBy,
                IsDeceased = request.IsDeceased,
                PlaceOfDeath = request.PlaceOfDeath,
                PhoneLandline = request.PhoneLandline,
                PhoneMobile = request.PhoneMobile,
                Fax = request.Fax,
                EboAddress = request.EboAddress,
                BankIBAN = request.BankIBAN,
                BankBIC = request.BankBIC,
                BankName = request.BankName,
                RegisterCourt = request.RegisterCourt,
                RegisterNumber = request.RegisterNumber,
                VatId = request.VatId,
                Partners = request.Partners,
                FileReference = request.FileReference,
                RiskScore = request.RiskScore,
                Notes = request.Notes,
                TotalDebt = 0,
                OpenCases = 0
            };

            _context.Debtors.Add(debtor);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            debtor = await _context.Debtors
                .Include(d => d.Kreditor)
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
                .Include(d => d.Kreditor)
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
            debtor.EntityType = request.EntityType;
            debtor.CompanyName = request.CompanyName;
            debtor.FirstName = request.FirstName;
            debtor.LastName = request.LastName;
            debtor.BirthName = request.BirthName;
            debtor.Gender = request.Gender;
            debtor.DateOfBirth = request.DateOfBirth;
            debtor.BirthPlace = request.BirthPlace;
            debtor.BirthCountry = request.BirthCountry;
            debtor.Email = request.Email;
            debtor.Street = request.Street;
            debtor.HouseNumber = request.HouseNumber;
            debtor.ZipCode = request.ZipCode;
            debtor.City = request.City;
            debtor.CityDistrict = request.CityDistrict;
            debtor.Floor = request.Floor;
            debtor.DoorPosition = request.DoorPosition;
            debtor.AdditionalAddressInfo = request.AdditionalAddressInfo;
            debtor.POBox = request.POBox;
            debtor.POBoxZipCode = request.POBoxZipCode;
            debtor.Country = request.Country;
            debtor.AddressStatus = request.AddressStatus;
            debtor.RepresentedBy = request.RepresentedBy;
            debtor.IsDeceased = request.IsDeceased;
            debtor.PlaceOfDeath = request.PlaceOfDeath;
            debtor.PhoneLandline = request.PhoneLandline;
            debtor.PhoneMobile = request.PhoneMobile;
            debtor.Fax = request.Fax;
            debtor.EboAddress = request.EboAddress;
            debtor.BankIBAN = request.BankIBAN;
            debtor.BankBIC = request.BankBIC;
            debtor.BankName = request.BankName;
            debtor.RegisterCourt = request.RegisterCourt;
            debtor.RegisterNumber = request.RegisterNumber;
            debtor.VatId = request.VatId;
            debtor.Partners = request.Partners;
            debtor.FileReference = request.FileReference;
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
            if (currentUser.KreditorId == null)
            {
                return query.Where(d => false); // Return empty
            }
            query = query.Where(d => d.KreditorId == currentUser.KreditorId.Value);
        }
        else if (currentUser.Role == UserRole.AGENT)
        {
            var assignedKreditorIds = _context.UserKreditorAssignments
                .Where(uka => uka.UserId == currentUser.Id)
                .Select(uka => uka.KreditorId);

            query = query.Where(d => assignedKreditorIds.Contains(d.KreditorId));
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
            return currentUser.KreditorId == debtor.KreditorId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserKreditorAssignments
                .AnyAsync(uka => uka.UserId == currentUser.Id && uka.KreditorId == debtor.KreditorId);
        }

        return false;
    }

    private async Task<bool> HasAccessToKreditor(Guid kreditorId, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.KreditorId == kreditorId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserKreditorAssignments
                .AnyAsync(uka => uka.UserId == currentUser.Id && uka.KreditorId == kreditorId);
        }

        return false;
    }

    private DebtorDto MapToDto(Shared.Models.Entities.Debtor debtor)
    {
        return new DebtorDto
        {
            Id = debtor.Id,
            KreditorId = debtor.KreditorId,
            AgentId = debtor.AgentId,
            EntityType = debtor.EntityType,
            CompanyName = debtor.CompanyName,
            FirstName = debtor.FirstName,
            LastName = debtor.LastName,
            BirthName = debtor.BirthName,
            Gender = debtor.Gender,
            DateOfBirth = debtor.DateOfBirth,
            BirthPlace = debtor.BirthPlace,
            BirthCountry = debtor.BirthCountry,
            Email = debtor.Email,
            Street = debtor.Street,
            HouseNumber = debtor.HouseNumber,
            ZipCode = debtor.ZipCode,
            City = debtor.City,
            CityDistrict = debtor.CityDistrict,
            Floor = debtor.Floor,
            DoorPosition = debtor.DoorPosition,
            AdditionalAddressInfo = debtor.AdditionalAddressInfo,
            POBox = debtor.POBox,
            POBoxZipCode = debtor.POBoxZipCode,
            Country = debtor.Country,
            AddressStatus = debtor.AddressStatus,
            AddressLastChecked = debtor.AddressLastChecked,
            RepresentedBy = debtor.RepresentedBy,
            IsDeceased = debtor.IsDeceased,
            PlaceOfDeath = debtor.PlaceOfDeath,
            PhoneLandline = debtor.PhoneLandline,
            PhoneMobile = debtor.PhoneMobile,
            Fax = debtor.Fax,
            EboAddress = debtor.EboAddress,
            BankIBAN = debtor.BankIBAN,
            BankBIC = debtor.BankBIC,
            BankName = debtor.BankName,
            RegisterCourt = debtor.RegisterCourt,
            RegisterNumber = debtor.RegisterNumber,
            VatId = debtor.VatId,
            Partners = debtor.Partners,
            FileReference = debtor.FileReference,
            RiskScore = debtor.RiskScore,
            TotalDebt = debtor.TotalDebt,
            OpenCases = debtor.OpenCases,
            Notes = debtor.Notes,
            CreatedAt = debtor.CreatedAt,
            UpdatedAt = debtor.UpdatedAt,
            KreditorName = debtor.Kreditor?.Name ?? string.Empty,
            AgentName = debtor.Agent?.Name
        };
    }
}
