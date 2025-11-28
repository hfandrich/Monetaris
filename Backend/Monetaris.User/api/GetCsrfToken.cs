using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Monetaris.User.Api;

/// <summary>
/// Endpoint for retrieving CSRF token for state-changing requests
/// </summary>
[ApiController]
[Route("api/auth")]
public class GetCsrfToken : ControllerBase
{
    private readonly IAntiforgery _antiforgery;
    private readonly ILogger<GetCsrfToken> _logger;

    public GetCsrfToken(
        IAntiforgery antiforgery,
        ILogger<GetCsrfToken> logger)
    {
        _antiforgery = antiforgery;
        _logger = logger;
    }

    /// <summary>
    /// Get CSRF token for authenticated requests
    /// </summary>
    /// <returns>CSRF token response</returns>
    /// <response code="200">Returns the CSRF token</response>
    [HttpGet("csrf-token")]
    [ProducesResponseType(typeof(CsrfTokenResponse), StatusCodes.Status200OK)]
    public IActionResult GetToken()
    {
        try
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

            _logger.LogInformation("CSRF token generated for request from {IpAddress}",
                HttpContext.Connection.RemoteIpAddress);

            return Ok(new CsrfTokenResponse
            {
                Token = tokens.RequestToken ?? string.Empty
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating CSRF token");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { error = "Failed to generate CSRF token" });
        }
    }
}

/// <summary>
/// CSRF token response model
/// </summary>
public class CsrfTokenResponse
{
    /// <summary>
    /// The CSRF token to include in subsequent requests
    /// </summary>
    public string Token { get; set; } = string.Empty;
}
