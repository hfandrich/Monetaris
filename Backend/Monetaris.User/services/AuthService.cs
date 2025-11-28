using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.User.Models;
using UserEntity = Monetaris.Shared.Models.Entities.User;

namespace Monetaris.User.Services;

/// <summary>
/// Authentication service implementation
/// Handles user login, registration, and JWT token management
/// </summary>
public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration,
        IMemoryCache cache,
        ILogger<AuthService> logger)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users
            .Include(u => u.KreditorAssignments)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return Result<AuthResponse>.Failure("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Invalid email or password");
        }

        // Check if user is active
        if (!user.IsActive)
        {
            return Result<AuthResponse>.Failure("User account is inactive");
        }

        // Generate tokens
        var assignedKreditorIds = user.KreditorAssignments
            .Select(ka => ka.KreditorId)
            .ToList();

        var authResponse = await GenerateAuthResponseAsync(user, assignedKreditorIds);
        return Result<AuthResponse>.Success(authResponse);
    }

    /// <summary>
    /// Authenticate debtor with case number, zip code, and date of birth (multi-factor)
    /// Includes rate limiting and comprehensive audit logging
    /// </summary>
    public async Task<Result<AuthResponse>> LoginDebtorAsync(LoginDebtorRequest request)
    {
        // Check rate limiting BEFORE any database queries
        if (IsRateLimited(request.InvoiceNumber))
        {
            _logger.LogWarning(
                "Rate limit exceeded for debtor login attempt. Invoice: {InvoiceNumber}",
                request.InvoiceNumber);
            return Result<AuthResponse>.Failure("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.");
        }

        // Find case by invoice number
        var caseEntity = await _context.Cases
            .Include(c => c.Debtor)
            .FirstOrDefaultAsync(c => c.InvoiceNumber == request.InvoiceNumber);

        if (caseEntity == null)
        {
            _logger.LogWarning(
                "Debtor login failed: Case not found. Invoice: {InvoiceNumber}",
                request.InvoiceNumber);
            IncrementLoginAttempt(request.InvoiceNumber);
            return Result<AuthResponse>.Failure("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.");
        }

        // Verify zip code matches debtor's address
        if (caseEntity.Debtor.ZipCode != request.ZipCode)
        {
            _logger.LogWarning(
                "Debtor login failed: Zip code mismatch. Invoice: {InvoiceNumber}, CaseId: {CaseId}",
                request.InvoiceNumber,
                caseEntity.Id);
            IncrementLoginAttempt(request.InvoiceNumber);
            return Result<AuthResponse>.Failure("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.");
        }

        // Verify date of birth matches (additional security factor)
        if (caseEntity.Debtor.DateOfBirth == null ||
            caseEntity.Debtor.DateOfBirth.Value.Date != request.DateOfBirth.Date)
        {
            _logger.LogWarning(
                "Debtor login failed: Date of birth mismatch. Invoice: {InvoiceNumber}, CaseId: {CaseId}, DebtorId: {DebtorId}",
                request.InvoiceNumber,
                caseEntity.Id,
                caseEntity.DebtorId);
            IncrementLoginAttempt(request.InvoiceNumber);
            return Result<AuthResponse>.Failure("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.");
        }

        // All verification passed - find or create debtor user account
        var debtorEmail = $"debtor_{caseEntity.DebtorId}@monetaris.system";
        var debtorUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == debtorEmail);

        if (debtorUser == null)
        {
            // Get debtor's display name
            var debtorName = caseEntity.Debtor.EntityType != EntityType.NATURAL_PERSON
                ? caseEntity.Debtor.CompanyName ?? "Unknown Company"
                : $"{caseEntity.Debtor.FirstName} {caseEntity.Debtor.LastName}".Trim();

            // Create a DEBTOR user account on the fly
            debtorUser = new UserEntity
            {
                Id = Guid.NewGuid(),
                Name = debtorName,
                Email = debtorEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password
                Role = UserRole.DEBTOR,
                KreditorId = caseEntity.KreditorId,
                AvatarInitials = GetInitials(debtorName),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(debtorUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Created new debtor user account. DebtorId: {DebtorId}, UserId: {UserId}",
                caseEntity.DebtorId,
                debtorUser.Id);
        }

        // Log successful login for fraud detection
        _logger.LogInformation(
            "Debtor login successful. CaseId: {CaseId}, DebtorId: {DebtorId}, UserId: {UserId}. Consider sending email notification.",
            caseEntity.Id,
            caseEntity.DebtorId,
            debtorUser.Id);

        // Generate tokens
        var authResponse = await GenerateAuthResponseAsync(debtorUser, null);
        return Result<AuthResponse>.Success(authResponse);
    }

    /// <summary>
    /// Check if an invoice number has exceeded rate limit (5 attempts per hour)
    /// </summary>
    private bool IsRateLimited(string invoiceNumber)
    {
        var key = $"debtor_login_attempts_{invoiceNumber}";
        var attempts = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return 0;
        });

        return attempts >= 5;
    }

    /// <summary>
    /// Increment login attempt counter for rate limiting
    /// </summary>
    private void IncrementLoginAttempt(string invoiceNumber)
    {
        var key = $"debtor_login_attempts_{invoiceNumber}";
        var currentAttempts = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return 0;
        });

        _cache.Set(key, currentAttempts + 1, TimeSpan.FromHours(1));
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            return Result<AuthResponse>.Failure("Email address is already registered");
        }

        // Validate kreditor ID for CLIENT role
        if (request.Role == UserRole.CLIENT && !request.KreditorId.HasValue)
        {
            return Result<AuthResponse>.Failure("Kreditor ID is required for CLIENT role");
        }

        // Validate kreditor exists
        if (request.KreditorId.HasValue)
        {
            var kreditorExists = await _context.Kreditoren
                .AnyAsync(k => k.Id == request.KreditorId.Value);

            if (!kreditorExists)
            {
                return Result<AuthResponse>.Failure("Kreditor not found");
            }
        }

        // Create new user
        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            KreditorId = request.KreditorId,
            AvatarInitials = GetInitials(request.Name),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate tokens
        var authResponse = await GenerateAuthResponseAsync(user, null);
        return Result<AuthResponse>.Success(authResponse);
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    public async Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken)
    {
        // Find refresh token in database
        var tokenEntity = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.KreditorAssignments)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity == null)
        {
            return Result<AuthResponse>.Failure("Invalid refresh token");
        }

        // Check if token is revoked
        if (tokenEntity.RevokedAt.HasValue)
        {
            return Result<AuthResponse>.Failure("Refresh token has been revoked");
        }

        // Check if token is expired
        if (tokenEntity.ExpiresAt < DateTime.UtcNow)
        {
            return Result<AuthResponse>.Failure("Refresh token has expired");
        }

        // Check if user is active
        if (!tokenEntity.User.IsActive)
        {
            return Result<AuthResponse>.Failure("User account is inactive");
        }

        // Revoke old refresh token
        tokenEntity.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var assignedKreditorIds = tokenEntity.User.KreditorAssignments
            .Select(ka => ka.KreditorId)
            .ToList();

        var authResponse = await GenerateAuthResponseAsync(tokenEntity.User, assignedKreditorIds);
        await _context.SaveChangesAsync();

        return Result<AuthResponse>.Success(authResponse);
    }

    /// <summary>
    /// Logout user by revoking refresh token
    /// </summary>
    public async Task<Result> LogoutAsync(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity == null)
        {
            return Result.Failure("Refresh token not found");
        }

        // Revoke the token
        tokenEntity.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    /// <summary>
    /// Generate authentication response with new tokens
    /// </summary>
    private async Task<AuthResponse> GenerateAuthResponseAsync(UserEntity user, List<Guid>? assignedKreditorIds)
    {
        // Generate JWT access token
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, assignedKreditorIds);

        // Generate refresh token
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        // Get token expiration from configuration
        var jwtSettings = _configuration.GetSection("Jwt");
        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "480");

        // Store refresh token in database
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(30), // Refresh token valid for 30 days
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        // Create user DTO
        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            KreditorId = user.KreditorId,
            AssignedKreditorIds = assignedKreditorIds,
            AvatarInitials = user.AvatarInitials
        };

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = expirationMinutes * 60, // Convert to seconds
            User = userDto
        };
    }

    /// <summary>
    /// Initiate password reset process
    /// Generates reset token and logs reset link (email sending not implemented yet)
    /// Always returns success for security (don't reveal if email exists)
    /// </summary>
    public async Task<Result<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        try
        {
            // Find user by email (but don't reveal if not found)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user != null && user.IsActive)
            {
                // Generate reset token
                var resetToken = Guid.NewGuid().ToString();
                var expiresAt = DateTime.UtcNow.AddHours(24);

                // Store token in cache (expires after 24 hours)
                var cacheKey = $"password_reset_{resetToken}";
                _cache.Set(cacheKey, new
                {
                    UserId = user.Id,
                    Email = user.Email,
                    ExpiresAt = expiresAt
                }, TimeSpan.FromHours(24));

                // Log reset link (for development - in production this would send email)
                var resetLink = $"https://monetaris.app/#/reset-password?token={resetToken}";
                _logger.LogInformation(
                    "Password reset requested for user {Email}. Reset link: {ResetLink} (expires at {ExpiresAt})",
                    user.Email,
                    resetLink,
                    expiresAt);

                _logger.LogInformation(
                    "Password reset token generated for user {UserId}. Token expires at {ExpiresAt}",
                    user.Id,
                    expiresAt);
            }
            else
            {
                // User not found or inactive - log but still return success
                _logger.LogWarning(
                    "Password reset requested for non-existent or inactive email: {Email}",
                    request.Email);
            }

            // ALWAYS return success for security (don't reveal if email exists)
            return Result<ForgotPasswordResponse>.Success(new ForgotPasswordResponse
            {
                Message = "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
                Success = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset request for email: {Email}", request.Email);

            // Even on error, return success for security
            return Result<ForgotPasswordResponse>.Success(new ForgotPasswordResponse
            {
                Message = "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
                Success = true
            });
        }
    }

    /// <summary>
    /// Generate initials from full name
    /// </summary>
    private string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "??";

        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1)
            return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();

        return (parts[0][0].ToString() + parts[^1][0].ToString()).ToUpper();
    }
}
