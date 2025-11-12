using Adhara.Api.Entities;

namespace Adhara.Api.Services;

public interface ICountriesService
{
    Task<IEnumerable<Country>> GetAllCountriesAsync();
}
