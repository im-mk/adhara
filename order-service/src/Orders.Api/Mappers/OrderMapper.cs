using Orders.Api.Entities;
using Orders.Api.Models;

namespace Orders.Api.Mappers;

public static class OrderMapper
{
    public static Order FromCreate(CreateOrderRequest request)
    {
        var rnd = new Random();
        var number = $"A{rnd.Next(0, 100000):D5}";

        return new Order
        {
            OrderNumber = number,
            OrderDate = DateTime.UtcNow,
            OrderStatusId = (int)OrderStatusEnum.Pending,
            TotalAmount = request.TotalAmount,
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName
        };
    }
}
