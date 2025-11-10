using Moq;
using Adhara.Api.Controllers;
using Adhara.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Entities;

namespace Adhara.Api.Tests.Controllers;

public class OrdersControllerTests
{
    private readonly Mock<Adhara.Api.Services.IOrderService> _mockOrderService;
    private readonly OrdersController _controller;

    public OrdersControllerTests()
    {
        _mockOrderService = new Mock<Adhara.Api.Services.IOrderService>();

        _controller = new OrdersController(_mockOrderService.Object);
    }

    [Fact]
    public async Task Get_ReturnsOkResult_WhenOrderExists()
    {
        // Arrange
        var orderId = 1;
        var expectedOrder = new Order();
        _mockOrderService
            .Setup(s => s.GetOrderAsync(orderId))
            .ReturnsAsync(expectedOrder);

        // Act
        var result = await _controller.Get(orderId);

        // Assert
        var actionResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expectedOrder, actionResult.Value);
    }

    [Fact]
    public async Task Get_ReturnsNotFoundResult_WhenOrderDoesNotExist()
    {
        // Arrange
        var orderId = 1;
        _mockOrderService
            .Setup(s => s.GetOrderAsync(orderId))
            .ReturnsAsync(default(Order?));

        // Act
        var result = await _controller.Get(orderId);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreatedAt_WhenInsertSucceeds()
    {
        // Arrange
        var request = new Models.CreateOrderRequest
        {
            OrderNumber = "ORD-1",
            OrderDate = DateTime.UtcNow,
            OrderStatusId = 1,
            TotalAmount = 100m,
            CustomerId = 10,
            OrderLines = new List<Adhara.Api.Models.OrderItem>
            {
                new Adhara.Api.Models.OrderItem { ProductId = 5, Quantity = 2, UnitPrice = 12.50m }
            }
        };

        var expectedOrder = new Order { Id = 42, OrderNumber = request.OrderNumber };
        _mockOrderService.Setup(s => s.CreateOrderAsync(request)).ReturnsAsync(expectedOrder);
        _mockOrderService.Setup(s => s.UpdateOrderAsync(It.IsAny<int>(), It.IsAny<Adhara.Api.Models.UpdateOrderRequest>())).ReturnsAsync(true);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returned = Assert.IsType<Order>(created.Value);
        Assert.Equal(expectedOrder.Id, returned.Id);
        Assert.Equal(request.OrderNumber, returned.OrderNumber);
    }

    [Fact]
    public async Task Update_ReturnsNoContent_WhenUpdateSucceeds()
    {
        // Arrange
        var orderId = 5;
        var request = new Models.UpdateOrderRequest
        {
            OrderStatusId = 2,
            TotalAmount = 50m,
        };

        _mockOrderService.Setup(s => s.UpdateOrderAsync(orderId, request)).ReturnsAsync(true);

        // Act
        var result = await _controller.Update(orderId, request);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenDeleteSucceeds()
    {
        // Arrange
        var orderId = 7;
        _mockOrderService.Setup(s => s.DeleteOrderAsync(orderId)).ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(orderId);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}