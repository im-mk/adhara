using Orders.Api.Entities;

namespace Orders.Api.Repositories;

public interface ICountriesRepository
{
    Task<IEnumerable<Country>> GetAllAsync();
}
