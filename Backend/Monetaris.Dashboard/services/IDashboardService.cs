using Monetaris.Dashboard.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Dashboard.Services;

/// <summary>
/// Service interface for Dashboard operations
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Get dashboard statistics for the current user
    /// </summary>
    Task<Result<DashboardStatsDto>> GetStatsAsync(User currentUser);

    /// <summary>
    /// Get financial data for charts
    /// </summary>
    Task<Result<FinancialChartDto>> GetFinancialDataAsync(User currentUser);

    /// <summary>
    /// Global search across all entities
    /// </summary>
    Task<Result<List<SearchResultDto>>> SearchAsync(string query, User currentUser);
}
