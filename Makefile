.PHONY: test-api build-api start stop

build-api:
	cd api && dotnet build

test-api: build-api
	cd api && dotnet test

start: test-api
	docker compose up -d --build

start-db:
	docker compose up -d --build db pgadmin liquibase

stop:	
	docker compose stop