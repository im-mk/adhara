using System.Data;
using Adhara.Api.Middleware;
using Adhara.Api.Repositories;
using Adhara.Api.Services;
using Npgsql;
using Serilog;
using ZiggyCreatures.Caching.Fusion;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog early so it captures startup logs
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();

AddOpenApi(builder);
AddDependencies(builder);
AddFusionCache(builder);

builder.Services.AddHealthChecks();
AddCors(builder);

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}
app.MapHealthChecks("/health");

// app.UseHttpsRedirection();

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
    builder.Services.AddScoped<ICountriesRepository, CountriesRepository>();
    builder.Services.AddScoped<ICustomersRepository, CustomersRepository>();
    builder.Services.AddScoped<IAddressesRepository, AddressesRepository>();
    builder.Services.AddScoped<IProductRepository, ProductRepository>();
    builder.Services.AddScoped<IOutboxRepository, OutboxRepository>();
    builder.Services.AddScoped<ICustomerAddressesRepository, CustomerAddressesRepository>();

    builder.Services.AddScoped<IOrderService, OrderService>();
    builder.Services.AddScoped<ICountriesService, CountriesService>();
    builder.Services.AddScoped<ICustomerService, CustomerService>();
}

static void AddOpenApi(WebApplicationBuilder builder)
{
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
            document.Servers =
            [
                new Microsoft.OpenApi.OpenApiServer
            {
                Url = "http://localhost:8080",
                Description = "Adhara API- Localhost"
            },
        ];
            return Task.CompletedTask;
        });
    });
}

static void AddFusionCache(WebApplicationBuilder builder)
{
    builder.Services.AddFusionCache()
        .WithDefaultEntryOptions(new FusionCacheEntryOptions
        {
            Duration = TimeSpan.FromDays(1)
        });
}

static void AddCors(WebApplicationBuilder builder)
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:8090")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });
}