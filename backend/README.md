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

Every request must pass authentication, role/permission checks, relationship
scope checks, and the relevant business rules. Controllers must never put Prisma
queries or authorization decisions directly in HTTP handlers.

## Commands

```bash
npm install
cp .env.example .env
npm run dev
```

## Foundation and identity status

Phase 1 is complete locally:

- TypeScript Express bootstrap, versioned `/api/v1` routing, CORS, Helmet,
  request IDs, rate limiting, structured logging, standard responses, and
  centralized error handling are in place.
- Phase 2 adds Supabase JWT verification, ERP user/role/permission models,
  `GET /api/v1/auth/me`, authorization middleware, login-session audit events,
  and a Supabase-backed frontend sign-in flow. The frontend does not access
  school tables directly.
- `npm run build`, `npm test`, and `npm run prisma:generate` pass.

The initial migration has been applied to the configured Supabase database and
seeded the school, 2026-27 academic year, 11 classes, 16 sections, and 8
provisional subjects. No Supabase Auth users, ERP user records, teachers, or
teacher assignments were seeded. Configure both `backend/.env` and
`frontend/.env` from their `.env.example` files before using the live login
flow. Feature APIs are deliberately the next phase. Read the complete product context in
[`../sources/project-context.md`](../sources/project-context.md).

## Academic setup API

The first Phase 3 API slice is mounted at `/api/v1/academics`. Every route
requires a valid ERP session and the `ACADEMICS_MANAGE` permission, which is
currently assigned only to `ADMIN`.

- `GET /setup` — the school catalogue: academic years, classes with sections,
  subjects, and class-subject mappings.
- `POST` / `PATCH` academic years, classes, sections, and subjects — create or
  edit setup records. Set a class, section, or subject `status` to `INACTIVE`,
  or an academic year `status` to `CLOSED`, instead of deleting history.
- `PUT /class-subjects` — create or update a subject mapping for one class and
  academic year.

Teacher and parent catalogue routes are intentionally not exposed yet: they
must be scoped to actual teacher assignments and guardian-child enrolments.
