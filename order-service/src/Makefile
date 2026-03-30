.PHONY: build test start stop

build:
	dotnet build Orders.Api/Orders.Api.csproj

test: build
	dotnet test Orders.Api.Tests/Orders.Api.Tests.csproj

start: test
	cd Orders.Api && dotnet run

stop:
	@echo "Stop the local API with Ctrl+C. To stop containerized services, run 'make stop' at the repo root."

