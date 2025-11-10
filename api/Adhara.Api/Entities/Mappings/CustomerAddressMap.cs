using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class CustomerAddressMap : EntityMap<CustomerAddress>
{
    public CustomerAddressMap()
    {
        Map(ca => ca.Id).ToColumn("id");
        Map(ca => ca.CustomerId).ToColumn("customer_id");
        Map(ca => ca.AddressId).ToColumn("address_id");
        Map(ca => ca.AddressType).ToColumn("address_type");
    }
}
