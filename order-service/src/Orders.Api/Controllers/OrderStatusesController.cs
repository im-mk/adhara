using Orders.Api.Entities;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Orders.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OrderStatusesController(IOrderStatusesService orderStatusesService) : ControllerBase
{
    [HttpGet]
    [EndpointName("GetAllOrderStatuses")]
    public async Task<ActionResult<IEnumerable<OrderStatus>>> GetAll()
    {
        var result = await orderStatusesService.GetAllAsync();
        return Ok(result);
    }
}
