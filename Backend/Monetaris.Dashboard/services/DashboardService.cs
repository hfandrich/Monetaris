using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Dashboard.Models;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Dashboard.Services;

/// <summary>
/// Service implementation for Dashboard operations with KPI calculations
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(IApplicationDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<DashboardStatsDto>> GetStatsAsync(User currentUser)
    {
        try
        {
            IQueryable<Case> casesQuery = _context.Cases;
            IQueryable<Debtor> debtorsQuery = _context.Debtors;
            IQueryable<Tenant> tenantsQuery = _context.Tenants;

            // Apply role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                if (currentUser.TenantId == null)
                {
                    return Result<DashboardStatsDto>.Failure("Client user has no assigned tenant");
                }
                casesQuery = casesQuery.Where(c => c.TenantId == currentUser.TenantId.Value);
                debtorsQuery = debtorsQuery.Where(d => d.TenantId == currentUser.TenantId.Value);
                tenantsQuery = tenantsQuery.Where(t => t.Id == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                casesQuery = casesQuery.Where(c => assignedTenantIds.Contains(c.TenantId));
                debtorsQuery = debtorsQuery.Where(d => assignedTenantIds.Contains(d.TenantId));
                tenantsQuery = tenantsQuery.Where(t => assignedTenantIds.Contains(t.Id));
            }
            // ADMIN sees all

            // Calculate statistics
            var cases = await casesQuery.ToListAsync();

            // Active cases (not in closure states)
            var activeCases = cases.Count(c =>
                c.Status != CaseStatus.PAID &&
                c.Status != CaseStatus.SETTLED &&
                c.Status != CaseStatus.INSOLVENCY &&
                c.Status != CaseStatus.UNCOLLECTIBLE);

            // Legal cases (in court or enforcement)
            var legalCases = cases.Count(c =>
                c.Status == CaseStatus.MB_REQUESTED ||
                c.Status == CaseStatus.MB_ISSUED ||
                c.Status == CaseStatus.MB_OBJECTION ||
                c.Status == CaseStatus.VB_REQUESTED ||
                c.Status == CaseStatus.VB_ISSUED ||
                c.Status == CaseStatus.TITLE_OBTAINED ||
                c.Status == CaseStatus.ENFORCEMENT_PREP ||
                c.Status == CaseStatus.GV_MANDATED ||
                c.Status == CaseStatus.EV_TAKEN);

            // Total volume (sum of all active cases)
            var totalVolume = cases
                .Where(c => c.Status != CaseStatus.PAID &&
                           c.Status != CaseStatus.SETTLED &&
                           c.Status != CaseStatus.INSOLVENCY &&
                           c.Status != CaseStatus.UNCOLLECTIBLE)
                .Sum(c => c.TotalAmount);

            // Success rate (paid/settled vs total closed)
            var closedCases = cases.Count(c =>
                c.Status == CaseStatus.PAID ||
                c.Status == CaseStatus.SETTLED ||
                c.Status == CaseStatus.INSOLVENCY ||
                c.Status == CaseStatus.UNCOLLECTIBLE);

            var successfulCases = cases.Count(c =>
                c.Status == CaseStatus.PAID ||
                c.Status == CaseStatus.SETTLED);

            var successRate = closedCases > 0 ? (double)successfulCases / closedCases * 100 : 0;

            // Projected recovery (estimate based on success rate and active cases)
            var projectedRecovery = totalVolume * (decimal)(successRate / 100);

            var totalDebtors = await debtorsQuery.CountAsync();
            var totalTenants = await tenantsQuery.CountAsync();

            var stats = new DashboardStatsDto
            {
                TotalVolume = totalVolume,
                ActiveCases = activeCases,
                LegalCases = legalCases,
                SuccessRate = Math.Round(successRate, 2),
                ProjectedRecovery = projectedRecovery,
                TotalDebtors = totalDebtors,
                TotalTenants = totalTenants
            };

            _logger.LogInformation("Retrieved dashboard stats for user {UserId}", currentUser.Id);

            return Result<DashboardStatsDto>.Success(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard stats for user {UserId}", currentUser.Id);
            return Result<DashboardStatsDto>.Failure("An error occurred while retrieving dashboard statistics");
        }
    }

    public async Task<Result<FinancialChartDto>> GetFinancialDataAsync(User currentUser)
    {
        try
        {
            IQueryable<Case> casesQuery = _context.Cases;

            // Apply role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                if (currentUser.TenantId == null)
                {
                    return Result<FinancialChartDto>.Failure("Client user has no assigned tenant");
                }
                casesQuery = casesQuery.Where(c => c.TenantId == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                casesQuery = casesQuery.Where(c => assignedTenantIds.Contains(c.TenantId));
            }
            // ADMIN sees all

            // Get cases resolved (paid/settled) in the last 12 months
            var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);

            var resolvedCases = await casesQuery
                .Where(c => (c.Status == CaseStatus.PAID || c.Status == CaseStatus.SETTLED) &&
                           c.UpdatedAt >= twelveMonthsAgo)
                .ToListAsync();

            // Group by month
            var monthlyData = resolvedCases
                .GroupBy(c => new { c.UpdatedAt.Year, c.UpdatedAt.Month })
                .Select(g => new MonthlyDataPoint
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(c => c.TotalAmount),
                    CasesResolved = g.Count()
                })
                .OrderBy(m => m.Month)
                .ToList();

            var chartData = new FinancialChartDto
            {
                MonthlyRevenue = monthlyData
            };

            _logger.LogInformation("Retrieved financial chart data for user {UserId}", currentUser.Id);

            return Result<FinancialChartDto>.Success(chartData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving financial data for user {UserId}", currentUser.Id);
            return Result<FinancialChartDto>.Failure("An error occurred while retrieving financial data");
        }
    }

    public async Task<Result<List<SearchResultDto>>> SearchAsync(string query, User currentUser)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Result<List<SearchResultDto>>.Success(new List<SearchResultDto>());
            }

            var searchLower = query.ToLower();
            var results = new List<SearchResultDto>();

            // Search cases
            IQueryable<Case> casesQuery = _context.Cases
                .Include(c => c.Debtor)
                .Include(c => c.Tenant);

            // Apply role-based filtering
            if (currentUser.Role == UserRole.CLIENT && currentUser.TenantId.HasValue)
            {
                casesQuery = casesQuery.Where(c => c.TenantId == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                casesQuery = casesQuery.Where(c => assignedTenantIds.Contains(c.TenantId));
            }

            var matchingCases = await casesQuery
                .Where(c => c.InvoiceNumber.ToLower().Contains(searchLower) ||
                           (c.CourtFileNumber != null && c.CourtFileNumber.ToLower().Contains(searchLower)))
                .Take(5)
                .ToListAsync();

            foreach (var caseEntity in matchingCases)
            {
                var debtorName = caseEntity.Debtor.IsCompany
                    ? caseEntity.Debtor.CompanyName
                    : $"{caseEntity.Debtor.FirstName} {caseEntity.Debtor.LastName}";

                results.Add(new SearchResultDto
                {
                    Type = "case",
                    Id = caseEntity.Id,
                    Title = $"Case {caseEntity.InvoiceNumber}",
                    Subtitle = debtorName ?? "Unknown",
                    AdditionalInfo = $"Status: {caseEntity.Status}, Amount: {caseEntity.TotalAmount:F2} EUR"
                });
            }

            // Search debtors
            IQueryable<Debtor> debtorsQuery = _context.Debtors;

            if (currentUser.Role == UserRole.CLIENT && currentUser.TenantId.HasValue)
            {
                debtorsQuery = debtorsQuery.Where(d => d.TenantId == currentUser.TenantId.Value);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                var assignedTenantIds = await _context.UserTenantAssignments
                    .Where(uta => uta.UserId == currentUser.Id)
                    .Select(uta => uta.TenantId)
                    .ToListAsync();

                debtorsQuery = debtorsQuery.Where(d => assignedTenantIds.Contains(d.TenantId));
            }

            var matchingDebtors = await debtorsQuery
                .Where(d => (d.CompanyName != null && d.CompanyName.ToLower().Contains(searchLower)) ||
                           (d.FirstName != null && d.FirstName.ToLower().Contains(searchLower)) ||
                           (d.LastName != null && d.LastName.ToLower().Contains(searchLower)) ||
                           (d.Email != null && d.Email.ToLower().Contains(searchLower)))
                .Take(5)
                .ToListAsync();

            foreach (var debtor in matchingDebtors)
            {
                var name = debtor.IsCompany
                    ? debtor.CompanyName
                    : $"{debtor.FirstName} {debtor.LastName}";

                results.Add(new SearchResultDto
                {
                    Type = "debtor",
                    Id = debtor.Id,
                    Title = name ?? "Unknown",
                    Subtitle = debtor.Email ?? "No email",
                    AdditionalInfo = $"Open Cases: {debtor.OpenCases}, Debt: {debtor.TotalDebt:F2} EUR"
                });
            }

            // Search tenants (ADMIN only)
            if (currentUser.Role == UserRole.ADMIN)
            {
                var matchingTenants = await _context.Tenants
                    .Where(t => t.Name.ToLower().Contains(searchLower) ||
                               t.RegistrationNumber.ToLower().Contains(searchLower) ||
                               t.ContactEmail.ToLower().Contains(searchLower))
                    .Take(5)
                    .ToListAsync();

                foreach (var tenant in matchingTenants)
                {
                    results.Add(new SearchResultDto
                    {
                        Type = "tenant",
                        Id = tenant.Id,
                        Title = tenant.Name,
                        Subtitle = tenant.ContactEmail,
                        AdditionalInfo = $"Reg. No.: {tenant.RegistrationNumber}"
                    });
                }
            }

            _logger.LogInformation("Global search found {Count} results for query '{Query}' by user {UserId}",
                results.Count, query, currentUser.Id);

            return Result<List<SearchResultDto>>.Success(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing global search for user {UserId}", currentUser.Id);
            return Result<List<SearchResultDto>>.Failure("An error occurred while performing the search");
        }
    }
}
