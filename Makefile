.PHONY: start-db build-api test-api start-api newman-test build-web test-web start stop

start-pgadmin:
	docker compose up -d pgadmin

# Order Service
start-db:
	docker compose up -d db pgadmin liquibase

test-api:
	docker build -f order-service/Orders.Api/Dockerfile --target test -t order-service-test ./order-service
	docker run --rm order-service-test

start-api: test-api start-db
	docker compose up -d order-service

newman-test:
	docker compose run --rm newman

# User Service

start-user-db:
	docker compose up -d user-service-db user-service-liquibase

test-user-api:
	docker build -f user-service/Dockerfile --target test -t user-service-test ./user-service
	docker run --rm user-service-test

start-user-api: test-user-api start-user-db
	docker compose up -d user-service

# Web Application
build-web:
	docker build -f web/Dockerfile --target build -t adhara-web-build ./web

test-web:
	docker build -f web/Dockerfile --target test -t adhara-web-test ./web
	docker run --rm adhara-web-test

# All Services
start: start-api start-user-api
	docker compose up -d --build

stop:
	docker compose stop

clean:
	docker compose down -v
	docker rmi order-service-build order-service-test adhara-web-build adhara-web-test || true