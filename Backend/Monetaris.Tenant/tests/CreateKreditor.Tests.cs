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
/// Unit tests for CreateKreditor endpoint
/// </summary>
public class CreateKreditorTests
{
    private readonly Mock<IKreditorService> _mockService;
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<CreateKreditor>> _mockLogger;
    private readonly CreateKreditor _endpoint;

    public CreateKreditorTests()
    {
        _mockService = new Mock<IKreditorService>();
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<CreateKreditor>>();

        _endpoint = new CreateKreditor(_mockService.Object, _mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsCreatedResult_WhenSuccessful()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var kreditorId = Guid.NewGuid();
        var kreditorDto = new KreditorDto
        {
            Id = kreditorId,
            Name = request.Name,
            RegistrationNumber = request.RegistrationNumber,
            ContactEmail = request.ContactEmail,
            BankAccountIBAN = request.BankAccountIBAN,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = Result<KreditorDto>.Success(kreditorDto);

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.CreateAsync(request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(request);

        // Assert
        actionResult.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = actionResult as CreatedAtActionResult;
        createdResult!.Value.Should().BeEquivalentTo(kreditorDto);
        createdResult.ActionName.Should().Be("Handle");
        createdResult.ControllerName.Should().Be("GetKreditorById");

        _mockService.Verify(s => s.CreateAsync(request, It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenServiceFails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var result = Result<KreditorDto>.Failure("A Kreditor with this registration number already exists");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.CreateAsync(request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(request);

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
        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        SetupHttpContext(userId);
        SetupUserDbSet(null);

        // Act
        var actionResult = await _endpoint.Handle(request);

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.CreateAsync(It.IsAny<CreateKreditorRequest>(), It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenNonAdminUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "REG123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013000"
        };

        var result = Result<KreditorDto>.Failure("Only administrators can create Kreditoren");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.CreateAsync(request, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(request);

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
