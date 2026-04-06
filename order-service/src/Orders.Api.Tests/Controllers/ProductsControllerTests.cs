using Orders.Api.Controllers;
using Orders.Api.Entities;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Orders.Api.Tests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductsService> _mockService;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _mockService = new Mock<IProductsService>();
        _controller = new ProductsController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithProducts()
    {
        var products = new List<Product>
        {
            new Product
            {
                Id = 1,
                ProductName = "Wireless Mouse",
                ProductDescription = "Ergonomic wireless mouse",
                UnitPrice = 19.99m
            }
        };

        _mockService.Setup(s => s.GetAllProductsAsync(null)).ReturnsAsync(products);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(products, ok.Value);
    }

    [Fact]
    public async Task GetAll_WithNameFilter_ForwardsFilterToService()
    {
        var products = new List<Product>
        {
            new Product
            {
                Id = 1,
                ProductName = "Wireless Mouse",
                ProductDescription = "Ergonomic wireless mouse",
                UnitPrice = 19.99m
            }
        };

        _mockService.Setup(s => s.GetAllProductsAsync("mouse")).ReturnsAsync(products);

        var result = await _controller.GetAll("mouse");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(products, ok.Value);
        _mockService.Verify(s => s.GetAllProductsAsync("mouse"), Times.Once);
    }
}
