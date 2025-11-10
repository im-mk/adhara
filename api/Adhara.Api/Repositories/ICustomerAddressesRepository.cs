using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface ICustomerAddressesRepository
{
    Task<int?> Insert(CustomerAddress mapping, System.Data.IDbTransaction? transaction = null);
    Task<IEnumerable<int>> DeleteAndReturnAddressIdsByCustomerId(int customerId, System.Data.IDbTransaction? transaction = null);
}
