
# Orders

React app with dotnet api and postgres database controller by liquibase.

## Quick Start

### Prerequisites

- **Docker** (required for running the full stack with `docker-compose`)
- **Make** (optional, for Makefile shortcuts)
- **.NET SDK** (only if you want to run or develop the API locally, outside Docker)
- **Node.js** (only if you want to run or develop the frontend locally, outside Docker)
- IDE like Visual Studio Code (optional, but recommended)

### Running the Application

To run the full stack (API, DB, frontend, pgAdmin) in Docker:

```sh
docker-compose up
```

Or, using the Makefile:

```sh
make start
```

After startup:

- Swagger UI: <http://localhost:8080/index.html>
- OpenAPI: <http://localhost:8080/openapi/v1.json>
- pgAdmin: <http://localhost:5050/browser/>

See the Makefile and `docker-compose.yaml` for more commands and credentials.

## Project Structure and Conventions

This section summarizes the architecture, workflows, and conventions specific to Orders to help contributors get productive quickly.

### Architecture Overview

- **Monorepo** with three main areas:

  - `api/`: .NET 9 Web API (C#) for business logic and data access
  - `web/`: Vite + React TypeScript frontend
  - `database/`: Liquibase-managed PostgreSQL migrations and seed data

- **Data flow**: Frontend (`web/`) calls backend (`api/Orders.Api/`) via REST endpoints. Backend persists to PostgreSQL, schema managed by Liquibase.
- **Service boundaries**: API logic is organized by domain (e.g., Orders, Customers) with clear separation between Controllers, Entities, and Repositories.

## Developer Workflows

- **Build & Run**:

  - Use `docker-compose up` to start the full stack (API, DB, pgAdmin, frontend)
  - For local API dev: `dotnet run --project api/Orders.Api/Orders.Api.csproj`
  - For frontend dev: `cd web && npm install && npm run dev`

- **Database**:

  - Migrations: `liquibase update` from `database/`
  - Seed data: SQL files in `database/seed/`

- **Testing**:

  - API: `dotnet test api/Orders.Api.Tests/Orders.Api.Tests.csproj`
  - Frontend: `cd web && npm test` (see `web/pages/Sample.test.ts`)

## Project Conventions & Patterns

- **API**:

  - Controllers in `api/Orders.Api/Controllers/` (e.g., `OrdersController.cs`)
  - Entities in `api/Orders.Api/Entities/` map to DB tables; mapping in `Entities/Mappings/`
  - Repositories in `api/Orders.Api/Repositories/` abstract DB access
  - Use dependency injection for services and repositories

- **Frontend**:

  - API calls via `web/src/api/services/` (e.g., `OrdersService.ts`)
  - Models in `web/src/api/models/` mirror backend entities
  - Pages in `web/src/pages/` (e.g., `OrderList.tsx`)

- **Database**:

  - All schema changes via Liquibase YAML/SQL in `database/`
  - Init scripts in `database/init/`, seed data in `database/seed/`

## Integration Points

- **pgAdmin**: Config in `pgadmin/servers.json` for DB admin
- **Docker**: Compose file at root for orchestrating services
- **API/Frontend**: OpenAPI/Swagger for API docs (if enabled)

## Examples

- To add a new order endpoint:

 1. Add method to `OrdersController.cs`
 2. Update `OrderRepository.cs` and `Entities/Order.cs` as needed
 3. Add frontend call in `OrdersService.ts` and UI in `OrderList.tsx` or `OrderDetails.tsx`

## References

- See `README.md` in root and in `api/` and `web/` for more details
- Key files: `docker-compose.yaml`, `api/Orders.Api/Controllers/`, `web/src/api/services/`, `database/changelog.yaml`
