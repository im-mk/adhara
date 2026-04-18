using System.Data;
using Moq;
using Orders.Api.Repositories;

namespace Orders.Api.Tests.Repositories;

public class ProductRepositoryTests
{
    [Fact]
    public void Constructor_DbConnection_CreatesProductRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();

        // Act
        var repository = new ProductRepository(mockConnection.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnection_ImplementsProductRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var repository = new ProductRepository(mockConnection.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IProductRepository>(repository);
    }
}
