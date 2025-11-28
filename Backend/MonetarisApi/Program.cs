using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
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
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

var seqUrl = configuration.GetValue<string>("Serilog:WriteTo:1:Args:serverUrl") ?? "";

var loggerConfig = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/monetaris-.log", rollingInterval: RollingInterval.Day);

if (!string.IsNullOrWhiteSpace(seqUrl))
{
    loggerConfig.WriteTo.Seq(seqUrl);
}

Log.Logger = loggerConfig.CreateLogger();

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
        // Build connection string - only add password if not already in connection string
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        // Only append password from env var if connection string doesn't already have one
        if (!connectionString!.Contains("Password=", StringComparison.OrdinalIgnoreCase))
        {
            var dbPassword = Environment.GetEnvironmentVariable("DATABASE_PASSWORD") ?? "monetaris_pass";
            connectionString += $";Password={dbPassword}";
        }

        // Use PostgreSQL for production and development
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString)
                .UseSnakeCaseNamingConvention(); // Map C# PascalCase to PostgreSQL snake_case
            // Suppress pending model changes warning for development (EF Core 9)
            options.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

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
                .WithMethods("GET", "POST", "PUT", "DELETE")
                .WithHeaders("Content-Type", "Authorization", "X-Requested-With", "X-CSRF-TOKEN")
                .AllowCredentials();
        });
    });

    // Configure JWT Authentication
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? jwtSettings["SecretKey"]
        ?? (builder.Environment.IsDevelopment()
            ? "DEV_SECRET_KEY_FOR_DEVELOPMENT_ONLY_DO_NOT_USE_IN_PRODUCTION_32_CHARS"
            : throw new InvalidOperationException("JWT SecretKey must be provided via JWT_SECRET_KEY environment variable"));

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

    // Configure Antiforgery (CSRF Protection)
    builder.Services.AddAntiforgery(options =>
    {
        options.HeaderName = "X-CSRF-TOKEN";
        options.Cookie.Name = "CSRF-TOKEN";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
    });

    // Configure Rate Limiting
    // In development/testing, use higher limits to allow automated tests
    var isDevelopment = builder.Environment.IsDevelopment();
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        // Fixed window rate limiter for authentication endpoints
        options.AddFixedWindowLimiter("auth", limiterOptions =>
        {
            // Higher limit in development for automated testing
            limiterOptions.PermitLimit = isDevelopment ? 100 : 5;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0; // No queueing, reject immediately
        });
    });

    // Register HTTP Client for external API calls
    builder.Services.AddHttpClient();
    builder.Services.AddHttpContextAccessor();

    // Add Memory Cache for rate limiting
    builder.Services.AddMemoryCache();

    // Register authentication services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

    // Register domain services
    builder.Services.AddScoped<Monetaris.Kreditor.Services.IKreditorService, Monetaris.Kreditor.Services.KreditorService>();
    builder.Services.AddScoped<Monetaris.Debtor.Services.IDebtorService, Monetaris.Debtor.Services.DebtorService>();
    builder.Services.AddScoped<Monetaris.Document.Services.IDocumentService, Monetaris.Document.Services.DocumentService>();
    builder.Services.AddScoped<Monetaris.Inquiry.Services.IInquiryService, Monetaris.Inquiry.Services.InquiryService>();
    builder.Services.AddScoped<Monetaris.Template.Services.ITemplateService, Monetaris.Template.Services.TemplateService>();
    builder.Services.AddScoped<Monetaris.Dashboard.Services.IDashboardService, Monetaris.Dashboard.Services.DashboardService>();
    builder.Services.AddScoped<Monetaris.Case.Services.ICaseService, Monetaris.Case.Services.CaseService>();
    builder.Services.AddScoped<Monetaris.Case.Services.IWorkflowEngine, Monetaris.Case.Services.WorkflowEngine>();

    // Register FluentValidation validators
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Debtor.Validators.CreateDebtorRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Inquiry.Validators.CreateInquiryRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Template.Validators.CreateTemplateRequestValidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Monetaris.Case.Validators.CreateCaseRequestValidator>();

    // Configure HSTS
    builder.Services.AddHsts(options =>
    {
        options.Preload = true;
        options.IncludeSubDomains = true;
        options.MaxAge = TimeSpan.FromDays(365);
    });

    // Add controllers with camelCase JSON serialization
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        });

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
                    scope.ServiceProvider.GetRequiredService<ILogger<DatabaseSeeder>>(),
                    app.Environment,
                    builder.Configuration
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

    // Swagger (only if explicitly enabled in configuration)
    if (app.Environment.IsDevelopment()
        && builder.Configuration.GetValue<bool>("EnableSwagger", false))
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Monetaris API v1");
            options.RoutePrefix = "swagger";
        });
    }

    app.UseHttpsRedirection();

    // HSTS - Strict Transport Security
    if (!app.Environment.IsDevelopment())
    {
        app.UseHsts();
    }

    // Security Headers Middleware
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        await next();
    });

    // Rate Limiting (must be before authentication)
    app.UseRateLimiter();

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
