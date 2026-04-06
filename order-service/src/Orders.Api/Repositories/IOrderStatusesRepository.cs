using Orders.Api.Entities;

namespace Orders.Api.Repositories;

public interface IOrderStatusesRepository
{
    Task<IEnumerable<OrderStatus>> GetAllAsync();
}
