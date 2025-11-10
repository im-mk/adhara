using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class CustomerMap : EntityMap<Customer>
{
    public CustomerMap()
    {
        Map(c => c.Id).ToColumn("id");
        Map(c => c.FirstName).ToColumn("first_name");
        Map(c => c.LastName).ToColumn("last_name");
    }
}
