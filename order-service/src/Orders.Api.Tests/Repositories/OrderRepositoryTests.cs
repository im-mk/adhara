using System.Data;
using Moq;
using Orders.Api.Repositories;

namespace Orders.Api.Tests.Repositories;

public class OrderRepositoryTests
{
    [Fact]
    public void Constructor_DbConnection_CreatesOrdersRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();

        // Act
        var repository = new OrdersRepository(mockConnection.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnection_ImplementsOrdersRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var repository = new OrdersRepository(mockConnection.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IOrdersRepository>(repository);
    }
}
