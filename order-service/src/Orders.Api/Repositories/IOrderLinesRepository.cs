using Orders.Api.Entities;

namespace Orders.Api.Repositories;

public interface IOrderLinesRepository
{
    Task<int> Insert(OrderLine orderLine, System.Data.IDbTransaction? transaction = null);
    Task<IEnumerable<OrderLine>> GetByOrderId(int orderId);
}
