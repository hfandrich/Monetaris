using Microsoft.EntityFrameworkCore;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace MonetarisApi.Data;

/// <summary>
/// Main database context for Monetaris application
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserTenantAssignment> UserTenantAssignments { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Debtor> Debtors { get; set; }
    public DbSet<Case> Cases { get; set; }
    public DbSet<CaseHistory> CaseHistories { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<Inquiry> Inquiries { get; set; }
    public DbSet<Template> Templates { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =============================================
        // Configure table names (lowercase for PostgreSQL)
        // =============================================
        modelBuilder.Entity<Tenant>().ToTable("tenants");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<UserTenantAssignment>().ToTable("user_tenant_assignments");
        modelBuilder.Entity<RefreshToken>().ToTable("refresh_tokens");
        modelBuilder.Entity<Debtor>().ToTable("debtors");
        modelBuilder.Entity<Case>().ToTable("cases");
        modelBuilder.Entity<CaseHistory>().ToTable("case_history");
        modelBuilder.Entity<Document>().ToTable("documents");
        modelBuilder.Entity<Inquiry>().ToTable("inquiries");
        modelBuilder.Entity<Template>().ToTable("templates");

        // =============================================
        // Configure enums to store as strings
        // =============================================
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Case>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Debtor>()
            .Property(d => d.AddressStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Debtor>()
            .Property(d => d.RiskScore)
            .HasConversion<string>();

        modelBuilder.Entity<Document>()
            .Property(d => d.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Inquiry>()
            .Property(i => i.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Template>()
            .Property(t => t.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Template>()
            .Property(t => t.Category)
            .HasConversion<string>();

        // =============================================
        // Configure composite key for UserTenantAssignment
        // =============================================
        modelBuilder.Entity<UserTenantAssignment>()
            .HasKey(uta => new { uta.UserId, uta.TenantId });

        // =============================================
        // Configure relationships
        // =============================================

        // User -> Tenant (nullable)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany()
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserTenantAssignment -> User
        modelBuilder.Entity<UserTenantAssignment>()
            .HasOne(uta => uta.User)
            .WithMany(u => u.TenantAssignments)
            .HasForeignKey(uta => uta.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserTenantAssignment -> Tenant
        modelBuilder.Entity<UserTenantAssignment>()
            .HasOne(uta => uta.Tenant)
            .WithMany()
            .HasForeignKey(uta => uta.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // RefreshToken -> User
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Debtor -> Tenant
        modelBuilder.Entity<Debtor>()
            .HasOne(d => d.Tenant)
            .WithMany(t => t.Debtors)
            .HasForeignKey(d => d.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Debtor -> Agent (User)
        modelBuilder.Entity<Debtor>()
            .HasOne(d => d.Agent)
            .WithMany()
            .HasForeignKey(d => d.AgentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Case -> Tenant
        modelBuilder.Entity<Case>()
            .HasOne(c => c.Tenant)
            .WithMany(t => t.Cases)
            .HasForeignKey(c => c.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Case -> Debtor
        modelBuilder.Entity<Case>()
            .HasOne(c => c.Debtor)
            .WithMany(d => d.Cases)
            .HasForeignKey(c => c.DebtorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Case -> Agent (User)
        modelBuilder.Entity<Case>()
            .HasOne(c => c.Agent)
            .WithMany()
            .HasForeignKey(c => c.AgentId)
            .OnDelete(DeleteBehavior.SetNull);

        // CaseHistory -> Case
        modelBuilder.Entity<CaseHistory>()
            .HasOne(ch => ch.Case)
            .WithMany(c => c.History)
            .HasForeignKey(ch => ch.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Document -> Debtor
        modelBuilder.Entity<Document>()
            .HasOne(d => d.Debtor)
            .WithMany(db => db.Documents)
            .HasForeignKey(d => d.DebtorId)
            .OnDelete(DeleteBehavior.Cascade);

        // Inquiry -> Case
        modelBuilder.Entity<Inquiry>()
            .HasOne(i => i.Case)
            .WithMany(c => c.Inquiries)
            .HasForeignKey(i => i.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Inquiry -> CreatedBy (User)
        modelBuilder.Entity<Inquiry>()
            .HasOne(i => i.CreatedByUser)
            .WithMany()
            .HasForeignKey(i => i.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // =============================================
        // Configure indexes
        // =============================================

        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.TenantId);

        // Tenant indexes
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.ContactEmail);
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.RegistrationNumber)
            .IsUnique();

        // UserTenantAssignment indexes
        modelBuilder.Entity<UserTenantAssignment>()
            .HasIndex(uta => uta.UserId);
        modelBuilder.Entity<UserTenantAssignment>()
            .HasIndex(uta => uta.TenantId);

        // RefreshToken indexes
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.UserId);
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.ExpiresAt);

        // Debtor indexes
        modelBuilder.Entity<Debtor>()
            .HasIndex(d => d.TenantId);
        modelBuilder.Entity<Debtor>()
            .HasIndex(d => d.AgentId);
        modelBuilder.Entity<Debtor>()
            .HasIndex(d => d.RiskScore);
        modelBuilder.Entity<Debtor>()
            .HasIndex(d => d.Email);

        // Case indexes
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.TenantId);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.DebtorId);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.AgentId);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.Status);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.InvoiceNumber);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.DueDate);
        modelBuilder.Entity<Case>()
            .HasIndex(c => c.NextActionDate);

        // CaseHistory indexes
        modelBuilder.Entity<CaseHistory>()
            .HasIndex(ch => ch.CaseId);
        modelBuilder.Entity<CaseHistory>()
            .HasIndex(ch => ch.CreatedAt);

        // Document indexes
        modelBuilder.Entity<Document>()
            .HasIndex(d => d.DebtorId);
        modelBuilder.Entity<Document>()
            .HasIndex(d => d.UploadedAt);

        // Inquiry indexes
        modelBuilder.Entity<Inquiry>()
            .HasIndex(i => i.CaseId);
        modelBuilder.Entity<Inquiry>()
            .HasIndex(i => i.Status);
        modelBuilder.Entity<Inquiry>()
            .HasIndex(i => i.CreatedBy);

        // Template indexes
        modelBuilder.Entity<Template>()
            .HasIndex(t => t.Type);
        modelBuilder.Entity<Template>()
            .HasIndex(t => t.Category);

        // =============================================
        // Configure column constraints and defaults
        // =============================================

        // Case computed column (TotalAmount) - handled as computed property in entity
        modelBuilder.Entity<Case>()
            .Property(c => c.PrincipalAmount)
            .HasPrecision(15, 2);
        modelBuilder.Entity<Case>()
            .Property(c => c.Costs)
            .HasPrecision(15, 2);
        modelBuilder.Entity<Case>()
            .Property(c => c.Interest)
            .HasPrecision(15, 2);

        // Debtor TotalDebt precision
        modelBuilder.Entity<Debtor>()
            .Property(d => d.TotalDebt)
            .HasPrecision(15, 2);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Automatically update CreatedAt and UpdatedAt timestamps
    /// </summary>
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }

            entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
