using System.Data;
using Moq;
using Orders.Api.Repositories;
using ZiggyCreatures.Caching.Fusion;

namespace Orders.Api.Tests.Repositories;

public class OrderStatusesRepositoryTests
{
    [Fact]
    public void Constructor_DbConnectionAndCache_CreatesOrderStatusesRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var mockCache = new Mock<IFusionCache>();

        // Act
        var repository = new OrderStatusesRepository(mockConnection.Object, mockCache.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnectionAndCache_ImplementsOrderStatusesRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var mockCache = new Mock<IFusionCache>();
        var repository = new OrderStatusesRepository(mockConnection.Object, mockCache.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IOrderStatusesRepository>(repository);
    }
}
