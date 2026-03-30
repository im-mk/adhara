using System.Data;
using Dapper;

namespace Orders.Api.Repositories;

public class CustomerAddressesRepository(
    IDbConnection dbConnection) : ICustomerAddressesRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public Task<int> Insert(CustomerAddress address, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.customer_addresses (customer_id, address_id, address_type)
            VALUES (@CustomerId, @AddressId, @AddressType)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int>(sql, address, transaction);
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
