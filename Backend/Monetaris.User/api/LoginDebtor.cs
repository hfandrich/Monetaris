using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    /// Authenticate debtor with case number and zip code (magic link)
    /// </summary>
    /// <param name="request">Debtor login credentials (invoice number and zip code)</param>
    /// <returns>Authentication response with JWT tokens and user information</returns>
    /// <response code="200">Login successful - returns access token, refresh token, and user details</response>
    /// <response code="400">Invalid case number, zip code mismatch, or case not found</response>
    [HttpPost("login-debtor")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LoginDebtorAsync([FromBody] LoginDebtorRequest request)
    {
        _logger.LogInformation("Debtor login attempt for invoice: {InvoiceNumber}", request.InvoiceNumber);

        var result = await _authService.LoginDebtorAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Debtor login failed for invoice: {InvoiceNumber}. Error: {Error}",
                request.InvoiceNumber,
                result.ErrorMessage);
            return BadRequest(new { error = result.ErrorMessage });
        }

        _logger.LogInformation("Debtor login successful for invoice: {InvoiceNumber}", request.InvoiceNumber);
        return Ok(result.Data);
    }
}
