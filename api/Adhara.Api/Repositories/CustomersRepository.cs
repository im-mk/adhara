using Adhara.Api.Entities;
using Dapper;
using System.Data;

namespace Adhara.Api.Repositories;

public class CustomersRepository(
    IDbConnection dbConnection) : ICustomersRepository
{
    private readonly IDbConnection _dbConnection = dbConnection;

    public Task<Customer?> Get(int customerId)
    {
        return _dbConnection.QueryFirstOrDefaultAsync<Customer>(
            "SELECT * FROM public.customers WHERE id = @customerId", new { customerId });
    }

    public Task<IEnumerable<Customer>> GetAll()
    {
        return _dbConnection.QueryAsync<Customer>("SELECT * FROM public.customers");
    }

    public Task<int?> Insert(Customer customer, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO public.customers (first_name, last_name)
            VALUES (@FirstName, @LastName)
            RETURNING id;";

        return _dbConnection.QuerySingleAsync<int?>(sql, new
        {
            customer.FirstName,
            customer.LastName
        }, transaction);
    }

    public Task<int> Update(Customer customer, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE public.customers
            SET first_name = @FirstName,
                last_name = @LastName
            WHERE id = @Id;";

        return _dbConnection.ExecuteAsync(sql, new
        {
            customer.FirstName,
            customer.LastName,
            customer.Id
        }, transaction);
    }

    public Task<int> Delete(int customerId, System.Data.IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM public.customers WHERE id = @customerId";
        return _dbConnection.ExecuteAsync(sql, new { customerId }, transaction);
    }
}
