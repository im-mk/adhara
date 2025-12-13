## Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

## Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Orders.Api/Orders.Api.csproj", "Orders.Api/"]
COPY ["Orders.Api.Tests/Orders.Api.Tests.csproj", "Orders.Api.Tests/"]
RUN dotnet restore "Orders.Api/Orders.Api.csproj"

COPY . .
RUN dotnet build "Orders.Api/Orders.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

## Test
FROM build AS test
RUN dotnet test "Orders.Api.Tests/Orders.Api.Tests.csproj" \
    --logger "trx;LogFileName=test-results.trx" \
    --results-directory /app/test-results

## Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Orders.Api/Orders.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

## Final runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orders.Api.dll"]
