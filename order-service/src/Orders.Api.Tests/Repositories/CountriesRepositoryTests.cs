using System.Data;
using Moq;
using Orders.Api.Repositories;
using ZiggyCreatures.Caching.Fusion;

namespace Orders.Api.Tests.Repositories;

public class CountriesRepositoryTests
{
    [Fact]
    public void Constructor_DbConnectionAndCache_CreatesCountriesRepository()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var mockCache = new Mock<IFusionCache>();

        // Act
        var repository = new CountriesRepository(mockConnection.Object, mockCache.Object);

        // Assert
        Assert.NotNull(repository);
    }

    [Fact]
    public void Constructor_DbConnectionAndCache_ImplementsCountriesRepositoryInterface()
    {
        // Arrange
        var mockConnection = new Mock<IDbConnection>();
        var mockCache = new Mock<IFusionCache>();
        var repository = new CountriesRepository(mockConnection.Object, mockCache.Object);

        // Act & Assert
        Assert.IsAssignableFrom<ICountriesRepository>(repository);
    }
}
