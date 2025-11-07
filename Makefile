.PHONY: start-db build-api test-api start-api newman-test build-web test-web start stop

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

build-web:
	docker build -f web/Dockerfile --target build -t adhara-web-build ./web

test-web:
	docker build -f web/Dockerfile --target test -t adhara-web-test ./web
	docker run --rm adhara-web-test

start: start-db test-web test-api build-web build-api
	docker compose up -d --build

stop:
	docker compose stop