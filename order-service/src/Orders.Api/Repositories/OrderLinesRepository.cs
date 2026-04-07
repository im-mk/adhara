using System.Data;
using Orders.Api.Entities;
using Dapper;

namespace Orders.Api.Repositories;

public class OrderLinesRepository(
    IDbConnection dbConnection) : IOrderLinesRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public Task<int> Insert(OrderLine orderLine, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.order_lines (order_id, product_id, quantity, price, total)
            VALUES (@OrderId, @ProductId, @Quantity, @Price, @Total)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int>(sql, orderLine, transaction);
    }

    public Task<IEnumerable<OrderLine>> GetByOrderId(int orderId)
    {
        const string sql = @"
            SELECT id AS Id, order_id AS OrderId, product_id AS ProductId, quantity AS Quantity, price AS Price, total AS Total
            FROM public.order_lines
            WHERE order_id = @OrderId;";

        return _dbConnection.QueryAsync<OrderLine>(sql, new { OrderId = orderId });
    }
}
