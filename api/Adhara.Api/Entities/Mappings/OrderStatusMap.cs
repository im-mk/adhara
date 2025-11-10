using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class OrderStatusMap : EntityMap<OrderStatus>
{
    public OrderStatusMap()
    {
        Map(os => os.Id).ToColumn("id");
        Map(os => os.StatusName).ToColumn("status_name");
        Map(os => os.StatusDescription).ToColumn("status_description");
    }
}
