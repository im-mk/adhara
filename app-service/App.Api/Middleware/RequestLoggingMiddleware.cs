namespace App.Api.Middleware;

public sealed class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    private const string RequestIdHeader = "X-Request-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = context.Request.Headers[RequestIdHeader].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(requestId))
        {
            requestId = Guid.NewGuid().ToString("N");
            context.Request.Headers[RequestIdHeader] = requestId;
        }

        context.TraceIdentifier = requestId;
        context.Response.Headers[RequestIdHeader] = requestId;

        var startedAt = DateTimeOffset.UtcNow;

        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
        }))
        {
            await next(context);

            if (context.Request.Path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var elapsedMs = (DateTimeOffset.UtcNow - startedAt).TotalMilliseconds;
            logger.LogInformation(
                "Request {Method} {Path} completed {StatusCode} in {ElapsedMs:0.0} ms (requestId={RequestId})",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                elapsedMs,
                requestId);
        }
    }
}
