.PHONY: build test start stop

build:
	dotnet build App.Api/App.Api.csproj

test: build
	dotnet test App.Api.Tests/App.Api.Tests.csproj

start: test
	cd App.Api && dotnet run

stop:
	@echo "Stop the local API with Ctrl+C. To stop containerized services, run 'make stop' at the repo root."

