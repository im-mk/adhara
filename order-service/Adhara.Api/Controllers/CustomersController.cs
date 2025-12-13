using Adhara.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class CustomersController : ControllerBase
{
    private readonly Services.ICustomerService _customerService;

    public CustomersController(
        Services.ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet("{customerId}")]
    [EndpointName("GetCustomerById")]
    public async Task<ActionResult<Customer>> Get(int customerId)
    {
        var result = await _customerService.GetCustomerAsync(customerId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetAllCustomers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
    {
        var result = await _customerService.GetAllCustomersAsync();
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateCustomer")]
    public async Task<ActionResult<Customer>> Create([FromBody] CreateCustomerRequest request)
    {
        var id = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(Get), new { customerId = id }, new { customerId = id });
    }

    [HttpPut("{customerId}")]
    [EndpointName("UpdateCustomer")]
    public async Task<IActionResult> Update(int customerId, [FromBody] UpdateCustomerRequest request)
    {
        var ok = await _customerService.UpdateCustomerAsync(customerId, request);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{customerId}")]
    [EndpointName("DeleteCustomer")]
    public async Task<IActionResult> Delete(int customerId)
    {
        var ok = await _customerService.DeleteCustomerAsync(customerId);
        return ok ? NoContent() : NotFound();
    }
}
