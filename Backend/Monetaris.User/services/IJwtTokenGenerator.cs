using UserEntity = Monetaris.Shared.Models.Entities.User;

namespace Monetaris.User.Services;

/// <summary>
/// JWT token generator interface
/// </summary>
public interface IJwtTokenGenerator
{
    /// <summary>
    /// Generate JWT access token for user
    /// </summary>
    /// <param name="user">User entity</param>
    /// <param name="assignedTenantIds">Optional list of assigned tenant IDs (for AGENT role)</param>
    string GenerateAccessToken(UserEntity user, List<Guid>? assignedTenantIds = null);

    /// <summary>
    /// Generate secure refresh token
    /// </summary>
    string GenerateRefreshToken();
}
