using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Debtor login endpoint using magic link (case number + zip code)
/// </summary>
[ApiController]
[Route("api/auth")]
public class LoginDebtor : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<LoginDebtor> _logger;

    public LoginDebtor(IAuthService authService, ILogger<LoginDebtor> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate debtor with case number, zip code, and date of birth (multi-factor authentication)
    /// Includes rate limiting (5 attempts per hour) and comprehensive audit logging
    /// </summary>
    /// <param name="request">Debtor login credentials (invoice number, zip code, and date of birth)</param>
    /// <returns>Authentication response with JWT tokens and user information</returns>
    /// <response code="200">Login successful - returns access token, refresh token, and user details</response>
    /// <response code="400">Invalid credentials, rate limit exceeded, or missing date of birth</response>
    [HttpPost("login-debtor")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> LoginDebtorAsync([FromBody] LoginDebtorRequest request)
    {
        // Log minimal information to avoid leaking sensitive data
        _logger.LogInformation(
            "Debtor login attempt. Invoice: {InvoiceNumber}",
            request.InvoiceNumber);

        var result = await _authService.LoginDebtorAsync(request);

        if (!result.IsSuccess)
        {
            // Use generic error message - don't reveal which field was wrong
            // Detailed error already logged in AuthService with sensitive data
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation(
            "Debtor login successful. Invoice: {InvoiceNumber}",
            request.InvoiceNumber);

        return Ok(result.Data);
    }
}
