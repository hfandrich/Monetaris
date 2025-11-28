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
    /// <param name="assignedKreditorIds">Optional list of assigned kreditor IDs (for AGENT role)</param>
    string GenerateAccessToken(UserEntity user, List<Guid>? assignedKreditorIds = null);

    /// <summary>
    /// Generate secure refresh token
    /// </summary>
    string GenerateRefreshToken();
}
