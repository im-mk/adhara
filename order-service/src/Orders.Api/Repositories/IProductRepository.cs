namespace Orders.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAll(string? name = null);
    Task<Product?> Get(int productId);
    Task<int> Insert(Product product);
    Task<int> Update(Product product);
}
