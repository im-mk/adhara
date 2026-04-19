using Orders.Api.Controllers;
using Orders.Api.Entities;
using Orders.Api.Models;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace Orders.Api.Tests.Controllers;

public class OrdersControllerTests
{
    private readonly Mock<IOrderService> _mockOrderService;
    private readonly Mock<ILogger<OrdersController>> _mockLogger;
    private readonly OrdersController _controller;

    public OrdersControllerTests()
    {
        _mockOrderService = new Mock<IOrderService>();
        _mockLogger = new Mock<ILogger<OrdersController>>();

        _controller = new OrdersController(_mockOrderService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Get_OrderExists_ReturnsOkResult()
    {
        // Arrange
        var orderId = 1;
        var expectedOrder = new OrderDetailsResponse { Order = new Order() };
        _mockOrderService
            .Setup(s => s.GetOrder(orderId))
            .ReturnsAsync(expectedOrder);

        // Act
        var result = await _controller.Get(orderId);

        // Assert
        var actionResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expectedOrder, actionResult.Value);
    }

    [Fact]
    public async Task Get_OrderDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var orderId = 1;
        _mockOrderService
            .Setup(s => s.GetOrder(orderId))
            .ReturnsAsync(default(OrderDetailsResponse?));

        // Act
        var result = await _controller.Get(orderId);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ValidRequest_ReturnsCreatedAtAction()
    {
        // Arrange
        var request = new Models.CreateOrderRequest
        {
            TotalAmount = 100m,
            CustomerId = 10,
            OrderLines = new List<Models.OrderItem>
            {
                new Models.OrderItem { ProductId = 5, Quantity = 2 }
            }
        };

        var expectedOrderEntity = new Order { Id = 42, OrderNumber = "A12345" };
        var expectedCreated = new Models.OrderCreatedResponse(orderId: expectedOrderEntity.Id, orderNumber: expectedOrderEntity.OrderNumber);
        _mockOrderService.Setup(s => s.CreateOrder(request)).ReturnsAsync(expectedCreated);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returned = Assert.IsType<Models.OrderCreatedResponse>(created.Value);
        Assert.Equal(expectedOrderEntity.Id, returned.OrderId);
        Assert.Equal(expectedOrderEntity.OrderNumber, returned.OrderNumber);
    }

    [Fact]
    public async Task Update_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var orderId = 5;
        var request = new Models.UpdateOrderRequest
        {
            OrderStatusId = 2,
            TotalAmount = 50m,
        };

        _mockOrderService.Setup(s => s.UpdateOrder(orderId, request)).ReturnsAsync(true);

        // Act
        var result = await _controller.Update(orderId, request);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ExistingOrder_ReturnsNoContent()
    {
        // Arrange
        var orderId = 7;
        _mockOrderService.Setup(s => s.DeleteOrder(orderId)).ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(orderId);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}