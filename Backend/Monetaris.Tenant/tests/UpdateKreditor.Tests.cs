using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Api;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Enums;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Monetaris.Kreditor.Tests;

/// <summary>
/// Unit tests for UpdateKreditor endpoint
/// </summary>
public class UpdateKreditorTests
{
    private readonly Mock<IKreditorService> _mockService;
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<UpdateKreditor>> _mockLogger;
    private readonly UpdateKreditor _endpoint;

    public UpdateKreditorTests()
    {
        _mockService = new Mock<IKreditorService>();
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<UpdateKreditor>>();

        _endpoint = new UpdateKreditor(_mockService.Object, _mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsOkResult_WhenSuccessful()
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

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var kreditorDto = new KreditorDto
        {
            Id = kreditorId,
            Name = request.Name,
            RegistrationNumber = request.RegistrationNumber,
            ContactEmail = request.ContactEmail,
            BankAccountIBAN = request.BankAccountIBAN,
            UpdatedAt = DateTime.UtcNow
        };

        var result = Result<KreditorDto>.Success(kreditorDto);

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.UpdateAsync(kreditorId, request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId, request);

        // Assert
        actionResult.Should().BeOfType<OkObjectResult>();
        var okResult = actionResult as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(kreditorDto);

        _mockService.Verify(s => s.UpdateAsync(kreditorId, request, It.IsAny<User>()), Times.Once);
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

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var result = Result<KreditorDto>.Failure("Tenant not found");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.UpdateAsync(kreditorId, request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId, request);

        // Assert
        actionResult.Should().BeOfType<NotFoundObjectResult>();
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

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var result = Result<KreditorDto>.Failure("A Kreditor with this registration number already exists");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.UpdateAsync(kreditorId, request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId, request);

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Handle_ReturnsUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        SetupHttpContext(userId);
        SetupUserDbSet(null);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId, request);

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateKreditorRequest>(), It.IsAny<User>()), Times.Never);
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

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var result = Result<KreditorDto>.Failure("Only administrators can update Kreditoren");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.UpdateAsync(kreditorId, request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId, request);

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
