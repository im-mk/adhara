using App.Api.Controllers;
using App.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace App.Api.Tests.Controllers;

public class BffProxyControllerTests
{
    private readonly Mock<IDownstreamProxyService> _mockProxyService;
    private readonly BffProxyController _controller;

    public BffProxyControllerTests()
    {
        _mockProxyService = new Mock<IDownstreamProxyService>();
        _controller = new BffProxyController(_mockProxyService.Object);
    }

    [Fact]
    public async Task Login_Request_ForwardsToUserService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Login();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task Refresh_Request_ForwardsToUserService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Refresh();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task Countries_Request_ForwardsToOrderService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Countries();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task OrderStatuses_Request_ForwardsToOrderService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.OrderStatuses();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task Customers_Request_ForwardsToUserService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Customers();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToUserServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task Orders_Request_ForwardsToOrderService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Orders();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }

    [Fact]
    public async Task Products_Request_ForwardsToOrderService()
    {
        // Arrange
        var expectedResult = new OkResult();
        _mockProxyService
            .Setup(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Products();

        // Assert
        Assert.Equal(expectedResult, result);
        _mockProxyService.Verify(s => s.ForwardToOrderServiceAsync(It.IsAny<HttpContext>()), Times.Once);
    }
}
