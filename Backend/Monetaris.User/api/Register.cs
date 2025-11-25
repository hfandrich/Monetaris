using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// User registration endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class Register : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<Register> _logger;

    public Register(IAuthService authService, ILogger<Register> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">Registration details (name, email, password, role, tenantId)</param>
    /// <returns>Authentication response with JWT tokens and user information</returns>
    /// <response code="200">Registration successful - returns access token, refresh token, and user details</response>
    /// <response code="400">Email already exists, invalid tenant, or validation error</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Registration failed for email: {Email}. Error: {Error}",
                request.Email,
                result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Registration successful for email: {Email}", request.Email);
        return Ok(result.Data);
    }
}
