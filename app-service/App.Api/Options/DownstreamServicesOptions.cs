namespace App.Api.Options;

public sealed class DownstreamServicesOptions
{
    public const string SectionName = "DownstreamServices";

    public string OrderServiceBaseUrl { get; set; } = "http://localhost:8080";

    public string UserServiceBaseUrl { get; set; } = "http://localhost:8040";
}