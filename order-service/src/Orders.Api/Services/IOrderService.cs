using Orders.Api.Models;

namespace Orders.Api.Services;

public interface IOrderService
{
    Task<OrderCreatedResponse> CreateOrder(CreateOrderRequest request);
    Task<bool> UpdateOrder(int orderId, UpdateOrderRequest request);
    Task<OrderDetailsResponse?> GetOrder(int orderId);
    Task<IEnumerable<OrderListResponse>> GetList(DateOnly? startDate = null, DateOnly? endDate = null);
    Task<bool> DeleteOrder(int orderId);
}
