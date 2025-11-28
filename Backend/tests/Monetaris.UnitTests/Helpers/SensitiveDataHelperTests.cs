using Xunit;
using Monetaris.Shared.Helpers;
using Monetaris.Shared.Enums;

namespace Monetaris.UnitTests.Helpers;

/// <summary>
/// Unit tests for SensitiveDataHelper
/// </summary>
public class SensitiveDataHelperTests
{
    [Fact]
    public void MaskIBAN_WithValidIBAN_ReturnsMaskedIBAN()
    {
        // Arrange
        var iban = "DE89370400440532013000";

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal("DE** **** **** **13000", result);
    }

    [Fact]
    public void MaskIBAN_WithIBANWithSpaces_ReturnsMaskedIBAN()
    {
        // Arrange
        var iban = "DE89 3704 0044 0532 0130 00";

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal("DE** **** **** **13000", result);
    }

    [Fact]
    public void MaskIBAN_WithShortIBAN_ReturnsMasked()
    {
        // Arrange
        var iban = "DE123";

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal("****", result);
    }

    [Fact]
    public void MaskIBAN_WithNullIBAN_ReturnsEmptyString()
    {
        // Arrange
        string? iban = null;

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void MaskIBAN_WithEmptyIBAN_ReturnsEmptyString()
    {
        // Arrange
        var iban = "";

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void MaskIBAN_WithWhitespaceIBAN_ReturnsEmptyString()
    {
        // Arrange
        var iban = "   ";

        // Act
        var result = SensitiveDataHelper.MaskIBAN(iban);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void MaskEmail_WithValidEmail_ReturnsMaskedEmail()
    {
        // Arrange
        var email = "john.doe@example.com";

        // Act
        var result = SensitiveDataHelper.MaskEmail(email);

        // Assert
        Assert.Equal("jo***@example.com", result);
    }

    [Fact]
    public void MaskEmail_WithShortEmail_ReturnsMaskedEmail()
    {
        // Arrange
        var email = "a@example.com";

        // Act
        var result = SensitiveDataHelper.MaskEmail(email);

        // Assert
        Assert.Equal("***@example.com", result);
    }

    [Fact]
    public void MaskEmail_WithNullEmail_ReturnsEmptyString()
    {
        // Arrange
        string? email = null;

        // Act
        var result = SensitiveDataHelper.MaskEmail(email);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void MaskEmail_WithInvalidEmail_ReturnsMasked()
    {
        // Arrange
        var email = "not-an-email";

        // Act
        var result = SensitiveDataHelper.MaskEmail(email);

        // Assert
        Assert.Equal("****@****", result);
    }

    [Theory]
    [InlineData(UserRole.ADMIN, true)]
    [InlineData(UserRole.AGENT, false)]
    [InlineData(UserRole.CLIENT, false)]
    [InlineData(UserRole.DEBTOR, false)]
    public void CanViewFullIBAN_WithDifferentRoles_ReturnsExpected(UserRole role, bool expected)
    {
        // Act
        var result = SensitiveDataHelper.CanViewFullIBAN(role);

        // Assert
        Assert.Equal(expected, result);
    }
}
