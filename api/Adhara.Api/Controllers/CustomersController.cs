using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomersRepository _customersRepository;
    private readonly Adhara.Api.Services.ICustomerService _customerService;
    private readonly ICustomerAddressesRepository _customerAddressesRepository;
    private readonly IAddressesRepository _addressesRepository;
    private readonly System.Data.IDbConnection _dbConnection;

    public CustomersController(
        ICustomersRepository customersRepository,
        Adhara.Api.Services.ICustomerService customerService,
        ICustomerAddressesRepository customerAddressesRepository,
        IAddressesRepository addressesRepository,
        System.Data.IDbConnection dbConnection)
    {
        _customersRepository = customersRepository;
        _customerService = customerService;
        _customerAddressesRepository = customerAddressesRepository;
        _addressesRepository = addressesRepository;
        _dbConnection = dbConnection;
    }

    [HttpGet("{customerId}")]
    [EndpointName("GetCustomerById")]
    public async Task<ActionResult<Customer>> Get(int customerId)
    {
        var result = await _customersRepository.Get(customerId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetAllCustomers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
    {
        var result = await _customersRepository.GetAll();
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateCustomer")]
    public async Task<ActionResult<Customer>> Create([FromBody] CreateCustomerRequest request)
    {
        var created = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(Get), new { customerId = created.Id }, created);
    }

    [HttpPut("{customerId}")]
    [EndpointName("UpdateCustomer")]
    public async Task<IActionResult> Update(int customerId, [FromBody] UpdateCustomerRequest request)
    {
        var customer = new Customer
        {
            Id = customerId,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var rows = await _customersRepository.Update(customer);
        return rows > 0 ? NoContent() : NotFound();
    }

    [HttpDelete("{customerId}")]
    [EndpointName("DeleteCustomer")]
    public async Task<IActionResult> Delete(int customerId)
    {
        // perform deletions in a transaction: delete customer_addresses (returning address ids),
        // delete addresses, then delete customer
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
                return NoContent();
            }

            // nothing deleted -> rollback and return NotFound
            tx.Rollback();
            return NotFound();
        }
        catch
        {
            try { tx.Rollback(); } catch { }
            throw;
        }
    }
}
