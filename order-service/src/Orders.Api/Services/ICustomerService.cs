using Orders.Api.Models;

namespace Orders.Api.Services;

public interface ICustomerService
{
    Task<int> CreateCustomerAsync(CreateCustomerRequest request);
    Task<bool> DeleteCustomerAsync(int customerId);
    Task<bool> UpdateCustomerAsync(int customerId, UpdateCustomerRequest request);
    Task<Customer?> GetCustomerAsync(int customerId);
    Task<IEnumerable<Customer>> GetAllCustomersAsync();
}
