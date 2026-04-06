using Orders.Api.Models;

namespace Orders.Api.Services;

public interface IOrderService
{
    Task<OrderCreatedResponse> CreateOrder(CreateOrderRequest request);
    Task<bool> UpdateOrder(int orderId, UpdateOrderRequest request);
    Task<OrderDetailsResponse?> GetOrder(int orderId);
    Task<IEnumerable<OrderListResponse>> GetList(DateOnly? startDate = null, DateOnly? endDate = null, int? customerId = null, string? orderNumber = null, int? orderStatusId = null);
    Task<(IReadOnlyCollection<OrderListResponse> Orders, int TotalCount)> GetListPaged(DateOnly? startDate, DateOnly? endDate, int page, int pageSize, int? customerId = null, string? orderNumber = null, int? orderStatusId = null);
    Task<bool> DeleteOrder(int orderId);
}
