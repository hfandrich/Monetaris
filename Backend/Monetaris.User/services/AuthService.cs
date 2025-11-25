using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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

    public AuthService(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
    }

    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users
            .Include(u => u.TenantAssignments)
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
        var assignedTenantIds = user.TenantAssignments
            .Select(ta => ta.TenantId)
            .ToList();

        var authResponse = await GenerateAuthResponseAsync(user, assignedTenantIds);
        return Result<AuthResponse>.Success(authResponse);
    }

    /// <summary>
    /// Authenticate debtor with case number and zip code (magic link)
    /// </summary>
    public async Task<Result<AuthResponse>> LoginDebtorAsync(LoginDebtorRequest request)
    {
        // Find case by invoice number
        var caseEntity = await _context.Cases
            .Include(c => c.Debtor)
            .FirstOrDefaultAsync(c => c.InvoiceNumber == request.InvoiceNumber);

        if (caseEntity == null)
        {
            return Result<AuthResponse>.Failure("Invalid case number or zip code");
        }

        // Verify zip code matches debtor's address
        if (caseEntity.Debtor.ZipCode != request.ZipCode)
        {
            return Result<AuthResponse>.Failure("Invalid case number or zip code");
        }

        // Find or create debtor user account
        var debtorEmail = $"debtor_{caseEntity.DebtorId}@monetaris.system";
        var debtorUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == debtorEmail);

        if (debtorUser == null)
        {
            // Get debtor's display name
            var debtorName = caseEntity.Debtor.IsCompany
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
                TenantId = caseEntity.TenantId,
                AvatarInitials = GetInitials(debtorName),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(debtorUser);
            await _context.SaveChangesAsync();
        }

        // Generate tokens
        var authResponse = await GenerateAuthResponseAsync(debtorUser, null);
        return Result<AuthResponse>.Success(authResponse);
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

        // Validate tenant ID for CLIENT role
        if (request.Role == UserRole.CLIENT && !request.TenantId.HasValue)
        {
            return Result<AuthResponse>.Failure("Tenant ID is required for CLIENT role");
        }

        // Validate tenant exists
        if (request.TenantId.HasValue)
        {
            var tenantExists = await _context.Tenants
                .AnyAsync(t => t.Id == request.TenantId.Value);

            if (!tenantExists)
            {
                return Result<AuthResponse>.Failure("Tenant not found");
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
            TenantId = request.TenantId,
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
                .ThenInclude(u => u.TenantAssignments)
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
        var assignedTenantIds = tokenEntity.User.TenantAssignments
            .Select(ta => ta.TenantId)
            .ToList();

        var authResponse = await GenerateAuthResponseAsync(tokenEntity.User, assignedTenantIds);
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
    private async Task<AuthResponse> GenerateAuthResponseAsync(UserEntity user, List<Guid>? assignedTenantIds)
    {
        // Generate JWT access token
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, assignedTenantIds);

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
            TenantId = user.TenantId,
            AssignedTenantIds = assignedTenantIds,
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
