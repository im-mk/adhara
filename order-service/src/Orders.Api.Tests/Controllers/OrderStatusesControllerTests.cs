using Orders.Api.Controllers;
using Orders.Api.Entities;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Orders.Api.Tests.Controllers;

public class OrderStatusesControllerTests
{
    private readonly Mock<IOrderStatusesService> _mockService;
    private readonly OrderStatusesController _controller;

    public OrderStatusesControllerTests()
    {
        _mockService = new Mock<IOrderStatusesService>();
        _controller = new OrderStatusesController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_StatusesExist_ReturnsOkResult()
    {
        // Arrange
        var statuses = new List<OrderStatus>
        {
            new OrderStatus { Id = 1, StatusName = "Pending" },
            new OrderStatus { Id = 2, StatusName = "Completed" }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(statuses);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(statuses, ok.Value);
        _mockService.Verify(s => s.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAll_NoStatusesExist_ReturnsOkWithEmptyCollection()
    {
        // Arrange
        var emptyStatuses = new List<OrderStatus>();
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(emptyStatuses);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Empty((IEnumerable<OrderStatus>)ok.Value!);
        _mockService.Verify(s => s.GetAllAsync(), Times.Once);
    }
}
