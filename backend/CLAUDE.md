# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple OMS is a full-stack order management system with a microservices architecture. The backend consists of three Spring Boot services written in Kotlin:

- **iam-client-starter**: A reusable Spring Boot starter library that provides JWT authentication and IAM client integration for other services
- **iam-service**: Identity and Access Management service handling authentication (JWT + WebAuthn/FIDO2) and user authorization
- **order-service**: Order management and inventory service

The frontend is a Next.js 16 application with React 19 running on port 3060.

## Architecture

### Service Structure

```
backend/
├── iam-client-starter/    # Shared library (Spring Boot starter, Maven-published)
├── iam-service/           # Auth & user management (port 8080, PostgreSQL 5432)
└── order-service/         # Orders & inventory (port 8081, PostgreSQL 5433)
```

### Technology Stack

- **Language**: Kotlin 2.3.21 (targets Java 25)
- **Framework**: Spring Boot 4.0.6 with Spring Security
- **Database**: PostgreSQL 16 (two separate DBs via docker-compose)
- **Caching**: Redis 7 (in iam-service only)
- **Authentication**: JWT (JJWT) + WebAuthn via Yubico library
- **Testing**: JUnit 5 with MockK for mocks
- **Build**: Gradle (multi-project build)

### Key Dependencies

- **iam-service**: JJWT, Redis/Redisson, Caffeine cache, WebAuthn (Yubico), Spring Security, Spring Data JPA
- **order-service**: Spring Security, Spring Data JPA, iam-client-starter dependency
- **Both services**: Spring Boot Actuator (health/metrics endpoints), Jackson for JSON

### Database Schema

- **iam-service**: Connects to `simple_oms` database on `localhost:5432` (DDL managed by Hibernate)
- **order-service**: Connects to `order_service` database on `localhost:5433` (DDL managed by Hibernate)
- Both use PostgreSQL dialect with JPA/Hibernate ORM

### Cross-Service Communication

- order-service authenticates requests via iam-client-starter (uses JWT validation)
- order-service references IAM service URL via `iam.auth-server-url` config (defaults to `http://localhost:8080`)
- Both services publish health/metrics via Spring Boot Actuator endpoints

## Development Setup

### Prerequisites

- Java 25 (Zulu or another JDK distribution)
- Gradle (via `./gradlew` - included in repo)
- Docker & Docker Compose (for PostgreSQL and Redis)

### Quick Start

1. **Start the database and cache infrastructure**:
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL (ports 5432, 5433) and Redis (port 6379). Services wait for DB health checks before connecting.

2. **Build all backend services**:
   ```bash
   ./gradlew build
   ```

3. **Run individual services**:
   ```bash
   # In separate terminals, or use PM2 (see ecosystem.config.js for Windows setup)
   ./gradlew :iam-service:bootRun       # Starts on http://localhost:8080
   ./gradlew :order-service:bootRun     # Starts on http://localhost:8081
   ```

4. **Frontend** (from `/frontend` directory):
   ```bash
   pnpm install
   pnpm dev  # Runs on http://localhost:3060
   ```

### Common Commands

**Build and test**:
- `./gradlew build` — Build all modules and run unit tests
- `./gradlew :order-service:test` — Run tests for a specific service
- `./gradlew clean` — Remove build artifacts

**Running services**:
- `./gradlew :iam-service:bootRun` — Run IAM service with hot reload (Spring DevTools enabled)
- `./gradlew :order-service:bootRun` — Run Order service with hot reload
- `./gradlew :iam-client-starter:build` — Build starter library only (published to local Maven repo)

**Gradle wrapper**:
- `./gradlew` is pre-configured; no need to install Gradle separately
- On Windows, use `gradlew.bat`; on Unix/Mac, use `./gradlew`

## Code Organization

### iam-service Structure

```
src/main/kotlin/com/joycai/simpleoms/
├── controller/       # REST endpoints (auth, users, etc.)
├── service/          # Business logic and orchestration
├── repository/       # Spring Data JPA interfaces
├── model/            # JPA entities (@Entity, ORM-mapped)
├── config/           # Spring @Configuration classes (Security, Redis, WebAuthn, etc.)
├── dto/              # Data transfer objects for requests/responses
├── security/         # Custom security filters, JWT validation
└── util/             # Utility functions
```

