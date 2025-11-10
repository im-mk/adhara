using Adhara.Api.Entities;
using Dapper;
using System.Data;

namespace Adhara.Api.Repositories;

public class OrdersRepository(
    IDbConnection dbConnection) : IOrdersRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public async Task<Order?> Get(int orderId)
    {
        return await _dbConnection.QueryFirstOrDefaultAsync<Order>(
            "SELECT * FROM orders WHERE id = @orderId", new { orderId });
    }

    public async Task<IEnumerable<Order>> GetAll(DateOnly startDate, DateOnly endDate)
    {
        var start = startDate.ToDateTime(TimeOnly.MinValue);
        var end = endDate.AddDays(1).ToDateTime(TimeOnly.MinValue);

        return await _dbConnection.QueryAsync<Order>(
        @"SELECT *
          FROM public.orders 
          WHERE order_date >= @start AND order_date < @end",
        new { start, end });
    }

    public Task<int?> Insert(Order order, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.orders (order_number, order_date, order_status_id, total_amount, customer_id)
            VALUES (@OrderNumber, @OrderDate, @OrderStatusId, @TotalAmount, @CustomerId)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int?>(sql, new
        {
            order.OrderNumber,
            order.OrderDate,
            order.OrderStatusId,
            order.TotalAmount,
            order.CustomerId
        }, transaction);
    }

    public Task<int> Update(Order order, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE public.orders
            SET
                order_status_id = @OrderStatusId,
                total_amount = @TotalAmount                
            WHERE id = @Id;";

        return _dbConnection.ExecuteAsync(sql, new
        {
            order.OrderStatusId,
            order.TotalAmount,
            order.Id
        }, transaction);
    }

    public Task<int> Delete(int orderId, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM public.orders WHERE id = @orderId";
        return _dbConnection.ExecuteAsync(sql, new { orderId }, transaction);
    }
}