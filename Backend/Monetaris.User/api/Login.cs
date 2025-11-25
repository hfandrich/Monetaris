using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Login endpoint for email/password authentication
/// </summary>
[ApiController]
[Route("api/auth")]
public class Login : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<Login> _logger;

    public Login(IAuthService authService, ILogger<Login> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    /// <param name="request">Login credentials (email and password)</param>
    /// <returns>Authentication response with JWT tokens and user information</returns>
    /// <response code="200">Login successful - returns access token, refresh token, and user details</response>
    /// <response code="400">Invalid credentials or inactive account</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var result = await _authService.LoginAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Login failed for email: {Email}. Error: {Error}",
                request.Email,
                result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Login successful for email: {Email}", request.Email);
        return Ok(result.Data);
    }
}
