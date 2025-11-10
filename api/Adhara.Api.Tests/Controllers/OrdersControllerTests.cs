using Moq;
using Adhara.Api.Controllers;
using Adhara.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Entities;

namespace Adhara.Api.Tests.Controllers;

public class OrdersControllerTests
{
    private readonly Mock<IOrdersRepository> _mockOrdersRepository;
    private readonly OrdersController _controller;

    public OrdersControllerTests()
    {
        _mockOrdersRepository = new Mock<IOrdersRepository>();
        _controller = new OrdersController(_mockOrdersRepository.Object);
    }

    [Fact]
    public async Task Get_ReturnsOkResult_WhenOrderExists()
    {
        // Arrange
        var orderId = 1;
        var expectedOrder = new Order();
        _mockOrdersRepository
            .Setup(repo => repo.Get(orderId))
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
        _mockOrdersRepository
            .Setup(repo => repo.Get(orderId))
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
        var request = new Adhara.Api.Models.CreateOrderRequest
        {
            OrderNumber = "ORD-1",
            OrderDate = DateTime.UtcNow,
            OrderStatusId = 1,
            TotalAmount = 100m,
            CustomerId = 10
        };

        _mockOrdersRepository
            .Setup(repo => repo.Insert(It.IsAny<Order>(), It.IsAny<System.Data.IDbTransaction?>()))
            .ReturnsAsync(42);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returned = Assert.IsType<Order>(created.Value);
        Assert.Equal(42, returned.Id);
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

        _mockOrdersRepository
            .Setup(repo => repo.Get(orderId))
            .ReturnsAsync(new Order { Id = orderId });

        _mockOrdersRepository
            .Setup(repo => repo.Update(It.Is<Order>(o => o.Id == orderId), It.IsAny<System.Data.IDbTransaction?>()))
            .ReturnsAsync(1);

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
        _mockOrdersRepository
            .Setup(repo => repo.Delete(orderId, It.IsAny<System.Data.IDbTransaction?>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.Delete(orderId);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}