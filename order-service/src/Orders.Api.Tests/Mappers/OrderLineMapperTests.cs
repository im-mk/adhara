using Orders.Api.Mappers;
using Orders.Api.Models;

namespace Orders.Api.Tests.Mappers;

public class OrderLineMapperTests
{
    [Fact]
    public void FromItem_OrderItem_ComputesTotalAndMapsFields()
    {
        var item = new OrderItem { ProductId = 2, Quantity = 3 };
        var product = new Product { Id = 2, ProductName = "Test", ProductDescription = "Test", UnitPrice = 10m };
        var line = OrderLineMapper.FromItem(item, orderId: 42, product: product);

        Assert.Equal(42, line.OrderId);
        Assert.Equal(2, line.ProductId);
        Assert.Equal(3, line.Quantity);
        Assert.Equal(10m, line.Price);
        Assert.Equal(30m, line.Total);
    }
}
