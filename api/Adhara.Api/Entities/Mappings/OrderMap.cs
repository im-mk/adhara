using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class OrderMap : EntityMap<Order>
{
    public OrderMap()
    {
        Map(o => o.Id).ToColumn("id");
        Map(o => o.OrderNumber).ToColumn("order_number");
        Map(o => o.OrderDate).ToColumn("order_date");
        Map(o => o.OrderStatusId).ToColumn("order_status_id");
        Map(o => o.TotalAmount).ToColumn("total_amount");
        Map(o => o.CustomerId).ToColumn("customer_id");
    }
}