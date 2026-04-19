namespace App.Api.Services;

public interface IDownstreamProxyService
{
    Task<Microsoft.AspNetCore.Mvc.IActionResult> ForwardToOrderServiceAsync(Microsoft.AspNetCore.Http.HttpContext httpContext);
    Task<Microsoft.AspNetCore.Mvc.IActionResult> ForwardToUserServiceAsync(Microsoft.AspNetCore.Http.HttpContext httpContext);
}
