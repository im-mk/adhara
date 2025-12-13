using Adhara.Api.Mappers;
using Adhara.Api.Models;

namespace Adhara.Api.Tests.Mappers;

public class AddressMapperTests
{
    [Fact]
    public void FromRequest_MapsFields()
    {
        var req = new AddressRequest { AddressLine1 = "L1", AddressLine2 = "L2", Postcode = "P", Country = "GB" };
        var a = AddressMapper.FromRequest(req);
        Assert.Equal(req.AddressLine1, a.AddressLine1);
        Assert.Equal(req.AddressLine2, a.AddressLine2);
        Assert.Equal(req.Postcode, a.Postcode);
        Assert.Equal(req.Country, a.Country);
    }
}
