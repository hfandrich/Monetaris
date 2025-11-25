using Microsoft.EntityFrameworkCore;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Shared.Interfaces;

/// <summary>
/// Interface for ApplicationDbContext
/// Allows domain projects to depend on abstraction rather than concrete implementation
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<UserTenantAssignment> UserTenantAssignments { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Debtor> Debtors { get; }
    DbSet<Case> Cases { get; }
    DbSet<CaseHistory> CaseHistories { get; }
    DbSet<Document> Documents { get; }
    DbSet<Inquiry> Inquiries { get; }
    DbSet<Template> Templates { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}
