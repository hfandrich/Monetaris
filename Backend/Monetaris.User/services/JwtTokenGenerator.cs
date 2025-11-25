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
    public string GenerateAccessToken(UserEntity user, List<Guid>? assignedTenantIds = null)
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

        // Add TenantId claim if present (for CLIENT users)
        if (user.TenantId.HasValue)
        {
            claims.Add(new Claim("tenantId", user.TenantId.Value.ToString()));
        }

        // Add AssignedTenantIds claim if present (for AGENT users)
        if (assignedTenantIds != null && assignedTenantIds.Any())
        {
            claims.Add(new Claim("assignedTenantIds", string.Join(",", assignedTenantIds)));
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
