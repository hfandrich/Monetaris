using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Monetaris.Shared.Interfaces;
using Monetaris.User.Services;
using MonetarisApi.Data;
using MonetarisApi.Middleware;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerGen;

// =============================================
// Configure Serilog
// =============================================
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
        .Build())
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/monetaris-.log", rollingInterval: RollingInterval.Day)
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

try
{
    Log.Information("Starting Monetaris API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

    // =============================================
    // Add services to the container
    // =============================================

    // Configure Database (conditional for testing)
    if (builder.Environment.EnvironmentName != "Testing")
    {
        // Use PostgreSQL for production and development
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Register IApplicationDbContext interface
        builder.Services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());
    }
    // Note: Testing environment will configure its own database provider

    // Configure CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("FrontendPolicy", policy =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:3000" };

            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Configure JWT Authentication
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = jwtSettings["SecretKey"]
        ?? throw new InvalidOperationException("JWT SecretKey is missing from configuration");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.Zero // Remove default 5 minute clock skew
            };
        });

    builder.Services.AddAuthorization();

    // Register authentication services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

    // Register domain services
    builder.Services.AddScoped<Monetaris.Tenant.Services.ITenantService, Monetaris.Tenant.Services.TenantService>();
    builder.Services.AddScoped<Monetaris.Kreditor.Services.IKreditorService, Monetaris.Kreditor.Services.KreditorService>();
    builder.Services.AddScoped<Monetaris.Debtor.Services.IDebtorService, Monetaris.Debtor.Services.DebtorService>();
    builder.Services.AddScoped<Monetaris.Document.Services.IDocumentService, Monetaris.Document.Services.DocumentService>();
    builder.Services.AddScoped<Monetaris.Inquiry.Services.IInquiryService, Monetaris.Inquiry.Services.InquiryService>();
    builder.Services.AddScoped<Monetaris.Template.Services.ITemplateService, Monetaris.Template.Services.TemplateService>();
    builder.Services.AddScoped<Monetaris.Dashboard.Services.IDashboardService, Monetaris.Dashboard.Services.DashboardService>();
    builder.Services.AddScoped<Monetaris.Case.Services.ICaseService, Monetaris.Case.Services.CaseService>();
    builder.Services.AddScoped<Monetaris.Case.Services.IWorkflowEngine, Monetaris.Case.Services.WorkflowEngine>();

    // Register FluentValidation validators
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Tenant.Validators.CreateTenantRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Debtor.Validators.CreateDebtorRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Inquiry.Validators.CreateInquiryRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Template.Validators.CreateTemplateRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Case.Validators.CreateCaseRequestValidator>();

    // Add controllers
    builder.Services.AddControllers();

    // Configure Swagger/OpenAPI
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Monetaris API",
            Version = "v1",
            Description = "Enterprise Debt Collection Management System API - ZPO Compliant",
            Contact = new OpenApiContact
            {
                Name = "Monetaris Team",
                Email = "info@monetaris.com"
            }
        });

        // JWT Authentication configuration for Swagger
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: 'Bearer 12345abcdef'",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    // =============================================
    // Apply database migrations and seed data
    // =============================================
    if (app.Environment.EnvironmentName != "Testing")
    {
        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            try
            {
                Log.Information("Applying database migrations...");
                dbContext.Database.Migrate();
                Log.Information("Database migrations applied successfully");

                // Seed database
                var seeder = new DatabaseSeeder(
                    dbContext,
                    scope.ServiceProvider.GetRequiredService<ILogger<DatabaseSeeder>>()
                );
                await seeder.SeedAsync();
            }
            catch (Exception ex)
            {
                Log.Error(ex, "An error occurred while applying database migrations or seeding data");
                throw;
            }
        }
    }

    // =============================================
    // Configure the HTTP request pipeline
    // =============================================

    // Global error handling middleware (must be first)
    app.UseMiddleware<ErrorHandlingMiddleware>();

    // Serilog request logging
    app.UseSerilogRequestLogging();

    // Swagger in development
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Monetaris API v1");
            options.RoutePrefix = "swagger";
        });
    }

    app.UseHttpsRedirection();

    // CORS middleware
    app.UseCors("FrontendPolicy");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Map controllers
    app.MapControllers();

    // Health check endpoint
    app.MapGet("/health", () => Results.Ok(new
    {
        status = "Healthy",
        timestamp = DateTime.UtcNow,
        version = "1.0.0"
    }))
    .WithName("HealthCheck")
    .WithTags("System");

    Log.Information("Monetaris API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// Make Program class accessible to integration tests
public partial class Program { }
