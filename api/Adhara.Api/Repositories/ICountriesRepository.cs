using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface ICountriesRepository
{
    Task<IEnumerable<Country>> GetAllAsync();
}
