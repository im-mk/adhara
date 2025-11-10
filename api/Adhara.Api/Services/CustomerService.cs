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

    public async Task<Customer> CreateCustomerAsync(CreateCustomerRequest request)
    {
        using var tx = _dbConnection.BeginTransaction();
        try
        {
            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var customerId = await _customersRepository.Insert(customer, tx);
            if (customerId == null) throw new InvalidOperationException("Failed to insert customer");
            customer.Id = customerId.Value;

            var billing = new Address
            {
                AddressLine1 = request.BillingAddress.AddressLine1,
                AddressLine2 = request.BillingAddress.AddressLine2,
                AddressLine3 = request.BillingAddress.AddressLine3,
                AddressLine4 = request.BillingAddress.AddressLine4,
                Postcode = request.BillingAddress.Postcode,
                Country = request.BillingAddress.Country
            };

            var billingId = await _addressesRepository.Insert(billing, tx);
            if (billingId == null) throw new InvalidOperationException("Failed to insert billing address");

            var billingMap = new CustomerAddress
            {
                CustomerId = customer.Id,
                AddressId = billingId.Value,
                AddressType = "Billing"
            };

            var billingMapId = await _customerAddressesRepository.Insert(billingMap, tx);
            if (billingMapId == null) throw new InvalidOperationException("Failed to insert customer_address mapping for billing");

            var shipping = new Address
            {
                AddressLine1 = request.ShippingAddress.AddressLine1,
                AddressLine2 = request.ShippingAddress.AddressLine2,
                AddressLine3 = request.ShippingAddress.AddressLine3,
                AddressLine4 = request.ShippingAddress.AddressLine4,
                Postcode = request.ShippingAddress.Postcode,
                Country = request.ShippingAddress.Country
            };

            var shippingId = await _addressesRepository.Insert(shipping, tx);
            if (shippingId == null) throw new InvalidOperationException("Failed to insert shipping address");

            var shippingMap = new CustomerAddress
            {
                CustomerId = customer.Id,
                AddressId = shippingId.Value,
                AddressType = "Shipping"
            };

            var shippingMapId = await _customerAddressesRepository.Insert(shippingMap, tx);
            if (shippingMapId == null) throw new InvalidOperationException("Failed to insert customer_address mapping for shipping");

            tx.Commit();

            return customer;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}
