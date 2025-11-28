using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using UserEntity = Monetaris.Shared.Models.Entities.User;

namespace Monetaris.User.Services;

/// <summary>
/// JWT token generator implementation
/// </summary>
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generate JWT access token with user claims
    /// </summary>
    public string GenerateAccessToken(UserEntity user, List<Guid>? assignedKreditorIds = null)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey is not configured");
        var issuer = jwtSettings["Issuer"] ?? "MonetarisApi";
        var audience = jwtSettings["Audience"] ?? "MonetarisClient";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "480");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("role", user.Role.ToString())
        };

        // Add KreditorId claim if present (for CLIENT users)
        if (user.KreditorId.HasValue)
        {
            claims.Add(new Claim("kreditorId", user.KreditorId.Value.ToString()));
        }

        // Add AssignedKreditorIds claim if present (for AGENT users)
        if (assignedKreditorIds != null && assignedKreditorIds.Any())
        {
            claims.Add(new Claim("assignedKreditorIds", string.Join(",", assignedKreditorIds)));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generate secure refresh token (GUID-based)
    /// </summary>
    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N");
    }
}
