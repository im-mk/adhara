.PHONY: build test start stop

build:
	dotnet build Adhara.Api/Adhara.Api.csproj

test: build
	dotnet test Adhara.Api.Tests/Adhara.Api.Tests.csproj

start: test
	cd Adhara.Api && dotnet run

stop:
	@echo "Stop the local API with Ctrl+C. To stop containerized services, run 'make stop' at the repo root."
