using System.Data;
using Moq;
using Orders.Api.Repositories;

namespace Orders.Api.Tests.Repositories;

public class AddressesRepositoryTests
{
    [Fact]
    public void Constructor_DbConnection_CreatesRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();

        // Act
        var repository = new AddressesRepository(mockConnection.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnection_ImplementsAddressesRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var repository = new AddressesRepository(mockConnection.Object);

        // Act & Assert
        Assert.IsAssignableFrom<IAddressesRepository>(repository);
    }
}
