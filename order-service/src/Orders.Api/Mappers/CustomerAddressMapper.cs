namespace Orders.Api.Mappers;

public static class CustomerAddressMapper
{
    public static CustomerAddress Create(int customerId, int addressId, string addressType)
    {
        return new CustomerAddress
        {
            CustomerId = customerId,
            AddressId = addressId,
            AddressType = addressType
        };
    }
}
