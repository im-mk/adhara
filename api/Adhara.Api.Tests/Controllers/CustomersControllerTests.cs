using Moq;
using Adhara.Api.Controllers;
using Adhara.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Entities;

namespace Adhara.Api.Tests.Controllers;

public class CustomersControllerTests
{
    private readonly Mock<Services.ICustomerService> _mockService;
    private readonly CustomersController _controller;

    public CustomersControllerTests()
    {
        _mockService = new Mock<Services.ICustomerService>();

        _controller = new CustomersController(_mockService.Object);
    }

    [Fact]
    public async Task Get_ReturnsOk_WhenCustomerExists()
    {
        var id = 1;
        var expected = new Customer { Id = id, FirstName = "A", LastName = "B" };
        _mockService.Setup(s => s.GetCustomerAsync(id)).ReturnsAsync(expected);

        var result = await _controller.Get(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task Get_ReturnsNotFound_WhenMissing()
    {
        var id = 2;
        _mockService.Setup(s => s.GetCustomerAsync(id)).ReturnsAsync(default(Customer?));

        var result = await _controller.Get(id);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreated_WhenInsertSucceeds()
    {
        var req = new Models.CreateCustomerRequest
        {
            FirstName = "F",
            LastName = "L",
            BillingAddress = new Models.AddressRequest
            {
                AddressLine1 = "B1",
                Postcode = "P1",
                Country = "GB"
            },
            ShippingAddress = new Models.AddressRequest
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
        var req = new Models.UpdateCustomerRequest { FirstName = "X", LastName = "Y" };
        _mockService.Setup(s => s.UpdateCustomerAsync(id, req)).ReturnsAsync(true);

        var result = await _controller.Update(id, req);
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenDeleted()
    {
        var id = 4;
        _mockService.Setup(s => s.DeleteCustomerAsync(id)).ReturnsAsync(true);

        var result = await _controller.Delete(id);
        Assert.IsType<NoContentResult>(result);
    }
}
