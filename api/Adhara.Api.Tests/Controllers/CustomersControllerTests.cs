using Moq;
using Adhara.Api.Controllers;
using Adhara.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Entities;

namespace Adhara.Api.Tests.Controllers;

public class CustomersControllerTests
{
    private readonly Mock<ICustomersRepository> _mockRepo;
    private readonly Mock<Adhara.Api.Services.ICustomerService> _mockService;
    private readonly Mock<ICustomerAddressesRepository> _mockCustomerAddressesRepo;
    private readonly Mock<IAddressesRepository> _mockAddressesRepo;
    private readonly Mock<System.Data.IDbConnection> _mockDbConnection;
    private readonly Mock<System.Data.IDbTransaction> _mockDbTransaction;
    private readonly CustomersController _controller;

    public CustomersControllerTests()
    {
        _mockRepo = new Mock<ICustomersRepository>();
        _mockService = new Mock<Adhara.Api.Services.ICustomerService>();
        _mockCustomerAddressesRepo = new Mock<ICustomerAddressesRepository>();
        _mockAddressesRepo = new Mock<IAddressesRepository>();
        _mockDbConnection = new Mock<System.Data.IDbConnection>();
        _mockDbTransaction = new Mock<System.Data.IDbTransaction>();

        _mockDbConnection.Setup(c => c.BeginTransaction()).Returns(_mockDbTransaction.Object);

        _controller = new CustomersController(_mockRepo.Object, _mockService.Object, _mockCustomerAddressesRepo.Object, _mockAddressesRepo.Object, _mockDbConnection.Object);
    }

    [Fact]
    public async Task Get_ReturnsOk_WhenCustomerExists()
    {
        var id = 1;
        var expected = new Customer { Id = id, FirstName = "A", LastName = "B" };
        _mockRepo.Setup(r => r.Get(id)).ReturnsAsync(expected);

        var result = await _controller.Get(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task Get_ReturnsNotFound_WhenMissing()
    {
        var id = 2;
        _mockRepo.Setup(r => r.Get(id)).ReturnsAsync(default(Customer?));

        var result = await _controller.Get(id);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreated_WhenInsertSucceeds()
    {
        var req = new Adhara.Api.Models.CreateCustomerRequest
        {
            FirstName = "F",
            LastName = "L",
            BillingAddress = new Adhara.Api.Models.AddressRequest
            {
                AddressLine1 = "B1",
                Postcode = "P1",
                Country = "GB"
            },
            ShippingAddress = new Adhara.Api.Models.AddressRequest
            {
                AddressLine1 = "S1",
                Postcode = "P2",
                Country = "GB"
            }
        };

        var createdCustomer = new Customer { Id = 11, FirstName = req.FirstName, LastName = req.LastName };
        _mockService.Setup(s => s.CreateCustomerAsync(req)).ReturnsAsync(createdCustomer);

        var result = await _controller.Create(req);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returned = Assert.IsType<Customer>(created.Value);
        Assert.Equal(11, returned.Id);
        _mockService.Verify(s => s.CreateCustomerAsync(req), Times.Once);
    }

    [Fact]
    public async Task Update_ReturnsNoContent_WhenUpdated()
    {
        var id = 3;
        var req = new Adhara.Api.Models.UpdateCustomerRequest { FirstName = "X", LastName = "Y" };
        _mockRepo.Setup(r => r.Update(It.Is<Customer>(c => c.Id == id), It.IsAny<System.Data.IDbTransaction?>())).ReturnsAsync(1);

        var result = await _controller.Update(id, req);
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenDeleted()
    {
        var id = 4;
        _mockCustomerAddressesRepo.Setup(r => r.DeleteAndReturnAddressIdsByCustomerId(id, It.IsAny<System.Data.IDbTransaction?>()))
            .ReturnsAsync(new List<int>());
        _mockRepo.Setup(r => r.Delete(id, It.IsAny<System.Data.IDbTransaction?>())).ReturnsAsync(1);

        var result = await _controller.Delete(id);
        Assert.IsType<NoContentResult>(result);
    }
}
