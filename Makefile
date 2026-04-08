.PHONY: start-keys start-user-db test-user-api build-user-api start-user-api newman-test start-app-service build-app-service test-app-service build-web test-web e2e-install e2e-smoke e2e-journeys e2e-all e2e-smoke-docker e2e-journeys-docker e2e-all-docker start stop clean clean-all pgadmin start-dev

create-keys:
	mkdir -p user-service/src/.keys	
	openssl genrsa -out user-service/src/.keys/private.pem 2048
	openssl rsa -in user-service/src/.keys/private.pem -pubout -out user-service/src/.keys/public.pem

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

# Order Service
start-order-db:
	docker compose up -d order-service-db order-service-liquibase

test-order-api:
	docker build -f order-service/src/Orders.Api/Dockerfile --target test -t order-service-test ./order-service/src
	docker run --rm order-service-test

build-order-api:
	docker compose build order-service

start-order-api: test-order-api build-order-api start-order-db
	docker compose up -d order-service

# App Service
test-app-service:
	docker build -f app-service/App.Api/Dockerfile --target test -t app-service-test ./app-service
	docker run --rm app-service-test

build-app-service:
	docker compose build app-service

start-app-service: test-app-service build-app-service
	docker compose up -d app-service

# Web Application
build-web:
	docker build -f web/Dockerfile --target build -t adhara-web-build ./web

test-web:
	docker build -f web/Dockerfile --target test -t adhara-web-test ./web
	docker run --rm adhara-web-test

# E2E Tests
e2e-smoke:
	docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:smoke" e2e-tests

e2e-journeys:
	docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:journeys" e2e-tests

e2e-all:
	docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:e2e" e2e-tests

# All Services
start:
	docker compose up -d --build

start-dev: start-user-api start-order-api start-app-service


stop:
	docker compose stop

clean:
	docker compose down -v --remove-orphans

newman-test:
	docker compose run --rm newman

pgadmin:
	docker compose up -d pgadmin