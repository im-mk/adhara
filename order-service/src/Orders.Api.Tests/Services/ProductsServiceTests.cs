using Orders.Api.Entities;
using Orders.Api.Repositories;
using Orders.Api.Services;
using Moq;

namespace Orders.Api.Tests.Services;

public class ProductsServiceTests
{
    private readonly Mock<IProductRepository> _mockRepo;
    private readonly ProductsService _service;

    public ProductsServiceTests()
    {
        _mockRepo = new Mock<IProductRepository>();
        _service = new ProductsService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetAllProductsAsync_ReturnsRepositoryResult()
    {
        var expected = new List<Product>
        {
            new Product
            {
                Id = 1,
                ProductName = "Keyboard",
                ProductDescription = "Mechanical keyboard",
                UnitPrice = 89.99m
            }
        };

        _mockRepo.Setup(r => r.GetAll()).ReturnsAsync(expected);

        var result = await _service.GetAllProductsAsync();

        Assert.Equal(expected, result);
    }
}
