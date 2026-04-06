namespace Orders.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAll();
    Task<Product?> Get(int productId);
    Task<int> Insert(Product product);
    Task<int> Update(Product product);
}
