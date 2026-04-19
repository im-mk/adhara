using System.Data;
using Moq;
using Orders.Api.Repositories;

namespace Orders.Api.Tests.Repositories;

public class OutboxRepositoryTests
{
    [Fact]
    public void Constructor_DbConnection_CreatesOutboxRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();

        // Act
        var repository = new OutboxRepository(mockConnection.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnection_ImplementsOutboxRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var repository = new OutboxRepository(mockConnection.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IOutboxRepository>(repository);
    }
}
