using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Monetaris.User.DTOs;
using Monetaris.User.Services;
using MonetarisApi.Data;

namespace MonetarisApi.Controllers;

/// <summary>
/// Authentication controller
/// Handles login, registration, token refresh, and logout
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ApplicationDbContext context,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication response with JWT tokens</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var result = await _authService.LoginAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Login failed for email: {Email}. Error: {Error}",
                request.Email, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Login successful for email: {Email}", request.Email);
        return Ok(result.Data);
    }

    /// <summary>
    /// Debtor login with case number and zip code (magic link)
    /// </summary>
    /// <param name="request">Debtor login credentials</param>
    /// <returns>Authentication response with JWT tokens</returns>
    [HttpPost("login-debtor")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> LoginDebtor([FromBody] LoginDebtorRequest request)
    {
        _logger.LogInformation("Debtor login attempt for invoice: {InvoiceNumber}", request.InvoiceNumber);

        var result = await _authService.LoginDebtorAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Debtor login failed for invoice: {InvoiceNumber}. Error: {Error}",
                request.InvoiceNumber, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Debtor login successful for invoice: {InvoiceNumber}", request.InvoiceNumber);
        return Ok(result.Data);
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Authentication response with JWT tokens</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Registration failed for email: {Email}. Error: {Error}",
                request.Email, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Registration successful for email: {Email}", request.Email);
        return Ok(result.Data);
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>New authentication response with updated tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        _logger.LogInformation("Token refresh attempt");

        var result = await _authService.RefreshTokenAsync(request.RefreshToken);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Token refresh failed. Error: {Error}", result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Token refresh successful");
        return Ok(result.Data);
    }

    /// <summary>
    /// Logout by revoking refresh token
    /// </summary>
    /// <param name="request">Refresh token to revoke</param>
    /// <returns>No content on success</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("Logout attempt for user: {UserId}", userId);

        var result = await _authService.LogoutAsync(request.RefreshToken);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Logout failed for user: {UserId}. Error: {Error}",
                userId, result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Logout successful for user: {UserId}", userId);
        return NoContent();
    }

    /// <summary>
    /// Get current authenticated user details
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid token" });
        }

        var user = await _context.Users
            .Include(u => u.TenantAssignments)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { error = "User not found" });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            TenantId = user.TenantId,
            AssignedTenantIds = user.TenantAssignments.Select(ta => ta.TenantId).ToList(),
            AvatarInitials = user.AvatarInitials
        };

        return Ok(userDto);
    }
}
