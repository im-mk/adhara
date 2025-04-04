using System.Data;
using Npgsql;
using Adhara.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "Order Service",
            Version = "v1",
            Description = "API to manage orders.",
        };
        document.Servers.Clear();
        return Task.CompletedTask;
    });
});

builder.Services.AddSingleton<IDbConnection>((sp) =>
    new NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IOrdersRepository, OrdersRepository>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React app origin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}

// app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors();

app.MapControllers();

app.Run();
