using Orders.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Orders.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController(
    Services.IOrderService orderService,
    ILogger<OrdersController> logger) : ControllerBase
{
    [HttpGet("{orderId}")]
    [EndpointName("GetOrderById")]
    public async Task<ActionResult<OrderDetailsResponse>> Get(int orderId)
    {
        var result = await orderService.GetOrder(orderId);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet]
    [EndpointName("GetList")]
    public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetList([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
    {
        logger.LogInformation("Getting all orders between {StartDate} and {EndDate}", startDate, endDate);
        var result = await orderService.GetList(startDate, endDate);
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateOrder")]
    public async Task<ActionResult<OrderCreatedResponse>> Create([FromBody] CreateOrderRequest request)
    {
        logger.LogInformation("Creating a new order");
        var result = await orderService.CreateOrder(request);
        return CreatedAtAction(nameof(Get), new { orderId = result.OrderId }, result);
    }

    [HttpPut("{orderId}")]
    [EndpointName("UpdateOrder")]
    public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderRequest request)
    {
        var ok = await orderService.UpdateOrder(orderId, request);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{orderId}")]
    [EndpointName("DeleteOrder")]
    public async Task<IActionResult> Delete(int orderId)
    {
        var ok = await orderService.DeleteOrder(orderId);
        return ok ? NoContent() : NotFound();
    }
}
