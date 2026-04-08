# Adhara Playwright E2E

This project contains Playwright integration/E2E tests for Adhara.

## Test suites

- `smoke`: fast checks that pages/routes load correctly
- `journeys`: user-flow tests for critical behaviors

## Setup

1. Start the stack from repo root:

```sh
docker compose up -d --build
```

2. Copy and adjust environment values:

```sh
cp e2e-tests/.env.e2e.example e2e-tests/.env.e2e
```

3. Install dependencies and browsers:

```sh
cd e2e-tests
npm install
npm run install:browsers
```

## Running tests

```sh
npm run test:smoke
npm run test:journeys
npm run test:e2e
```

## Run in Docker Compose

You can run Playwright inside a container on the same compose network:

```sh
# from repo root
make e2e-smoke-docker
make e2e-journeys-docker
make e2e-all-docker
```

Equivalent direct compose commands:

```sh
docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:smoke" e2e-tests
docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:journeys" e2e-tests
docker compose --profile test run --rm -e PW_TEST_CMD="npm run test:e2e" e2e-tests
```

Notes:

- The e2e container uses internal service URLs (`web`, `app-service`, `user-service`) automatically.
- A named volume is used for `node_modules` in the test container.

## Environment

Important variables in `.env.e2e`:

- `E2E_BASE_URL` web app URL (default `http://127.0.0.1:8090`)
- `E2E_APP_API_URL` BFF/API URL (default `http://127.0.0.1:8020`)
- `E2E_USER_SERVICE_URL` user service URL for bootstrap (default `http://127.0.0.1:8040`)
- `E2E_USERNAME` / `E2E_PASSWORD` login credentials used by tests
- `E2E_BOOTSTRAP` when `true`, global setup calls `/bootstrap` to create the first user when possible

## Notes

- If your DB volume already has users, `/bootstrap` might not create a new user. In that case, set `.env.e2e` credentials to an existing account.
- Smoke is intended for PR/quick checks; journeys are intended for deeper validation.
