namespace Adhara.Api.Repositories;

public interface IProductRepository
{
    Task<Product?> Get(int productId);
    Task<int> Insert(Product product);
    Task<int> Update(Product product);
}
