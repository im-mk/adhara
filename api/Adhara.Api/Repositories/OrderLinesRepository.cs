using Adhara.Api.Entities;
using Dapper;
using System.Data;

namespace Adhara.Api.Repositories;

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
}
