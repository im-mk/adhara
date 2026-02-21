using System.Data;
using Orders.Api.Middleware;
using Orders.Api.Repositories;
using Orders.Api.Services;
using Npgsql;
using Serilog;
using ZiggyCreatures.Caching.Fusion;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Orders API",
        Version = "v1"
    });
});

SetupDb(builder);
AddDomainDependencies(builder);
AddFusionCache(builder);

builder.Services.AddHealthChecks();
AddCors(builder);

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var key = builder.Configuration["Jwt:Key"];
var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key!.PadRight((512 / 8), '\0')));
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = securityKey,
            ValidateIssuer = true,
            ValidIssuer = "https://auth.adhara.internal",
            ValidateAudience = true,
            ValidAudience = "orders-api",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "swagger/{documentName}/swagger.json";
    });
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Orders API v1"
        );

        options.RoutePrefix = "swagger";
    });
}
app.MapHealthChecks("/health");

// app.UseHttpsRedirection();

app.UseMiddleware<ExceptionMiddleware>();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors();

app.MapControllers();

app.Run();

static void SetupDb(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<IDbConnection>(sp =>
    {
        var conn = new NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"));
        conn.Open();
        return conn;
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

static void AddDomainDependencies(WebApplicationBuilder builder)
{
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