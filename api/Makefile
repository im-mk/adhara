.PHONY: build test testc start stop

build:
	dotnet build Adhara.Api/Adhara.Api.csproj

test: build
	dotnet test Adhara.Api.Tests/Adhara.Api.Tests.csproj

# build and test in a container
testc:
	docker build -f Adhara.Api/Dockerfile --target build -t adhara-api-build .
	docker build -f Adhara.Api/Dockerfile --target test -t adhara-api-test .
	docker run --rm adhara-api-test

start: test
	cd Adhara.Api && dotnet run