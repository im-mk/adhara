.PHONY: start-db build-api test-api start-api newman-test build-web test-web start stop

start-pgadmin:
	docker compose up -d pgadmin

# Order Service
start-db:
	docker compose up -d --build db pgadmin liquibase

build-api:
	docker build -f api/Adhara.Api/Dockerfile --target build -t adhara-api-build ./api

test-api:
	docker build -f api/Adhara.Api/Dockerfile --target test -t adhara-api-test ./api
	docker run --rm adhara-api-test

start-api: test-api build-api
	docker compose up -d --build db pgadmin liquibase api

newman-test:
	docker compose run --rm newman

# User Service

start-user-db:
	docker compose up -d --build user-service-db user-service-liquibase

build-user-api:
	docker build -f user-service/Dockerfile --target build -t user-service ./user-service

# test-user-api:
# 	docker build -f user-service/Dockerfile --target test -t user-service-test ./user-service
# 	docker run --rm user-service-test

# start-user-api: test-user-api build-user-api
start-user-api: build-user-api
	docker compose up -d --build user-service-db user-service-liquibase user-service

# Web Application
build-web:
	docker build -f web/Dockerfile --target build -t adhara-web-build ./web

test-web:
	docker build -f web/Dockerfile --target test -t adhara-web-test ./web
	docker run --rm adhara-web-test

# All Services
start: start-db test-web test-api build-web build-api start-user-api
	docker compose up -d --build

stop:
	docker compose stop

clean:
	docker compose down -v
	docker rmi adhara-api-build adhara-api-test adhara-web-build adhara-web-test || true