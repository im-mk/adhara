.PHONY: start-db start-api start stop

start-db:
	docker compose up -d --build db pgadmin liquibase

start-api: start-db
	docker compose up -d api

start: 
	docker compose up -d

stop:
	docker compose stop

clean: 
	docker compose down