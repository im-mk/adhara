using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;
using Adhara.Api.Models;

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
    public async Task<ActionResult<IEnumerable<Order>>> GetAll([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        var result = await _ordersRepository.GetAll(startDate, endDate);
        return Ok(result);
    }

    [HttpPost]
    [EndpointName("CreateOrder")]
    public async Task<ActionResult<Order>> Create([FromBody] CreateOrderRequest request)
    {
        var order = new Order
        {
            OrderNumber = request.OrderNumber,
            OrderDate = request.OrderDate,
            OrderStatusId = request.OrderStatusId,
            TotalAmount = request.TotalAmount,
            CustomerId = request.CustomerId
        };

        var id = await _ordersRepository.Insert(order);
        if (id == null)
        {
            return BadRequest();
        }

        order.Id = id.Value;

        return CreatedAtAction(nameof(Get), new { orderId = order.Id }, order);
    }

    [HttpPut("{orderId}")]
    [EndpointName("UpdateOrder")]
    public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderRequest request)
    {
        var existingOrder = await _ordersRepository.Get(orderId);
        if (existingOrder == null)
        {
            return NotFound();
        }

        existingOrder.OrderStatusId = request.OrderStatusId;
        existingOrder.TotalAmount = request.TotalAmount;

        var rows = await _ordersRepository.Update(existingOrder);
        return rows == 1 ? NoContent() : NotFound();
    }

    [HttpDelete("{orderId}")]
    [EndpointName("DeleteOrder")]
    public async Task<IActionResult> Delete(int orderId)
    {
        var rows = await _ordersRepository.Delete(orderId);
        return rows == 1 ? NoContent() : NotFound();
    }
}