### order-service Structure

```
src/main/kotlin/com/joycai/orderservice/
├── controller/       # REST endpoints (orders, items, cart, etc.)
├── service/          # Order processing, inventory management
├── repository/       # Spring Data JPA interfaces
├── model/            # JPA entities
├── config/           # Spring @Configuration (Security, file upload, etc.)
└── dto/              # Data transfer objects
```

### iam-client-starter Structure

A Spring Boot starter providing auto-configuration for IAM integration:
- JWT validation interceptor
- Security configuration helpers
- Client credentials exchange
- Automatically applied to order-service

## Configuration

Services use Spring externalized configuration via `application.yml`:

**Environment Variables**:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` — Database connection
- `REDIS_HOST`, `REDIS_PORT` — Redis connection (iam-service only)
- `IAM_CLIENT_SECRET` — order-service's client credential for iam-service
- `CORS_ALLOWED_ORIGINS` — CORS origins (default: http://localhost:3060)
- `UPLOAD_DIR` — File upload directory (order-service)

**Key Defaults**:
- iam-service: Port 8080, PostgreSQL localhost:5432/simple_oms, Redis localhost:6379
- order-service: Port 8081, PostgreSQL localhost:5433/order_service, IAM at http://localhost:8080
- Both: Actuator endpoints enabled at `/actuator/health`, `/actuator/metrics`

Database schema auto-updates via `ddl-auto: update` (Hibernate); changes are applied on service startup.

## Testing

Unit tests use JUnit 5 with MockK for mocking Spring beans:
- Run tests: `./gradlew test`
- Run tests for a service: `./gradlew :order-service:test`
- Tests located in `src/test/kotlin/` within each service module

E2E tests (Playwright) are in the root `/tests` directory and test the full frontend + backend flow.

## Important Architectural Notes

1. **Microservice Pattern**: iam-service and order-service are independent; order-service imports iam-client-starter for authentication only, not for business logic sharing.

2. **JPA All-Open Plugin**: The `allOpen` Gradle plugin is configured for JPA entities — this allows Hibernate proxies to work with Kotlin's default final classes. Do not remove this configuration.

3. **Kotlin Compiler Settings**: Both services use `-Xjsr305=strict` for null safety. The iam-service adds `-Xannotation-default-target=param-property` to support Spring annotation processing.

4. **Spring Security**: Both services enforce authentication via JWT. Requests must include a valid JWT token in the `Authorization: Bearer <token>` header.

5. **WebAuthn (Passwordless)**: iam-service implements FIDO2/WebAuthn for passwordless login. The relying party (RP) is configured with `rp-id: localhost` — change this for production deployments.

6. **Cache Strategy**: iam-service uses Redis for distributed session caching and Caffeine for local application caching. order-service does not use caching by default.

7. **File Uploads**: order-service stores uploaded images in `./uploads` directory (configurable). No cleanup is performed — manage disk space accordingly.

## When Adding New Features

- **New REST endpoints**: Add controller methods in the appropriate service's `controller/` package.
- **New entities**: Create JPA `@Entity` classes in `model/`, then add corresponding repositories.
- **Service-to-service calls**: order-service should use REST clients (RestTemplate or WebClient) to call iam-service; keep iam-client-starter focused on auth concerns.
- **Shared code**: If both services need the same logic, add it to iam-client-starter and publish a new version, or create a separate shared library module.

## Debugging

- Set `logging.level.com.joycai.*: DEBUG` in `application.yml` for verbose logs
- Spring DevTools enabled; restart by touching a file in `src/main/`
- Actuator endpoints at `http://localhost:<port>/actuator` for health/metrics
- PostgreSQL can be accessed: `psql -h localhost -U postgres -d simple_oms` (password: postgres)
- Redis CLI: `redis-cli -p 6379` (localhost)
