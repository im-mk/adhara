using System.Data;
using Npgsql;
using Adhara.Api.Repositories;
using Adhara.Api.Middleware;
using Dapper.FluentMap;
using Adhara.Api.Entities.Mappings;
using Adhara.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "Adhara Service",
            Version = "v1",
            Description = "Adhara API - Manage orders.",
        };
        document.Servers.Clear();
        document.Servers.Add(new Microsoft.OpenApi.Models.OpenApiServer
        {
            Url = "http://localhost:8080",
            Description = "Adhara API- Localhost"
        });
        return Task.CompletedTask;
    });
});

AddDependencies(builder);

builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8090")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

FluentMapper.Initialize(config =>
{
    config.AddMap(new OrderMap());
    config.AddMap(new CustomerMap());
    config.AddMap(new AddressMap());
    config.AddMap(new OrderLineMap());
    config.AddMap(new OrderStatusMap());
    config.AddMap(new ProductMap());
    config.AddMap(new CustomerAddressMap());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
        options.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}
app.MapHealthChecks("/health");

// app.UseHttpsRedirection();

// Global exception handler middleware (returns 500 JSON on unhandled exceptions)
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.UseCors();

app.MapControllers();

app.Run();

static void AddDependencies(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<IDbConnection>(sp =>
    {
        var conn = new NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"));
        conn.Open();
        return conn;
    });

    builder.Services.AddScoped<IOrdersRepository, OrdersRepository>();
    builder.Services.AddScoped<IOrderLinesRepository, OrderLinesRepository>();
    builder.Services.AddScoped<IOrderService, OrderService>();
    builder.Services.AddScoped<ICountriesService, CountriesService>();
    builder.Services.AddScoped<ICountriesRepository, CountriesRepository>();
    builder.Services.AddScoped<ICustomersRepository, CustomersRepository>();
    builder.Services.AddScoped<IAddressesRepository, AddressesRepository>();
    builder.Services.AddScoped<ICustomerAddressesRepository, CustomerAddressesRepository>();
    builder.Services.AddScoped<ICustomerService, CustomerService>();
}