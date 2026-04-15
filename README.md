<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

---

# Smart Parking Backend

Production-oriented backend service for a smart parking platform, built with NestJS, Prisma, MySQL, JWT authentication, and real-time socket updates.

This project powers parking lot operations including account lifecycle, IoT device-slot mapping, parking slot management, slot change history, and vehicle in/out logging.

## 1. Introduction

Smart Parking Backend is a modular API-first service designed for reliability and extensibility.

- Framework: NestJS (TypeScript)
- Database: MySQL with Prisma ORM
- Auth: Access Token + Refresh Token with secure cookie handling
- Email: Verification and password reset via SMTP
- Realtime: Socket.IO namespace for parking streams
- API Docs: Swagger UI

Default API prefix:

```text
/api/v1
```

Swagger endpoint:

```text
/api/v1/docs
```

## 2. Key Features

- Authentication and authorization
  - Register, login, logout, token refresh
  - Email verification and password reset flow
  - Role-ready design with guard-based protection
- Parking domain management
  - Parking lots, IoT devices, parking slots
  - Device/port assignment and status tracking
  - Slot history audit trail
  - Vehicle entry/exit logs
- Security and API quality
  - Global validation pipeline
  - Structured exception filter and transform interceptor
  - Helmet hardening and CORS configuration
- Developer experience
  - Prisma-based schema and seed data
  - Docker Compose for local database bootstrap
  - Swagger documentation and predictable module boundaries

## 3. Overall Architecture

### 3.1 High-level architecture

```mermaid
flowchart LR
  C[Web or Mobile Client] -->|HTTPS REST| A[NestJS API]
  C -->|Socket.IO| W[Realtime Gateway]

  subgraph APP[Application Modules]
    direction TB
    subgraph ROW1[ ]
      direction LR
      M1[Auth Module]
      M2[Parking Lot Module]
      M3[Parking Slot Module]
      M4[IoT Device Module]
    end
    subgraph ROW2[ ]
      direction LR
      M5[Slot History Module]
      M6[Vehicle Log Module]
      M7[User Module]
    end
  end

  A --> M1
  A --> M2
  A --> M3
  A --> M4
  A --> M5
  A --> M6
  A --> M7

  M1 --> T[Tokens Service]
  M1 --> E[Mail Service]

  A --> P[Prisma Service]
  P --> DB[(MySQL)]
```

### 3.2 Request lifecycle

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant API as NestJS API
  participant Guard as JWT Guard
  participant Service as Domain Service
  participant Prisma as Prisma Service
  participant DB as MySQL

  Client->>API: HTTP request
  API->>Guard: Authenticate (unless Public)
  Guard-->>API: User context
  API->>Service: Business logic
  Service->>Prisma: Query or mutation
  Prisma->>DB: SQL
  DB-->>Prisma: Result
  Prisma-->>Service: Data
  Service-->>API: Response payload
  API-->>Client: Standardized response
```

## 4. Installation

### 4.1 Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for local MySQL)

### 4.2 Clone and install dependencies

```bash
git clone https://github.com/Anh-Tuan04/HCMUT_252_term-Multidisciplinary_Project-Software_Engineering.git
git checkout nestjs
npm install --legacy-peer-deps
```

### 4.3 Start MySQL with Docker Compose

```bash
docker compose up -d
```

The default compose file runs MySQL 8.0

### 4.4 Prepare database schema and seed data

```bash
npx prisma db push
npm run seed
```

## 5. Running The Project

### 5.1 Development

```bash
npm run start:dev
```

### 5.2 Alternative dev mode (webpack watch)

```bash
npm run dev
```

### 5.3 Production build and run

```bash
npm run build
npm run start:prod
```

### 5.4 Useful scripts

```bash
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## 6. Environment Configuration

Create a .env file in the project root.

Example:

```env
# Runtime
NODE_ENV=development
PORT=8080

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Database (MySQL)
DATABASE_URL="mysql://admin:123456@localhost:3307/khieudang"

# JWT
JWT_SECRET=replace_with_strong_access_secret
JWT_EXPIRED=15m
JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
REFRESH_EXPIRED=7d

# Mail (SMTP)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Verification URL consumed by MailService
VERIFY_BASE_URL=http://localhost:8080/api/v1/auth/verify
```

Configuration notes:

- DATABASE_URL is mandatory. App startup will fail if missing.
- VERIFY_BASE_URL should point to the verify endpoint exposed by this service.
- In production, set secure CORS origins and strong JWT secrets.

## 7. Folder Structure

```text
nestjs
├── prisma/
│   ├── schema.prisma           # data model
│   └── seed.ts                 # seed bootstrap
├── src
│   ├── authentication
│   │   ├── auth                # register/login/refresh/logout and account lifecycle
│   │   ├── mail                # email templates + SMTP integration
│   │   └── tokens              # access and refresh token generation/verification
│   ├── common
│   │   ├── decorators          # public and role decorators
│   │   ├── guards              # JWT, roles, WebSocket guards
│   │   └── filters             # exception and response interceptors
│   ├── modules
│   │   ├── parking_lot         # parking lot management
│   │   ├── parking_slot        # parking slot logic + realtime gateway
│   │   ├── iot_device          # IoT device registration/mapping
│   │   ├── slot_history        # slot change history
│   │   ├── vehicle_log         # vehicle IN/OUT logs
│   │   └── user                # user domain operations
│   ├── prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts   # Prisma + MariaDB adapter bootstrap
│   ├── app.module.ts
│   └── main.ts
├── .env                        # Variable Environment
├── docker-compose.yml          # Create Database
├── package.json
└── ...
```

## 8. API Examples

### 8.1 Register

```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "password": "StrongPass123!"
  }'
```

### 8.2 Login

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "StrongPass123!"
  }'
```

### 8.3 Explore API via Swagger

Open:

```text
http://localhost:8080/api/v1/docs
```

## 9. Contribution Guidelines

We welcome contributions that improve correctness, maintainability, performance, and developer ergonomics.

### 9.1 Workflow

1. Fork and create a feature branch.
2. Keep each pull request focused on one logical change.
3. Add or update tests for changed behavior.
4. Ensure lint and tests pass locally.
5. Submit pull request with clear problem statement and solution notes.

### 9.2 Suggested branch naming

- feat/<short-description>
- fix/<short-description>
- chore/<short-description>
- docs/<short-description>

### 9.3 Quality checklist

- No secrets committed
- Public API changes documented
- Backward compatibility considered
- Migration or seed impact described

## 10. License

Current package metadata is set to UNLICENSED.

This indicates private or internal usage unless you explicitly choose and publish an open-source license.

## 11. Roadmap

Near-term roadmap candidates:

- Add migration pipeline with versioned Prisma migrations for CI environments
- Introduce comprehensive unit and integration test suites per domain module
- Add observability stack (structured logs, metrics, tracing)
- Harden authorization with fine-grained permission policies
- Add API rate limiting and abuse protection
- Expand real-time capabilities for occupancy dashboards and alert streams
- Provide containerized app runtime profile (API + DB + reverse proxy)
- Publish OpenAPI contract artifacts for frontend and external integrations

---

If you plan to deploy this service in production, start with:

1. Strong secret management
2. Strict CORS and cookie policies
3. Automated schema migration and backup strategy
4. Centralized monitoring and alerting
