using App.Api.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace App.Api.Services;

public sealed class DownstreamProxyService(
    IHttpClientFactory httpClientFactory,
    IOptions<DownstreamServicesOptions> downstreamServicesOptions) : ControllerBase
{
    private readonly DownstreamServicesOptions _downstreamServicesOptions = downstreamServicesOptions.Value;

    public Task<IActionResult> ForwardToOrderServiceAsync(HttpContext httpContext)
        => ForwardAsync(httpContext, _downstreamServicesOptions.OrderServiceBaseUrl);

    public Task<IActionResult> ForwardToUserServiceAsync(HttpContext httpContext)
        => ForwardAsync(httpContext, _downstreamServicesOptions.UserServiceBaseUrl);

    private async Task<IActionResult> ForwardAsync(HttpContext httpContext, string baseUrl)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = "Downstream service URL is not configured"
            });
        }

        using var downstreamRequest = new HttpRequestMessage(
            new HttpMethod(httpContext.Request.Method),
            BuildUri(baseUrl, httpContext.Request.Path, httpContext.Request.QueryString));

        await AttachBodyAsync(httpContext, downstreamRequest);
        CopyHeaders(httpContext, downstreamRequest);

        var client = httpClientFactory.CreateClient();
        using var downstreamResponse = await client.SendAsync(
            downstreamRequest,
            HttpCompletionOption.ResponseHeadersRead,
            httpContext.RequestAborted);

        httpContext.Response.StatusCode = (int)downstreamResponse.StatusCode;
        CopyResponseHeaders(httpContext, downstreamResponse);

        if (downstreamResponse.StatusCode == System.Net.HttpStatusCode.NoContent)
        {
            return new EmptyResult();
        }

        if (downstreamResponse.Content.Headers.ContentType is not null)
        {
            httpContext.Response.ContentType = downstreamResponse.Content.Headers.ContentType.ToString();
        }

        await downstreamResponse.Content.CopyToAsync(httpContext.Response.Body, httpContext.RequestAborted);
        return new EmptyResult();
    }

    private static Uri BuildUri(string baseUrl, PathString path, QueryString queryString)
    {
        var normalizedBaseUrl = baseUrl.EndsWith('/') ? baseUrl : $"{baseUrl}/";
        var relativePath = $"{path.Value?.TrimStart('/')}{queryString.Value}";
        return new Uri(new Uri(normalizedBaseUrl), relativePath);
    }

    private static async Task AttachBodyAsync(HttpContext httpContext, HttpRequestMessage downstreamRequest)
    {
        if (HttpMethods.IsGet(httpContext.Request.Method)
            || HttpMethods.IsDelete(httpContext.Request.Method)
            || HttpMethods.IsHead(httpContext.Request.Method)
            || HttpMethods.IsTrace(httpContext.Request.Method))
        {
            return;
        }

        httpContext.Request.EnableBuffering();

        await using var memoryStream = new MemoryStream();
        await httpContext.Request.Body.CopyToAsync(memoryStream, httpContext.RequestAborted);
        httpContext.Request.Body.Position = 0;

        if (memoryStream.Length == 0)
        {
            return;
        }

        downstreamRequest.Content = new ByteArrayContent(memoryStream.ToArray());
    }

    private static void CopyHeaders(HttpContext httpContext, HttpRequestMessage downstreamRequest)
    {
        foreach (var header in httpContext.Request.Headers)
        {
            if (string.Equals(header.Key, "Host", StringComparison.OrdinalIgnoreCase)
                || string.Equals(header.Key, "Content-Length", StringComparison.OrdinalIgnoreCase)
                || string.Equals(header.Key, "Origin", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (!downstreamRequest.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()))
            {
                downstreamRequest.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }
    }

    private static void CopyResponseHeaders(HttpContext httpContext, HttpResponseMessage downstreamResponse)
    {
        foreach (var header in downstreamResponse.Headers)
        {
            if (string.Equals(header.Key, "Transfer-Encoding", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            httpContext.Response.Headers[header.Key] = new StringValues(header.Value.ToArray());
        }

        foreach (var header in downstreamResponse.Content.Headers)
        {
            if (string.Equals(header.Key, "Content-Type", StringComparison.OrdinalIgnoreCase)
                || string.Equals(header.Key, "Content-Length", StringComparison.OrdinalIgnoreCase)
                || string.Equals(header.Key, "Transfer-Encoding", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            httpContext.Response.Headers[header.Key] = new StringValues(header.Value.ToArray());
        }
    }
}