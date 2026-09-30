# Land Acquisition Management Portal — Working Backend

Spring Boot + Java 24 + PostgreSQL + Flyway + Spring Security + JWT + Swagger.

## 1. Start PostgreSQL
Install Docker Desktop, then from this folder run:

`docker compose up -d`

Or use an existing PostgreSQL server and set DB_URL, DB_USERNAME and DB_PASSWORD.

## 2. Start backend
Requires JDK 24 and Maven.

`mvn spring-boot:run`

Swagger: http://localhost:8080/swagger-ui.html

## Demo accounts
- Landowner: `priya@demo.com` / `Land@123`
- Officer: `officer@landportal.demo` / `Officer@123`
- Admin: `admin@landportal.demo` / `Admin@123`

## Demo case
Case: LA-2026-00128
Parcel: MH-PUN-0421
District: Pune
Project: Pune Ring Road Project
Affected area: 1.2 hectares
Approved compensation: 1850000
Payment reference: TXN-2026-847234

## API flow
1. POST /api/auth/login
2. Copy the JWT.
3. In Swagger click Authorize and enter: `Bearer YOUR_TOKEN`
4. Use role-specific endpoints.

## Main APIs
Auth: POST /api/auth/register, POST /api/auth/login
Profile: GET /api/profile
Landowner: GET /api/parcels, GET /api/cases, GET /api/cases/{id}/timeline, compensation, payments, hearings, documents
Grievances: POST /api/grievances/case/{caseId}, GET /api/grievances
Officer: /api/officer/**
Admin: /api/admin/**

## Important
This is a hackathon/college MVP. It demonstrates authentication, RBAC, object-level landowner checks, officer district checks, acquisition workflow, compensation, payments, documents metadata, hearings, grievances, notifications, audit logging and Flyway migrations. It is not a production government deployment and has no real banking or government-record integration.
