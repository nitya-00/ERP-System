# School ERP backend — Phase 1 foundation

This folder is intentionally a **contract-first scaffold**. The live product is the
React app in `../frontend`, so no existing screen depends on an API yet.
The next phases can introduce the service without a risky all-at-once migration.

## Recommended shape

Use a modular monolith first: one deployable API, one relational database, and
modules that own their rules and database access. This is the right scale for a
school ERP; splitting every feature into microservices would add operational work
before it solves a real problem.

```
backend/
  src/
    app.ts                 HTTP composition and module registration
    config/                environment validation and configuration
    common/                auth middleware, errors, audit events, shared utilities
    modules/
      identity/            users, roles, permissions, sessions
      admissions/          applications and conversion to enrolment
      students/            student, guardian and enrolment profiles
      academics/           classes, sections, subjects, timetables
      attendance/          daily registers and attendance summaries
      fees/                fee plans, invoices, payments, receipts
      exams/               assessments, marks, report cards
      communication/       notices, notifications and delivery jobs
      reports/             read-only reporting queries and exports
```

Each module should later contain `routes`, `service`, `repository`, `schema`, and
`types`. Modules may call another module's public service, but must not reach into
its database repository directly.

## Core platform choices

- **API:** TypeScript + Fastify (or NestJS if a convention-heavy framework is
  preferred); REST with OpenAPI generated from request schemas.
- **Database:** PostgreSQL. It fits the relational school model, transactions for
  fees, and reporting better than a document store.
- **Data access:** Prisma or Drizzle; migrations live with the backend.
- **Async work:** a database-backed job queue initially for notification delivery,
  receipt/email generation, and exports. Add Redis only when scale requires it.
- **Files:** object storage for student documents and generated report cards; save
  only metadata and access policy in PostgreSQL.
- **Auth:** short-lived access tokens plus rotating refresh tokens; role and
  school-scoped permission checks at the route boundary.
- **Safety:** audit every financial, marks, attendance, and admission change;
  encrypt sensitive fields at rest where required; never hard-delete academic or
  financial records.

## Important data relationships

- A `school` owns users, students, classes, fee plans, exams, notices, and audit
  records. Keep `school_id` on all tenant-owned tables from day one.
- A student has one or more guardians, and has enrolments over time rather than a
  mutable class field only.
- Attendance and marks reference an enrolment plus a date/assessment, preventing
  ambiguity when a student changes section.
- A payment belongs to an invoice; receipts are immutable snapshots.

## First API slice (the next small phase)

Start with **identity + students, read-only**:

1. `POST /v1/auth/login` and `POST /v1/auth/refresh`
2. `GET /v1/me`
3. `GET /v1/students?classId=&search=&page=`
4. `GET /v1/students/:id`

That lets the existing student list replace mock reads while avoiding sensitive
writes. Add admissions next, then attendance, then fees and marks in separate
vertical slices.

## Frontend transition

Keep the current React source working during the API transition. Add an
`api/` client and feature repositories in the frontend; swap one read path at a
time behind a `VITE_DATA_SOURCE=mock|api` flag. Do not connect the browser directly
to the database.
