using Orders.Api.Entities;
using Orders.Api.Repositories;

namespace Orders.Api.Services;

public class ProductsService : IProductsService
{
    private readonly IProductRepository _productRepository;

    public ProductsService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public Task<IEnumerable<Product>> GetAllProductsAsync(string? name = null)
    {
        var trimmedName = string.IsNullOrWhiteSpace(name) ? null : name.Trim();
        return _productRepository.GetAll(trimmedName);
    }
}
