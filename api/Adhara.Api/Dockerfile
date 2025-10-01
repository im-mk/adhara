## Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

## Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Adhara.Api/Adhara.Api.csproj", "Adhara.Api/"]
COPY ["Adhara.Api.Tests/Adhara.Api.Tests.csproj", "Adhara.Api.Tests/"]
RUN dotnet restore "Adhara.Api/Adhara.Api.csproj"

COPY . .
RUN dotnet build "Adhara.Api/Adhara.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

## Test
FROM build AS test
RUN dotnet test "Adhara.Api.Tests/Adhara.Api.Tests.csproj" \
    --logger "trx;LogFileName=test-results.trx" \
    --results-directory /app/test-results

## Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Adhara.Api/Adhara.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

## Final runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Adhara.Api.dll"]
