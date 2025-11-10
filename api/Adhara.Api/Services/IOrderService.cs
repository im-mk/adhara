using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(CreateOrderRequest request);
    Task<bool> UpdateOrderAsync(int orderId, Adhara.Api.Models.UpdateOrderRequest request);
    Task<Order?> GetOrderAsync(int orderId);
    Task<IEnumerable<Order>> GetAllOrdersAsync(DateOnly? startDate, DateOnly? endDate);
    Task<bool> DeleteOrderAsync(int orderId);
}
