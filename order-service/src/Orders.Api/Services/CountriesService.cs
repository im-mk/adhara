using Orders.Api.Entities;
using Orders.Api.Repositories;

namespace Orders.Api.Services;

public class CountriesService : ICountriesService
{
    private readonly ICountriesRepository _countriesRepository;

    public CountriesService(ICountriesRepository countriesRepository)
    {
        _countriesRepository = countriesRepository;
    }

    public Task<IEnumerable<Country>> GetAllCountriesAsync()
    {
        return _countriesRepository.GetAllAsync();
    }
}
