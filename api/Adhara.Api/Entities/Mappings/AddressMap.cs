using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class AddressMap : EntityMap<Address>
{
    public AddressMap()
    {
        Map(a => a.Id).ToColumn("id");
        Map(a => a.AddressLine1).ToColumn("address_line1");
        Map(a => a.AddressLine2).ToColumn("address_line2");
        Map(a => a.AddressLine3).ToColumn("address_line3");
        Map(a => a.AddressLine4).ToColumn("address_line4");
        Map(a => a.Postcode).ToColumn("postcode");
        Map(a => a.Country).ToColumn("country");
    }
}
