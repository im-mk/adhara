using Adhara.Api.Models;
using Adhara.Api.Repositories;
using Adhara.Api.Services;
using Moq;

namespace Adhara.Api.Tests.Services;

public class CustomerServiceTests
{
    private readonly Mock<System.Data.IDbConnection> _mockConn;
    private readonly Mock<ICustomersRepository> _mockCustomers;
    private readonly Mock<IAddressesRepository> _mockAddresses;
    private readonly Mock<ICustomerAddressesRepository> _mockCustomerAddresses;
    private readonly CustomerService _service;

    public CustomerServiceTests()
    {
        _mockConn = new Mock<System.Data.IDbConnection>();
        _mockCustomers = new Mock<ICustomersRepository>();
        _mockAddresses = new Mock<IAddressesRepository>();
        _mockCustomerAddresses = new Mock<ICustomerAddressesRepository>();

        _service = new CustomerService(_mockConn.Object, _mockCustomers.Object, _mockAddresses.Object, _mockCustomerAddresses.Object);
    }

    [Fact]
    public async Task CreateCustomerAsync_InsertsEverythingAndCommits()
    {
        var tx = new Mock<System.Data.IDbTransaction>();
        _mockConn.Setup(c => c.BeginTransaction()).Returns(tx.Object);

        var req = new CreateCustomerRequest
        {
            FirstName = "F",
            LastName = "L",
            BillingAddress = new AddressRequest { AddressLine1 = "B1", Postcode = "P1", Country = "GB" },
            ShippingAddress = new AddressRequest { AddressLine1 = "S1", Postcode = "P2", Country = "GB" }
        };

        _mockCustomers.Setup(r => r.Insert(It.IsAny<Customer>(), tx.Object)).ReturnsAsync(10);
        _mockAddresses.Setup(r => r.Insert(It.IsAny<Address>(), tx.Object)).ReturnsAsync(11);
        _mockCustomerAddresses.Setup(r => r.Insert(It.IsAny<CustomerAddress>(), tx.Object)).ReturnsAsync(12);

        var created = await _service.CreateCustomerAsync(req);

        Assert.Equal(10, created);
        _mockCustomers.Verify(r => r.Insert(It.IsAny<Customer>(), tx.Object), Times.Once);
        _mockAddresses.Verify(r => r.Insert(It.IsAny<Address>(), tx.Object), Times.Exactly(2));
        _mockCustomerAddresses.Verify(r => r.Insert(It.IsAny<CustomerAddress>(), tx.Object), Times.Exactly(2));
        tx.Verify(t => t.Commit(), Times.Once);
    }

    [Fact]
    public async Task DeleteCustomerAsync_DeletesCustomerAndAddresses_AndCommits()
    {
        var tx = new Mock<System.Data.IDbTransaction>();
        _mockConn.Setup(c => c.BeginTransaction()).Returns(tx.Object);

        _mockCustomerAddresses.Setup(r => r.DeleteAndReturnAddressIdsByCustomerId(5, tx.Object)).ReturnsAsync(new List<int> { 1, 2 });
        _mockAddresses.Setup(r => r.DeleteByIds(It.IsAny<IEnumerable<int>>(), tx.Object)).ReturnsAsync(2);
        _mockCustomers.Setup(r => r.Delete(5, tx.Object)).ReturnsAsync(1);

        var ok = await _service.DeleteCustomerAsync(5);
        Assert.True(ok);
        tx.Verify(t => t.Commit(), Times.Once);
    }
}
