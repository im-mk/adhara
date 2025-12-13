using Orders.Api.Entities;

namespace Orders.Api.Services;

public interface ICountriesService
{
    Task<IEnumerable<Country>> GetAllCountriesAsync();
}
