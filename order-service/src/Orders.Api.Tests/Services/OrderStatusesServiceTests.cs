using Orders.Api.Entities;
using Orders.Api.Repositories;
using Orders.Api.Services;
using Moq;

namespace Orders.Api.Tests.Services;

public class OrderStatusesServiceTests
{
    private readonly Mock<IOrderStatusesRepository> _mockRepo;
    private readonly OrderStatusesService _service;

    public OrderStatusesServiceTests()
    {
        _mockRepo = new Mock<IOrderStatusesRepository>();
        _service = new OrderStatusesService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetAllAsync_RepositoryResult_ReturnsStatuses()
    {
        // Arrange
        var expected = new List<OrderStatus>
        {
            new OrderStatus { Id = 1, StatusName = "Pending" },
            new OrderStatus { Id = 2, StatusName = "Processing" },
            new OrderStatus { Id = 3, StatusName = "Completed" }
        };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(expected);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.Equal(expected, result);
        _mockRepo.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_EmptyRepositoryResult_ReturnsEmptyCollection()
    {
        // Arrange
        var expected = new List<OrderStatus>();
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(expected);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.Empty(result);
        _mockRepo.Verify(r => r.GetAllAsync(), Times.Once);
    }
}
