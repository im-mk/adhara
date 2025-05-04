using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrdersRepository _ordersRepository;

    public OrdersController(
        IOrdersRepository ordersRepository)
    {
        _ordersRepository = ordersRepository;
    }

    [HttpGet("{orderId}")]
    [EndpointName("GetOrderById")]
    public async Task<ActionResult<Order>> Get(int orderId)
    {
        var result = await _ordersRepository.Get(orderId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetAll")]
    public async Task<ActionResult<IEnumerable<Order>>> GetAll([FromQuery]DateOnly startDate, [FromQuery]DateOnly endDate)    
    {
        var result = await _ordersRepository.GetAll(startDate, endDate);
        return Ok(result);
    }
}
