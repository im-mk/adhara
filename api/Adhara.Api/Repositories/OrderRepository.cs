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

    public async Task<IEnumerable<Order>> GetAll(DateOnly? startDate, DateOnly? endDate)
    {
        if (startDate == null && endDate == null)
        {
            return await _dbConnection.QueryAsync<Order>("SELECT * FROM public.orders");
        }

        var sql = "SELECT * FROM public.orders";
        var where = new List<string>();
        DateTime? start = startDate?.ToDateTime(TimeOnly.MinValue);
        DateTime? end = endDate != null ? endDate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue) : null;

        if (start != null) where.Add("order_date >= @start");
        if (end != null) where.Add("order_date < @end");

        object? parameters = null;
        if (where.Count > 0)
        {
            sql += " WHERE " + string.Join(" AND ", where);
            parameters = new { start, end };
        }

        return await _dbConnection.QueryAsync<Order>(sql, parameters);
    }

    public Task<int> Insert(Order order, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.orders (order_number, order_date, order_status_id, total_amount, customer_id)
            VALUES (@OrderNumber, @OrderDate, @OrderStatusId, @TotalAmount, @CustomerId)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int>(sql, order, transaction);
    }

    public Task<int> Update(Order order, IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE public.orders
            SET
                order_status_id = @OrderStatusId,
                total_amount = @TotalAmount                
            WHERE id = @Id;";

        return _dbConnection.ExecuteAsync(sql, order, transaction);
    }

    public Task<int> Delete(int orderId, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM public.orders WHERE id = @orderId";
        return _dbConnection.ExecuteAsync(sql, new { orderId }, transaction);
    }
}