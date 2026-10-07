# School ERP API

This workspace is the future source of truth for the School ERP. It uses a
TypeScript modular monolith: Express handles HTTP, Zod validates inputs, Prisma
accesses PostgreSQL, and each business domain owns its routes, controller,
service, schema, repository, and types.

## Structure

```text
src/
  app.ts, server.ts
  config/                    environment, database, structured logger
  common/                    constants, errors, types, utilities, validators
  middleware/                auth, authorization, errors, rate limits, request IDs
  modules/
    auth, users
    students, guardians, teachers
    academics, admissions, attendance
    exams, results, fees
    notices, notifications, reports, audit
  database/
    prisma/                  Prisma schema, migrations, seeds
    repositories/            shared persistence helpers only
tests/
  unit/ integration/ authorization/
```

Each module follows this pattern when implemented:

```text
module/
  module.routes.ts
  module.controller.ts
  module.service.ts
  module.schema.ts
  module.repository.ts
  module.types.ts
```

The API is domain-based (`/api/v1/students`, `/api/v1/attendance`,
`/api/v1/fees`), not a duplicated admin-only API. Dashboard endpoints can be
role-oriented, but data access remains scoped by domain and relationship.

## Role and scope requirements

- **Admin:** school-wide actions allowed by its permissions.
- **Teacher:** only assigned class/section/subject records via
  `TeacherAssignment`.
- **Parent:** only students joined through `GuardianStudent`.
- **Student:** only their own profile/records.

Every request must pass authentication, role/permission checks, relationship
scope checks, and the relevant business rules. Controllers must never put Prisma
queries or authorization decisions directly in HTTP handlers.

## Commands

```bash
npm install
cp .env.example .env
npm run dev
```

## Phase 1 status

Phase 1 is complete locally:

- TypeScript Express bootstrap, versioned `/api/v1` routing, CORS, Helmet,
  request IDs, rate limiting, structured logging, standard responses, and
  centralized error handling are in place.
- Prisma has the initial `School` and `AcademicYear` models, plus a seed entry
  point. No migration was run because this repository does not contain a real
  `DATABASE_URL`.
- `npm run build`, `npm test`, and `npm run prisma:generate` pass.

Before creating a real database migration, copy `.env.example` to `.env` and add
the Supabase PostgreSQL connection string. Feature APIs are deliberately the
next phase. Read the complete product context in
[`../sources/project-context.md`](../sources/project-context.md).
