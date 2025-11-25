using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Api;
using Monetaris.Kreditor.Services;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Enums;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Monetaris.Kreditor.Tests;

/// <summary>
/// Unit tests for DeleteKreditor endpoint
/// </summary>
public class DeleteKreditorTests
{
    private readonly Mock<IKreditorService> _mockService;
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<DeleteKreditor>> _mockLogger;
    private readonly DeleteKreditor _endpoint;

    public DeleteKreditorTests()
    {
        _mockService = new Mock<IKreditorService>();
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<DeleteKreditor>>();

        _endpoint = new DeleteKreditor(_mockService.Object, _mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result.Success();

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.DeleteAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<NoContentResult>();

        _mockService.Verify(s => s.DeleteAsync(kreditorId, It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsNotFound_WhenKreditorNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result.Failure("Tenant not found");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.DeleteAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenKreditorHasDependencies()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result.Failure("Cannot delete Kreditor with existing debtors or cases");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.DeleteAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = actionResult as BadRequestObjectResult;
        badRequestResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ReturnsUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();

        SetupHttpContext(userId);
        SetupUserDbSet(null);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.DeleteAsync(It.IsAny<Guid>(), It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenNonAdminUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var result = Result.Failure("Only administrators can delete Kreditoren");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.DeleteAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenServiceFails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result.Failure("Database error");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.DeleteAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
    }

    private void SetupHttpContext(Guid userId)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _endpoint.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    private void SetupUserDbSet(User? user)
    {
        _mockContext.Setup(c => c.Users.FindAsync(It.IsAny<Guid>()))
            .ReturnsAsync(user);
    }
}
