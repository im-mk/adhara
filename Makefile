.PHONY: start-db build-api test-api start-api newman-test build-web test-web start stop create-keys

create-keys:
	mkdir -p user-service/src/.keys	
	openssl genrsa -out user-service/src/.keys/private.pem 2048
	openssl rsa -in user-service/src/.keys/private.pem -pubout -out user-service/src/.keys/public.pem

start-pgadmin:
	docker compose up -d pgadmin

# Order Service
start-db:
	docker compose up -d db liquibase

test-api:
	docker build -f order-service/src/Orders.Api/Dockerfile --target test -t order-service-test ./order-service/src
	docker run --rm order-service-test

build-api:
	docker compose build order-service

start-api: test-api build-api start-db
	docker compose up -d order-service

newman-test:
	docker compose run --rm newman

# User Service
start-user-db:
	docker compose up -d user-service-db user-service-liquibase

test-user-api:
	docker build -f user-service/src/Dockerfile --target test -t user-service-test ./user-service/src
	docker run --rm user-service-test

build-user-api:
	docker compose build user-service

start-user-api: create-keys test-user-api build-user-api start-user-db
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