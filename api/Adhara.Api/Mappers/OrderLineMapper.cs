using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Mappers;

public static class OrderLineMapper
{
    public static OrderLine FromItem(OrderItem item, int orderId)
    {
        return new OrderLine
        {
            OrderId = orderId,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            Price = item.UnitPrice,
            Total = item.UnitPrice * item.Quantity
        };
    }
}
