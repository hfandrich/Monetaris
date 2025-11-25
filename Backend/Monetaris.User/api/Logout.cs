using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Logout endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class Logout : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<Logout> _logger;

    public Logout(IAuthService authService, ILogger<Logout> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Logout user by revoking refresh token
    /// </summary>
    /// <param name="request">Refresh token to revoke</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Logout successful - refresh token has been revoked</response>
    /// <response code="400">Invalid refresh token or token not found</response>
    /// <response code="401">User not authenticated</response>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogoutAsync([FromBody] RefreshTokenRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("Logout attempt for user: {UserId}", userId);

        var result = await _authService.LogoutAsync(request.RefreshToken);

        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Logout failed for user: {UserId}. Error: {Error}",
                userId,
                result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Logout successful for user: {UserId}", userId);
        return NoContent();
    }
}
