namespace Orders.Api.Repositories;

public interface ICustomersRepository
{
    Task<Customer?> Get(int customerId);
    Task<IEnumerable<Customer>> GetAll();
    Task<int?> Insert(Customer customer, System.Data.IDbTransaction? transaction = null);
    Task<int> Update(Customer customer, System.Data.IDbTransaction? transaction = null);
    Task<int> Delete(int customerId, System.Data.IDbTransaction? transaction = null);
}
