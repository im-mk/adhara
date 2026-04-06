using Orders.Api.Entities;
using Orders.Api.Repositories;

namespace Orders.Api.Services;

public class OrderStatusesService(IOrderStatusesRepository orderStatusesRepository) : IOrderStatusesService
{
    public Task<IEnumerable<OrderStatus>> GetAllAsync()
    {
        return orderStatusesRepository.GetAllAsync();
    }
}
