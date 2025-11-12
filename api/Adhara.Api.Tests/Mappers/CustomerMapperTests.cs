using Adhara.Api.Mappers;
using Adhara.Api.Models;

namespace Adhara.Api.Tests.Mappers;

public class CustomerMapperTests
{
    [Fact]
    public void FromCreate_MapsNames()
    {
        var req = new CreateCustomerRequest { FirstName = "A", LastName = "B", BillingAddress = new AddressRequest(), ShippingAddress = new AddressRequest() };
        var c = CustomerMapper.FromCreate(req);
        Assert.Equal(req.FirstName, c.FirstName);
        Assert.Equal(req.LastName, c.LastName);
    }

    [Fact]
    public void FromUpdate_MapsIdAndNames()
    {
        var req = new UpdateCustomerRequest { FirstName = "X", LastName = "Y" };
        var c = CustomerMapper.FromUpdate(5, req);
        Assert.Equal(5, c.Id);
        Assert.Equal("X", c.FirstName);
        Assert.Equal("Y", c.LastName);
    }
}
