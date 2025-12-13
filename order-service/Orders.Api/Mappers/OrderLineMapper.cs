using Orders.Api.Entities;
using Orders.Api.Models;

namespace Orders.Api.Mappers;

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
