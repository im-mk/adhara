using Orders.Api.Controllers;
using Orders.Api.Entities;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Orders.Api.Tests.Controllers;

public class CountriesControllerTests
{
    private readonly Mock<ICountriesService> _mockService;
    private readonly CountriesController _controller;

    public CountriesControllerTests()
    {
        _mockService = new Mock<ICountriesService>();
        _controller = new CountriesController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_CountriesExist_ReturnsOkResult()
    {
        var countries = new List<Country> { new Country { Id = "US", Name = "United States" } };
        _mockService.Setup(s => s.GetAllCountriesAsync()).ReturnsAsync(countries);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(countries, ok.Value);
    }
}
