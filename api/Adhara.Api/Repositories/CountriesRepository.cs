using Dapper;
using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public class CountriesRepository : ICountriesRepository
{
    private readonly System.Data.IDbConnection _dbConnection;

    public CountriesRepository(System.Data.IDbConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<IEnumerable<Country>> GetAllAsync()
    {
        var sql = "SELECT id AS Id, name AS Name FROM public.countries ORDER BY name";
        return await _dbConnection.QueryAsync<Country>(sql);
    }
}
