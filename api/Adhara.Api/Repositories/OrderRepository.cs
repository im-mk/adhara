using Dapper;
using System.Data;

namespace Adhara.Api.Repositories;

public class OrdersRepository : IOrdersRepository
{
    private readonly IDbConnection _dbConnection;

    public OrdersRepository(
        IDbConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<string?> Get(int orderId)
    {
        return await _dbConnection.QuerySingleOrDefaultAsync<string>("SELECT order_number FROM public.orders WHERE id = @orderId", new { orderId });
    }
}