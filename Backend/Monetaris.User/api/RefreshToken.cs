using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Token refresh endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class RefreshToken : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<RefreshToken> _logger;

    public RefreshToken(IAuthService authService, ILogger<RefreshToken> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <returns>New authentication response with updated JWT tokens</returns>
    /// <response code="200">Token refresh successful - returns new access token and refresh token</response>
    /// <response code="400">Invalid refresh token, expired token, revoked token, or inactive user</response>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequest request)
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
}
