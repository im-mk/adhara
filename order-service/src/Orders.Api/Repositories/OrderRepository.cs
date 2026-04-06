using System.Data;
using Orders.Api.Entities;
using Orders.Api.Models;
using Dapper;

namespace Orders.Api.Repositories;

public class OrdersRepository(
    IDbConnection dbConnection) : IOrdersRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public async Task<Order?> Get(int orderId)
    {
        return await _dbConnection.QueryFirstOrDefaultAsync<Order>(
            "SELECT * FROM orders WHERE id = @orderId", new { orderId });
    }

    public async Task<IEnumerable<OrderList>> GetList(DateOnly? startDate, DateOnly? endDate, int? customerId = null, string? orderNumber = null, int? orderStatusId = null)
    {
        if (startDate == null && endDate == null && customerId == null && orderNumber == null && orderStatusId == null)
        {
            return await _dbConnection.QueryAsync<OrderList>(
                "SELECT o.Id, o.order_number, o.order_date, o.order_status_id, o.total_amount, o.customer_id FROM public.orders o ORDER BY o.order_date DESC, o.id DESC");
        }

        var sql = "SELECT o.Id, o.order_number, o.order_date, o.order_status_id, o.total_amount, o.customer_id FROM public.orders o";
        var where = new List<string>();
        DateTime? start = startDate?.ToDateTime(TimeOnly.MinValue);
        DateTime? end = endDate != null ? endDate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue) : null;
        string? orderNumberPattern = orderNumber != null ? $"%{orderNumber}%" : null;

        if (start != null) where.Add("o.order_date >= @start");
        if (end != null) where.Add("o.order_date < @end");
        if (customerId != null) where.Add("o.customer_id = @customerId");
        if (orderNumberPattern != null) where.Add("o.order_number ILIKE @orderNumberPattern");
        if (orderStatusId != null) where.Add("o.order_status_id = @orderStatusId");

        object parameters = new { start, end, customerId, orderNumberPattern, orderStatusId };
        if (where.Count > 0)
        {
            sql += " WHERE " + string.Join(" AND ", where);
        }

        sql += " ORDER BY o.order_date DESC, o.id DESC";

        return await _dbConnection.QueryAsync<OrderList>(sql, parameters);
    }

    public async Task<(IEnumerable<OrderList> Orders, int TotalCount)> GetListPaged(DateOnly? startDate, DateOnly? endDate, int page, int pageSize, int? customerId = null, string? orderNumber = null, int? orderStatusId = null)
    {
        var where = new List<string>();
        DateTime? start = startDate?.ToDateTime(TimeOnly.MinValue);
        DateTime? end = endDate != null ? endDate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue) : null;
        string? orderNumberPattern = orderNumber != null ? $"%{orderNumber}%" : null;

        if (start != null) where.Add("o.order_date >= @start");
        if (end != null) where.Add("o.order_date < @end");
        if (customerId != null) where.Add("o.customer_id = @customerId");
        if (orderNumberPattern != null) where.Add("o.order_number ILIKE @orderNumberPattern");
        if (orderStatusId != null) where.Add("o.order_status_id = @orderStatusId");

        var whereSql = where.Count > 0 ? $" WHERE {string.Join(" AND ", where)}" : string.Empty;
        var offset = (page - 1) * pageSize;
        var parameters = new { start, end, customerId, orderNumberPattern, orderStatusId, limit = pageSize, offset };

        var countSql = $"SELECT COUNT(1) FROM public.orders o{whereSql}";
        var totalCount = await _dbConnection.ExecuteScalarAsync<int>(countSql, parameters);

        var pageSql = $@"
            SELECT o.Id, o.order_number, o.order_date, o.order_status_id, o.total_amount, o.customer_id
            FROM public.orders o
            {whereSql}
            ORDER BY o.order_date DESC, o.id DESC
            LIMIT @limit OFFSET @offset";

        var orders = await _dbConnection.QueryAsync<OrderList>(pageSql, parameters);
        return (orders, totalCount);
    }

    public Task<int> Insert(Order order, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.orders (order_number, order_date, order_status_id, total_amount, customer_id, customer_name, shipping_address_id, billing_address_id)
            VALUES (@OrderNumber, @OrderDate, @OrderStatusId, @TotalAmount, @CustomerId, @CustomerName, @ShippingAddressId, @BillingAddressId)
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
