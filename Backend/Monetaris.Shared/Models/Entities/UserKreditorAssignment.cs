namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Many-to-many relationship: Agents can handle multiple kreditoren
/// </summary>
public class UserKreditorAssignment
{
    /// <summary>
    /// User (Agent) ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Kreditor ID
    /// </summary>
    public Guid KreditorId { get; set; }

    /// <summary>
    /// When the assignment was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    /// <summary>
    /// The user (agent)
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// The kreditor
    /// </summary>
    public Kreditor Kreditor { get; set; } = null!;
}
