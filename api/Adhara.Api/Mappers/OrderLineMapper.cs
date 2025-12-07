using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Mappers;

public static class OrderLineMapper
{
    public static OrderLine FromItem(OrderItem item, int orderId, Product product)
    {
        return new OrderLine
        {
            OrderId = orderId,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            Price = product.UnitPrice,
            Total = product.UnitPrice * item.Quantity
        };
    }
}
