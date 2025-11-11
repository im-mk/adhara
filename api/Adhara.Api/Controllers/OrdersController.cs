using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    private readonly Services.IOrderService _orderService;

    public OrdersController(
        Services.IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("{orderId}")]
    [EndpointName("GetOrderById")]
    public async Task<ActionResult<Order>> Get(int orderId)
    {
        var result = await _orderService.GetOrderAsync(orderId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetAll")]
    public async Task<ActionResult<IEnumerable<Order>>> GetAll([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        var result = await _orderService.GetAllOrdersAsync(startDate, endDate);
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateOrder")]
    public async Task<ActionResult<Order>> Create([FromBody] CreateOrderRequest request)
    {
        var created = await _orderService.CreateOrderAsync(request);
        return CreatedAtAction(nameof(Get), new { orderId = created.Id }, created);
    }

    [HttpPut("{orderId}")]
    [EndpointName("UpdateOrder")]
    public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderRequest request)
    {
        var ok = await _orderService.UpdateOrderAsync(orderId, request);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{orderId}")]
    [EndpointName("DeleteOrder")]
    public async Task<IActionResult> Delete(int orderId)
    {
        var ok = await _orderService.DeleteOrderAsync(orderId);
        return ok ? NoContent() : NotFound();
    }


}
