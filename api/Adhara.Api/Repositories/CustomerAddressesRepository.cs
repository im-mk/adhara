using Adhara.Api.Entities;
using Dapper;
using System.Data;

namespace Adhara.Api.Repositories;

public class CustomerAddressesRepository(
    IDbConnection dbConnection) : ICustomerAddressesRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public Task<int?> Insert(CustomerAddress mapping, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.customer_addresses (customer_id, address_id, address_type)
            VALUES (@CustomerId, @AddressId, @AddressType)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int?>(sql, new
        {
            mapping.CustomerId,
            mapping.AddressId,
            mapping.AddressType
        }, transaction);
    }

    public Task<IEnumerable<int>> DeleteAndReturnAddressIdsByCustomerId(int customerId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            DELETE FROM public.customer_addresses
            WHERE customer_id = @customerId
            RETURNING address_id;";

        return _dbConnection.QueryAsync<int>(sql, new { customerId }, transaction);
    }
}
