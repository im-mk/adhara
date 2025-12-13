using Adhara.Api.Mappers;
using Adhara.Api.Models;
using Adhara.Api.Repositories;

namespace Adhara.Api.Services;

public class CustomerService : ICustomerService
{
    private readonly System.Data.IDbConnection _dbConnection;
    private readonly ICustomersRepository _customersRepository;
    private readonly IAddressesRepository _addressesRepository;
    private readonly ICustomerAddressesRepository _customerAddressesRepository;

    public CustomerService(
        System.Data.IDbConnection dbConnection,
        ICustomersRepository customersRepository,
        IAddressesRepository addressesRepository,
        ICustomerAddressesRepository customerAddressesRepository)
    {
        _dbConnection = dbConnection;
        _customersRepository = customersRepository;
        _addressesRepository = addressesRepository;
        _customerAddressesRepository = customerAddressesRepository;
    }

    public async Task<int> CreateCustomerAsync(CreateCustomerRequest request)
    {
        using var tx = _dbConnection.BeginTransaction();
        try
        {
            var customer = CustomerMapper.FromCreate(request);

            var customerId = await _customersRepository.Insert(customer, tx);
            if (customerId == null) throw new InvalidOperationException("Failed to insert customer");
            customer.Id = customerId.Value;

            var billing = AddressMapper.FromRequest(request.BillingAddress);

            var billingId = await _addressesRepository.Insert(billing, tx);
            if (billingId < 1) throw new InvalidOperationException("Failed to insert billing address");

            var billingMap = CustomerAddressMapper.Create(customer.Id, billingId, "Billing");

            var billingMapId = await _customerAddressesRepository.Insert(billingMap, tx);
            if (billingMapId < 1) throw new InvalidOperationException("Failed to insert customer_address mapping for billing");

            var shipping = AddressMapper.FromRequest(request.ShippingAddress);

            var shippingId = await _addressesRepository.Insert(shipping, tx);
            if (shippingId < 1) throw new InvalidOperationException("Failed to insert shipping address");

            var shippingMap = CustomerAddressMapper.Create(customer.Id, shippingId, "Shipping");

            var shippingMapId = await _customerAddressesRepository.Insert(shippingMap, tx);
            if (shippingMapId < 1) throw new InvalidOperationException("Failed to insert customer_address mapping for shipping");

            tx.Commit();

            return customer.Id;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task<bool> DeleteCustomerAsync(int customerId)
    {
        using var tx = _dbConnection.BeginTransaction();
        try
        {
            var addressIds = (await _customerAddressesRepository.DeleteAndReturnAddressIdsByCustomerId(customerId, tx)).ToList();

            if (addressIds.Count > 0)
            {
                await _addressesRepository.DeleteByIds(addressIds, tx);
            }

            var rows = await _customersRepository.Delete(customerId, tx);

            if (rows > 0)
            {
                tx.Commit();
                return true;
            }
        }
        catch
        {
            tx.Rollback();
            throw;
        }
        return false;
    }

    public async Task<bool> UpdateCustomerAsync(int customerId, UpdateCustomerRequest request)
    {
        var customer = CustomerMapper.FromUpdate(customerId, request);

        var rows = await _customersRepository.Update(customer);
        return rows > 0;
    }

    public Task<Customer?> GetCustomerAsync(int customerId)
    {
        return _customersRepository.Get(customerId);
    }

    public Task<IEnumerable<Customer>> GetAllCustomersAsync()
    {
        return _customersRepository.GetAll();
    }


}
