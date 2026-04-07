using Orders.Api.Mappers;
using Orders.Api.Models;

namespace Orders.Api.Tests.Mappers;

public class OrderMapperTests
{
    [Fact]
    public void FromCreate_PopulatesFieldsAndFormatsOrderNumber()
    {
        var req = new CreateOrderRequest
        {
            TotalAmount = 123.45m,
            CustomerId = 7,
            CustomerName = "Jane Doe"
        };

        var order = OrderMapper.FromCreate(req);

        Assert.Equal(req.TotalAmount, order.TotalAmount);
        Assert.Equal(req.CustomerId, order.CustomerId);
        Assert.Equal(req.CustomerName, order.CustomerName);
        Assert.Equal(1, order.OrderStatusId);
        Assert.NotEqual(default(DateTime), order.OrderDate);
        Assert.Matches("^A\\d{5}$", order.OrderNumber);
    }
}
