using Orders.Api.Entities;

namespace Orders.Api.Services;

public interface IProductsService
{
    Task<IEnumerable<Product>> GetAllProductsAsync(string? name = null);
}
