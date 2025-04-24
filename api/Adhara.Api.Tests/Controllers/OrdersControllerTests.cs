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
}