using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface IOrdersRepository
{
    Task<Order?> Get(int orderId);
    Task<IEnumerable<Order>> GetAll(DateOnly startDate, DateOnly endDate);
    Task<int> Insert(Order order, System.Data.IDbTransaction? transaction = null);
    Task<int> Update(Order order, System.Data.IDbTransaction? transaction = null);
    Task<int> Delete(int orderId, System.Data.IDbTransaction? transaction = null);
}