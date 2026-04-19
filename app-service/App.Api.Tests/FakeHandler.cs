namespace App.Api.Tests.Services;

internal class FakeHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _handler;

    public FakeHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
    {
        _handler = req => Task.FromResult(handler(req));
    }

    public FakeHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> handler)
    {
        _handler = handler;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
        => _handler(request);
}