using Orders.Api.Entities;
using Orders.Api.Repositories;
using Orders.Api.Services;
using Moq;

namespace Orders.Api.Tests.Services;

public class CountriesServiceTests
{
    private readonly Mock<ICountriesRepository> _mockRepo;
    private readonly CountriesService _service;

    public CountriesServiceTests()
    {
        _mockRepo = new Mock<ICountriesRepository>();
        _service = new CountriesService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetAllCountriesAsync_RepositoryResult_ReturnsCountries()
    {
        var expected = new List<Country> { new Country { Id = "GB", Name = "United Kingdom" } };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(expected);

        var result = await _service.GetAllCountriesAsync();
        Assert.Equal(expected, result);
    }
}
