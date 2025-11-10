using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Services;

public interface ICustomerService
{
    Task<Customer> CreateCustomerAsync(CreateCustomerRequest request);
}
