using System.Net;
using System.Text;
using App.Api.Options;
using App.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;

namespace App.Api.Tests.Services;

public class DownstreamProxyServiceTests
{
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly Mock<IOptions<DownstreamServicesOptions>> _mockOptions;

    public DownstreamProxyServiceTests()
    {
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();
        _mockOptions = new Mock<IOptions<DownstreamServicesOptions>>();
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_EmptyUrl_ReturnsInternalServerError()
    {
        var service = CreateService(orderUrl: "");

        var context = CreateHttpContext("GET", "/api/test");

        var result = await service.ForwardToOrderServiceAsync(context);

        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, statusResult.StatusCode);
    }

    [Fact]
    public async Task ForwardToUserServiceAsync_NullUrl_ReturnsInternalServerError()
    {
        var service = CreateService(userUrl: null);

        var context = CreateHttpContext("GET", "/api/test");

        var result = await service.ForwardToUserServiceAsync(context);

        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, statusResult.StatusCode);
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_ForwardsRequest_WithCorrectMethodAndUrl()
    {
        HttpRequestMessage? capturedRequest = null;

        var handler = new FakeHandler(req =>
        {
            capturedRequest = req;
            return new HttpResponseMessage(HttpStatusCode.OK);
        });

        var service = CreateService(handler);

        var context = CreateHttpContext("GET", "/orders/1", "?a=1");

        await service.ForwardToOrderServiceAsync(context);

        Assert.NotNull(capturedRequest);
        Assert.Equal(HttpMethod.Get, capturedRequest!.Method);
        Assert.Equal("http://orders/orders/1?a=1", capturedRequest.RequestUri!.ToString());
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_ForwardsRequestBody_ForPost()
    {
        byte[]? capturedBody = null;

        var handler = new FakeHandler(async req =>
        {
            capturedBody = await req.Content!.ReadAsByteArrayAsync();
            return new HttpResponseMessage(HttpStatusCode.OK);
        });

        var service = CreateService(handler);

        var context = CreateHttpContext("POST", "/orders", "", "{ \"x\": 1 }");

        await service.ForwardToOrderServiceAsync(context);

        Assert.NotNull(capturedBody);
        var body = Encoding.UTF8.GetString(capturedBody!);
        Assert.Contains("\"x\": 1", body);
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_CopiesResponseStatusAndBody()
    {
        var handler = new FakeHandler(_ =>
        {
            var response = new HttpResponseMessage(HttpStatusCode.Accepted)
            {
                Content = new StringContent("hello world")
            };
            return response;
        });

        var service = CreateService(handler);

        var context = CreateHttpContext("GET", "/test");

        await service.ForwardToOrderServiceAsync(context);

        Assert.Equal(202, context.Response.StatusCode);

        context.Response.Body.Position = 0;
        var body = new StreamReader(context.Response.Body).ReadToEnd();

        Assert.Equal("hello world", body);
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_NoContent_ReturnsEmptyResult()
    {
        var handler = new FakeHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.NoContent));

        var service = CreateService(handler);

        var context = CreateHttpContext("GET", "/test");

        var result = await service.ForwardToOrderServiceAsync(context);

        Assert.IsType<EmptyResult>(result);
        Assert.Equal(204, context.Response.StatusCode);
    }

    [Fact]
    public async Task ForwardToOrderServiceAsync_CopiesHeaders()
    {
        var handler = new FakeHandler(req =>
        {
            Assert.True(req.Headers.Contains("X-Test"));

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Headers.Add("X-Response", "123");

            return response;
        });

        var service = CreateService(handler);

        var context = CreateHttpContext("GET", "/test");
        context.Request.Headers["X-Test"] = "abc";

        await service.ForwardToOrderServiceAsync(context);

        Assert.Equal("123", context.Response.Headers["X-Response"]);
    }

    private DownstreamProxyService CreateService(
        HttpMessageHandler? handler = null,
        string? orderUrl = "http://orders",
        string? userUrl = "http://users")
    {
        var options = new DownstreamServicesOptions
        {
            OrderServiceBaseUrl = orderUrl!,
            UserServiceBaseUrl = userUrl!
        };

        _mockOptions.Setup(o => o.Value).Returns(options);

        var client = handler == null
            ? new HttpClient(new FakeHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)))
            : new HttpClient(handler);

        _mockHttpClientFactory
            .Setup(f => f.CreateClient(It.IsAny<string>()))
            .Returns(client);

        return new DownstreamProxyService(_mockHttpClientFactory.Object, _mockOptions.Object);
    }

    private static DefaultHttpContext CreateHttpContext(
        string method,
        string path,
        string query = "",
        string? body = null)
    {
        var context = new DefaultHttpContext();

        context.Request.Method = method;
        context.Request.Path = path;
        context.Request.QueryString = new QueryString(query);

        if (body != null)
        {
            var bytes = Encoding.UTF8.GetBytes(body);
            context.Request.Body = new MemoryStream(bytes);
            context.Request.ContentLength = bytes.Length;
        }

        context.Response.Body = new MemoryStream();

        return context;
    }
}