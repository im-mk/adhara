using Adhara.Api.Models;

namespace Adhara.Api.Mappers;

public static class CustomerMapper
{
    public static Customer FromCreate(CreateCustomerRequest request)
    {
        return new Customer
        {
            FirstName = request.FirstName,
            LastName = request.LastName
        };
    }

    public static Customer FromUpdate(int id, UpdateCustomerRequest request)
    {
        return new Customer
        {
            Id = id,
            FirstName = request.FirstName,
            LastName = request.LastName
        };
    }
}
