using App.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Api.Controllers;

[ApiController]
public sealed class BffProxyController(DownstreamProxyService downstreamProxyService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public Task<IActionResult> Login()
        => downstreamProxyService.ForwardToUserServiceAsync(HttpContext);

    [AllowAnonymous]
    [HttpPost("refresh")]
    public Task<IActionResult> Refresh()
        => downstreamProxyService.ForwardToUserServiceAsync(HttpContext);

    [Authorize]
    [AcceptVerbs("GET")]
    [Route("Countries")]
    public Task<IActionResult> Countries()
        => downstreamProxyService.ForwardToOrderServiceAsync(HttpContext);

    [Authorize]
    [AcceptVerbs("GET", "POST", "PUT", "DELETE")]
    [Route("Customers")]
    [Route("Customers/{*path}")]
    public Task<IActionResult> Customers()
        => downstreamProxyService.ForwardToUserServiceAsync(HttpContext);

    [Authorize]
    [AcceptVerbs("GET", "POST", "PUT", "DELETE")]
    [Route("Orders")]
    [Route("Orders/{*path}")]
    public Task<IActionResult> Orders()
        => downstreamProxyService.ForwardToOrderServiceAsync(HttpContext);
}