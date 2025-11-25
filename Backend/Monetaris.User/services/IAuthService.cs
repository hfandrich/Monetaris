using Monetaris.Shared.Models;
using Monetaris.User.Models;

namespace Monetaris.User.Services;

/// <summary>
/// Authentication service interface
/// Handles login, registration, and token management
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);

    /// <summary>
    /// Authenticate debtor with case number and zip code (magic link)
    /// </summary>
    Task<Result<AuthResponse>> LoginDebtorAsync(LoginDebtorRequest request);

    /// <summary>
    /// Register a new user
    /// </summary>
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Logout user by revoking refresh token
    /// </summary>
    Task<Result> LogoutAsync(string refreshToken);
}
