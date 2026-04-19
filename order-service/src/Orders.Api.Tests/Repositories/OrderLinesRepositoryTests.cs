using System.Data;
using Moq;
using Orders.Api.Repositories;

namespace Orders.Api.Tests.Repositories;

public class OrderLinesRepositoryTests
{
    [Fact]
    public void Constructor_DbConnection_CreatesOrderLinesRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();

        // Act
        var repository = new OrderLinesRepository(mockConnection.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnection_ImplementsOrderLinesRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var repository = new OrderLinesRepository(mockConnection.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IOrderLinesRepository>(repository);
    }
}
