using Microsoft.AspNetCore.Mvc;
using Adhara.Api.Repositories;

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
    public async Task<IActionResult> Get(int orderId)
    {
        var result = await _ordersRepository.Get(orderId);
        return result != null ? Ok(result) : NotFound();
    }
}
