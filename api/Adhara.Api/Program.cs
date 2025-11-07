using System.Data;
using Npgsql;
using Adhara.Api.Repositories;
using Dapper.FluentMap;
using Adhara.Api.Entities.Mappings;

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

builder.Services.AddSingleton<IDbConnection>((sp) =>
    new NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IOrdersRepository, OrdersRepository>();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8090") // React app origin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

FluentMapper.Initialize(config =>
{
    config.AddMap(new OrderMap());
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

app.UseAuthorization();

app.UseCors();

app.MapControllers();

app.Run();
