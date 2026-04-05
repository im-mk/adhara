using App.Api.Options;
using App.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddHttpClient();
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection(CorsOptions.SectionName));
builder.Services.Configure<DownstreamServicesOptions>(builder.Configuration.GetSection(DownstreamServicesOptions.SectionName));
builder.Services.AddScoped<DownstreamProxyService>();
var issuerUrl = builder.Configuration["Auth:IssuerUrl"];
var jwksBaseUrl = builder.Configuration["Auth:JwksBaseUrl"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuerUrl,
            ValidateAudience = true,
            ValidAudience = "default-audience",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,

            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                var client = new HttpClient();
                var jwks = client.GetStringAsync($"{jwksBaseUrl}/.well-known/jwks.json").Result;
                return new JsonWebKeySet(jwks).Keys;
            }
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT FAILED: {context.Exception}");
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    var allowedOrigin = builder.Configuration[$"{CorsOptions.SectionName}:{nameof(CorsOptions.AllowedOrigin)}"]
        ?? "http://localhost:8090";

    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
