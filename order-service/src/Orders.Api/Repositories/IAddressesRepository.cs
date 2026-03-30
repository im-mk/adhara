namespace Orders.Api.Repositories;

public interface IAddressesRepository
{
    Task<int> Insert(Address address, System.Data.IDbTransaction? transaction = null);
    Task<int> DeleteByIds(IEnumerable<int> ids, System.Data.IDbTransaction? transaction = null);
}
