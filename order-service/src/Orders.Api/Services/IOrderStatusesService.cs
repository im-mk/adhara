using Orders.Api.Entities;

namespace Orders.Api.Services;

public interface IOrderStatusesService
{
    Task<IEnumerable<OrderStatus>> GetAllAsync();
}
