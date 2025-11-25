namespace Monetaris.Shared.Exceptions;

/// <summary>
/// Exception thrown when access is forbidden
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException() : base("Access forbidden.")
    {
    }

    public ForbiddenException(string message) : base(message)
    {
    }

    public ForbiddenException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
