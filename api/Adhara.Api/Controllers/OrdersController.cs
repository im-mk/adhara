using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;
using Adhara.Api.Models;

namespace Adhara.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController(
    Services.IOrderService orderService,
    ILogger<OrdersController> logger) : ControllerBase
{
    [HttpGet("{orderId}")]
    [EndpointName("GetOrderById")]
    public async Task<ActionResult<Order>> Get(int orderId)
    {
        var result = await orderService.GetOrderAsync(orderId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetAll")]
    public async Task<ActionResult<IEnumerable<Order>>> GetAll([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        logger.LogInformation("Getting all orders between {StartDate} and {EndDate}", startDate, endDate);
        var result = await orderService.GetAllOrdersAsync(startDate, endDate);
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateOrder")]
    public async Task<ActionResult<Order>> Create([FromBody] CreateOrderRequest request)
    {
        logger.LogInformation("Creating a new order");
        var created = await orderService.CreateOrderAsync(request);
        return CreatedAtAction(nameof(Get), new { orderId = created.Id }, created);
    }

    [HttpPut("{orderId}")]
    [EndpointName("UpdateOrder")]
    public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderRequest request)
    {
        var ok = await orderService.UpdateOrderAsync(orderId, request);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{orderId}")]
    [EndpointName("DeleteOrder")]
    public async Task<IActionResult> Delete(int orderId)
    {
        var ok = await orderService.DeleteOrderAsync(orderId);
        return ok ? NoContent() : NotFound();
    }
}
