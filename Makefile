.PHONY: test-api build-api test-api start-db start-api build-web test-web start stop

build-api:
	cd api && dotnet build

test-api: build-api
	cd api && dotnet test

start-db:
	docker compose up -d --build db pgadmin liquibase

start-api: test-api
	docker compose up -d --build db pgadmin liquibase api

build-web:
	cd web && npm install && npm run build

test-web: build-web
	cd web && npm run test

start: test-api test-web
	docker compose up -d --build

stop:	
	docker compose stop