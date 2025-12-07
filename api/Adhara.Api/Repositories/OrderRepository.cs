using System.Data;
using Adhara.Api.Entities;
using Adhara.Api.Models;
using Dapper;

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

    public async Task<IEnumerable<OrderList>> GetList(DateOnly? startDate, DateOnly? endDate)
    {
        if (startDate == null && endDate == null)
        {
            return await _dbConnection.QueryAsync<OrderList>(
                "SELECT o.Id, o.order_number, o.order_date, o.order_status_id, o.total_amount FROM public.orders o");
        }

        var sql = "SELECT o.Id, o.order_number, o.order_date, o.order_status_id, o.total_amount FROM public.orders o";
        var where = new List<string>();
        DateTime? start = startDate?.ToDateTime(TimeOnly.MinValue);
        DateTime? end = endDate != null ? endDate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue) : null;

        if (start != null) where.Add("o.order_date >= @start");
        if (end != null) where.Add("o.order_date < @end");

        object? parameters = null;
        if (where.Count > 0)
        {
            sql += " WHERE " + string.Join(" AND ", where);
            parameters = new { start, end };
        }

        return await _dbConnection.QueryAsync<OrderList>(sql, parameters);
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