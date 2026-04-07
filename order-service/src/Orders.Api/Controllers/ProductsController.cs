using Orders.Api.Entities;
using Orders.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Orders.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductsService _productsService;

    public ProductsController(IProductsService productsService)
    {
        _productsService = productsService;
    }

    [HttpGet]
    [EndpointName("GetAllProducts")]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll([FromQuery] string? name = null)
    {
        var result = await _productsService.GetAllProductsAsync(name);
        return Ok(result);
    }
}
