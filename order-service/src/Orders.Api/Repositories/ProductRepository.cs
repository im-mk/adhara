using System.Data;
using Dapper;

namespace Orders.Api.Repositories;

public class ProductRepository(IDbConnection dbConnection) : IProductRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public Task<IEnumerable<Product>> GetAll(string? name = null)
    {
        const string sql = @"
            SELECT id AS Id, product_name AS ProductName, product_description AS ProductDescription, unit_price AS UnitPrice
            FROM public.products
            WHERE @Name IS NULL OR product_name ILIKE '%' || @Name || '%'
            ORDER BY product_name;";

        return _dbConnection.QueryAsync<Product>(sql, new { Name = name });
    }

    public Task<Product?> Get(int productId)
    {
        const string sql = @"SELECT id AS Id, product_name AS ProductName, product_description AS ProductDescription, unit_price AS UnitPrice FROM public.products WHERE id = @Id";
        return _dbConnection.QueryFirstOrDefaultAsync<Product?>(sql, new { Id = productId });
    }

    public Task<int> Insert(Product product)
    {
        const string sql = @"
            INSERT INTO public.products (product_name, product_description, unit_price)
            VALUES (@ProductName, @ProductDescription, @UnitPrice)
            RETURNING id;";
        return _dbConnection.QuerySingleAsync<int>(sql, product);
    }

    public Task<int> Update(Product product)
    {
        const string sql = @"
            UPDATE public.products
            SET product_name = @ProductName, product_description = @ProductDescription, unit_price = @UnitPrice
            WHERE id = @Id;";
        return _dbConnection.ExecuteAsync(sql, product);
    }
}