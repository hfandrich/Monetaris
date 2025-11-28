using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using Monetaris.User.Services;
using Monetaris.User.Models;

namespace Monetaris.User.Api;

/// <summary>
/// Password reset initiation endpoint
/// </summary>
[ApiController]
[Route("api/auth")]
public class ForgotPassword : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<ForgotPassword> _logger;

    public ForgotPassword(IAuthService authService, ILogger<ForgotPassword> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate password reset process
    /// Generates reset token and logs reset link (email sending not implemented yet)
    /// Always returns 200 OK for security (don't reveal if email exists)
    /// </summary>
    /// <param name="request">Email address for password reset</param>
    /// <returns>Success response (always returns 200 for security)</returns>
    /// <response code="200">Request processed - if email exists, reset link will be sent</response>
    /// <response code="400">Invalid request format</response>
    /// <response code="429">Too many requests</response>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(ForgotPasswordResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordRequest request)
    {
        _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

        var result = await _authService.ForgotPasswordAsync(request);

        if (!result.IsSuccess)
        {
            // This should never happen due to our security policy, but handle it gracefully
            _logger.LogWarning("Unexpected failure in ForgotPasswordAsync for email: {Email}", request.Email);
        }

        // ALWAYS return 200 OK with success message (security best practice)
        return Ok(result.Data ?? new ForgotPasswordResponse());
    }
}
