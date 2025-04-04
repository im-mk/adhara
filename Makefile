test:
	cd api && dotnet test

build:
	cd api && dotnet build && dotnet test

start:
	make test && docker compose up -d --build

stop:	
	docker compose stop