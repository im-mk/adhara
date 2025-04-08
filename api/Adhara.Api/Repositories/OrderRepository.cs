using Adhara.Api.Entities;
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

    public async Task<Order?> Get(int orderId)
    {
        return await _dbConnection.QueryFirstOrDefaultAsync<Order>(
            "SELECT * FROM orders WHERE id = @orderId", new { orderId });
    }

    public async Task<IEnumerable<Order>> GetAll(DateOnly orderDate)
    {
        var start = orderDate.ToDateTime(TimeOnly.MinValue);
        var end = orderDate.AddDays(1).ToDateTime(TimeOnly.MinValue);

        return await _dbConnection.QueryAsync<Order>(
        @"SELECT *
          FROM public.orders 
          WHERE order_date >= @start AND order_date < @end",
        new { start, end });
    }

    public Task<int?> Insert(Order order)
    {
        throw new NotImplementedException();
    }

    public Task<int> Update(Order order)
    {
        throw new NotImplementedException();
    }
}