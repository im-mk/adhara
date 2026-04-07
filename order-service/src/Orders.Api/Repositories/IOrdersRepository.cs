using Orders.Api.Entities;
using Orders.Api.Models;

namespace Orders.Api.Repositories;

public interface IOrdersRepository
{
    Task<Order?> Get(int orderId);
    Task<IEnumerable<OrderList>> GetList(DateOnly? startDate, DateOnly? endDate, int? customerId = null, string? orderNumber = null, int? orderStatusId = null);
    Task<(IEnumerable<OrderList> Orders, int TotalCount)> GetListPaged(DateOnly? startDate, DateOnly? endDate, int page, int pageSize, int? customerId = null, string? orderNumber = null, int? orderStatusId = null);
    Task<int> Insert(Order order, System.Data.IDbTransaction? transaction = null);
    Task<int> Update(Order order, System.Data.IDbTransaction? transaction = null);
    Task<int> Delete(int orderId, System.Data.IDbTransaction? transaction = null);
}