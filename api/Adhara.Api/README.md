# Containerized Build & Test

You can build and test the API entirely in containers (no .NET SDK required locally):

Build the API in a container:

```sh
make api-build-container
```

Run API tests in a container:

```sh
make api-test-container
```

You can still use local commands for faster development if you have the .NET SDK installed:

```sh
cd api && dotnet build
cd api && dotnet test
```
# Adhara Api

Dotnet api and postgres database controller by liquibase.

Dapper.FluentMap: Used this library to fluently map properties of the domain classes to the database columns.

To start the api just run

```make start-api```

Check Makefile for all available commands

## URLs

SWagger UI URL: <http://localhost:8080/index.html>

Open ApI URL: <http://localhost:8080/openapi/v1.json>

Pgadmin URL: <http://localhost:5050/browser/>

Checkout docker-compose file for credentails.
