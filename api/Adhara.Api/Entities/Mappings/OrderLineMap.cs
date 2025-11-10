using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class OrderLineMap : EntityMap<OrderLine>
{
    public OrderLineMap()
    {
        Map(ol => ol.Id).ToColumn("id");
        Map(ol => ol.OrderId).ToColumn("order_id");
        Map(ol => ol.ProductId).ToColumn("product_id");
        Map(ol => ol.Quantity).ToColumn("quantity");
        Map(ol => ol.Price).ToColumn("price");
        Map(ol => ol.Total).ToColumn("total");
    }
}
