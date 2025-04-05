.PHONY: test-api build-api start stop

build-api:
	cd api && dotnet build

test-api: build-api
	cd api && dotnet test

start: test-api
	docker compose up -d --build

stop:	
	docker compose stop