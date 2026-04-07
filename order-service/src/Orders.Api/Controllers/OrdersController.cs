using Orders.Api.Models;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetList([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate, [FromQuery] int? customerId, [FromQuery] string? orderNumber, [FromQuery] int? orderStatusId, [FromQuery] int? page, [FromQuery] int? pageSize)
    {
        if (page is <= 0 || pageSize is <= 0)
        {
            return BadRequest("page and pageSize must be greater than 0");
        }

        if (customerId is <= 0)
        {
            return BadRequest("customerId must be greater than 0");
        }

        if (page.HasValue ^ pageSize.HasValue)
        {
            return BadRequest("page and pageSize must be provided together");
        }

        if (page.HasValue && pageSize.HasValue)
        {
            logger.LogInformation(
                "Getting paged orders between {StartDate} and {EndDate}, customer {CustomerId}, page {Page}, page size {PageSize}",
                startDate,
                endDate,
                customerId,
                page,
                pageSize);

            var (orders, totalCount) = await orderService.GetListPaged(startDate, endDate, page.Value, pageSize.Value, customerId, orderNumber, orderStatusId);
            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            Response.Headers.Append("X-Page", page.Value.ToString());
            Response.Headers.Append("X-Page-Size", pageSize.Value.ToString());
            return Ok(orders);
        }

        logger.LogInformation("Getting all orders between {StartDate} and {EndDate} for customer {CustomerId}", startDate, endDate, customerId);
        var result = await orderService.GetList(startDate, endDate, customerId, orderNumber, orderStatusId);
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
