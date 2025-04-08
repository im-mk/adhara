using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface IOrdersRepository
{
    Task<Order?> Get(int orderId);
    Task<IEnumerable<Order>> GetAll(DateOnly orderDate);
    Task<int?> Insert(Order order);
    Task<int> Update(Order order);
}