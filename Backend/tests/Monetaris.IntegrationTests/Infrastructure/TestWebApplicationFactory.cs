using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Interfaces;
using MonetarisApi.Data;

namespace Monetaris.IntegrationTests.Infrastructure;

/// <summary>
/// Test web application factory for integration tests
/// Uses in-memory database instead of PostgreSQL
/// </summary>
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set testing environment BEFORE ConfigureServices
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Add in-memory database for testing
            // Since Program.cs checks for Testing environment, it won't register PostgreSQL
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
            });

            // Register IApplicationDbContext interface
            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<ApplicationDbContext>());
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Seed database after host is created
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<DatabaseSeeder>>();

        // Ensure database is created
        db.Database.EnsureCreated();

        // Seed test data
        var seeder = new DatabaseSeeder(db, logger);
        seeder.SeedAsync().Wait();

        return host;
    }
}
