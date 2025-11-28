using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.User.Api;
using Moq;
using Xunit;

namespace Monetaris.User.Tests;

public class GetCsrfTokenTests
{
    private readonly Mock<IAntiforgery> _antiforgeryMock;
    private readonly Mock<ILogger<GetCsrfToken>> _loggerMock;
    private readonly GetCsrfToken _controller;

    public GetCsrfTokenTests()
    {
        _antiforgeryMock = new Mock<IAntiforgery>();
        _loggerMock = new Mock<ILogger<GetCsrfToken>>();
        _controller = new GetCsrfToken(_antiforgeryMock.Object, _loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }

    [Fact]
    public void GetToken_ReturnsOkWithToken_WhenSuccessful()
    {
        // Arrange
        var expectedToken = "test-csrf-token-12345";
        var tokenSet = new AntiforgeryTokenSet(expectedToken, null, "form-field", "header");

        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Returns(tokenSet);

        // Act
        var result = _controller.GetToken();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeOfType<CsrfTokenResponse>();
        var response = okResult.Value as CsrfTokenResponse;
        response!.Token.Should().Be(expectedToken);
    }

    [Fact]
    public void GetToken_CallsGetAndStoreTokens()
    {
        // Arrange
        var tokenSet = new AntiforgeryTokenSet("token", null, "form-field", "header");
        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Returns(tokenSet);

        // Act
        _controller.GetToken();

        // Assert
        _antiforgeryMock.Verify(
            x => x.GetAndStoreTokens(It.IsAny<HttpContext>()),
            Times.Once);
    }

    [Fact]
    public void GetToken_LogsInformation_WhenSuccessful()
    {
        // Arrange
        var tokenSet = new AntiforgeryTokenSet("token", null, "form-field", "header");
        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Returns(tokenSet);

        // Act
        _controller.GetToken();

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("CSRF token generated")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void GetToken_Returns500_WhenExceptionOccurs()
    {
        // Arrange
        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Throws(new InvalidOperationException("Test exception"));

        // Act
        var result = _controller.GetToken();

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
    }

    [Fact]
    public void GetToken_LogsError_WhenExceptionOccurs()
    {
        // Arrange
        var exception = new InvalidOperationException("Test exception");
        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Throws(exception);

        // Act
        _controller.GetToken();

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error generating CSRF token")),
                It.Is<Exception>(ex => ex == exception),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void GetToken_ReturnsEmptyString_WhenRequestTokenIsNull()
    {
        // Arrange
        var tokenSet = new AntiforgeryTokenSet(null, null, "form-field", "header");
        _antiforgeryMock
            .Setup(x => x.GetAndStoreTokens(It.IsAny<HttpContext>()))
            .Returns(tokenSet);

        // Act
        var result = _controller.GetToken();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var response = okResult!.Value as CsrfTokenResponse;
        response!.Token.Should().Be(string.Empty);
    }
}
