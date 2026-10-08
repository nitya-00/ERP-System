# School ERP - Complete Project Context

> **Source of truth:** `erp system backend .pdf` supplied on 7 October 2026,
> reconciled with the existing React ERP. This file records the agreed product,
> architecture, security model, scope, and implementation order so future work
> does not have to rediscover the project context.

## 1. Product definition

This project is a role-aware School ERP: a school management platform for the
complete lifecycle from admission through enrolment, teaching, attendance,
exams/results, fees, communication, reporting, and auditability. It is not a
collection of independent CRUD screens. The backend is the authoritative source
of business rules and data; the React application is an API client.

The project currently has a React 19, TypeScript, Vite frontend with role-based
demo portals and local demo data. The target product replaces that local data
incrementally with a Node.js, Express, TypeScript, Prisma, and PostgreSQL API.
The product should become professionally reliable without prematurely becoming a
150-table, microservice-based commercial ERP clone.

## 2. Scope and role model

The only live roles are `ADMIN`, `TEACHER`, and `PARENT`. Students are school
records, not ERP login users. The data model is relationship-based so it can
support future school requirements without changing the current role policy.

| Feature | Admin | Teacher | Parent |
| --- | --- | --- | --- |
| Students | Full school management | Assigned students only | Linked child only |
| Classes/subjects | Configure all | Assigned classes/subjects | View own child's context |
| Attendance | School-wide monitoring | Mark/manage assigned registers | Linked child |
| Marks/results | Manage, verify, publish | Enter assigned marks | Published child results |
| Fees | Structures, invoices, payments, reports | No fee amount access by default | Linked child fees |
| Admissions | Full workflow | No access | Future applicant view only |
| Notices | Create/target/manage | Read and permitted creation | Read targeted notices |
| Notifications | School-wide view/manage | Own | Own |
| Reports | Full reports/exports | Assigned teaching data | Child data |
| Audit/users/settings | Full authorised access | No | No |

### Non-negotiable authorization rule

Role alone is insufficient. Every sensitive request is checked as:

`authenticated user -> role permission -> resource relationship -> business rule`

- A teacher may operate only on sections and subjects in `TeacherAssignment`.
- A parent may operate only on students connected through `GuardianStudent`.
- An administrator has school-wide scope, constrained by assigned permissions.
- All authorization defaults to deny; checks occur on every request.

## 3. Target technical architecture

```
React 19 + TypeScript + Vite
        |
TanStack Query + typed API client
        |
REST API /api/v1
        |
Express + TypeScript
        |
authentication | RBAC + scoped authorization | validation
        |
controllers -> services -> repositories
        |
Prisma -> PostgreSQL (Supabase PostgreSQL initially)
        |
school data | audit logs | future object storage / background jobs
```

The backend is a **modular monolith**. It is one deployable API and one database,
but each domain owns its HTTP routes, controller, service, schema, repository,
and types. Do not adopt microservices, Kafka, Redis, or queues during the core
build. Redis/BullMQ is a later option for large jobs such as report-card creation
or bulk notification delivery.

### Technology decisions

- **Frontend:** React 19, TypeScript, Vite, React Router; add TanStack Query,
  React Hook Form, and Zod as API-backed screens are migrated.
- **Backend:** Node.js, Express, TypeScript, Zod, Prisma ORM, PostgreSQL.
- **Identity:** prefer Supabase Auth token issuance with Express responsible for
  ERP authorization and business logic. Own bcrypt/Argon2 authentication is an
  alternative only if explicitly chosen later.
- **Hosting:** Supabase PostgreSQL, Render for the API, Vercel for the frontend.
- **Later integrations:** Supabase Storage/S3, Resend/SMTP, SMS/WhatsApp,
  Razorpay, Sentry. They are deliberately outside the current foundation.

The frontend must not query Supabase tables directly once Express becomes the
backend. Avoid a competing direct-client and API authorization system.

## 4. Domain model and relationships

### Identity and people

- `User`, `Role`, `Permission`, `RolePermission`, `Session`/`RefreshToken`
- `Student`, `Guardian`, `GuardianStudent`, `Teacher`, `Staff`
- User accounts are distinct from person records. Students have no login account
  in the current product; a `Teacher` or `Guardian` profile may link to a `User`.
- A guardian-to-student many-to-many link stores relationship, primary-contact,
  and notification eligibility.

### Academic structure

- `SchoolSettings`, `AcademicYear`, `Term`, `Class`, `Section`, `Subject`
- `Enrollment` records a student's placement for an academic year, class,
  section, roll number, and status.
- `TeacherAssignment` records teacher, academic year, class, section, subject,
  and whether the teacher is the class teacher.
- `TimetableEntry` records academic year, class/section, subject, teacher, day,
  start/end time, and room.

Never store a student's current class as their only academic history. The core
relationship is `AcademicYear -> Class -> Section -> Enrollment -> Student`.
Promotion creates another enrolment; it never overwrites the previous one.

### Attendance, exams, and results

- `AttendanceSession` and `AttendanceRecord`, not a single boolean on student.
- Attendance statuses: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
- `Exam`, `ExamSchedule`, `ExamSubject`, `Mark`, `GradeScale`,
  `ResultPublication`.
- Result lifecycle: `DRAFT -> SUBMITTED -> VERIFIED -> PUBLISHED`. Parents and
  students only see published results.

### Finance, admissions, and communication

- `FeeStructure`, `FeeAssignment`, `Invoice`, `InvoiceItem`, `Payment`,
  `Receipt`; invoices support partial payments and calculated status.
- Invoice states: `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `WAIVED`,
  `CANCELLED`.
- `AdmissionApplication`, `AdmissionDocument`; lifecycle:
  `ENQUIRY -> APPLICATION -> DOCUMENT_REVIEW -> INTERVIEW/TEST ->
  APPROVED/REJECTED -> ENROLLED`.
- `Notice`, `NoticeAudience`, `Notification`; notices are published content,
  while notifications are per-user actionable alerts.
- `AuditLog` captures who changed which entity, what changed, origin metadata,
  and timestamp.

### Required database protections

- Tenant-owned records include `school_id`.
- Use foreign keys, checks, transaction boundaries, indexes, and database unique
  constraints. Examples: admission number; employee number; academic year +
  class + section; attendance session + student; exam + student + subject.
- Prefer statuses/`deletedAt` to hard deletion for academic, financial,
  attendance, result, and audit data.
- Approval-to-enrolment, payment/receipt recording, and result publication are
  database transactions: all changes commit together or all roll back.

## 5. Business workflows and rules

### Attendance

An assigned teacher creates or updates a session, validates every student belongs
to the target section, avoids duplicate records, records the actor/time, and
writes an audit event. Percentages are calculated from records, not stored as
untrusted mutable values. Admins monitor school/class/student summaries;
parents and students view only their scoped summaries.

### Exams and results

Teachers enter only assigned marks. Store raw marks; calculate percentage,
grade, grade point, and result status using configurable grade scales. Publication
is a controlled workflow, not an automatic consequence of saving a mark.

### Fees

Never model fees as `student.fee = 5000`. Generate structured invoices and
invoice items. A payment records amount, method, transaction identifier,
receipt number, time, and actor; balance and payment state are calculated.
Fee amounts are API permissions (`FEE_VIEW_AMOUNT`, `FEE_RECORD_PAYMENT`, etc.),
not merely hidden browser UI.

### Admissions

Approval creates the student, guardian(s), guardian links, enrolment, optional
account, and audit event transactionally. This avoids manually duplicating data.

### Notices and notifications

Notices can target all users, a role, a class, or a section and include priority,
publish/expiry dates, and creator. Notifications begin as in-app, per-user,
read/unread records; email, SMS, WhatsApp, and push are later channels.

## 6. API, security, and data contract rules

- All endpoints live under `/api/v1`; use `/api/v2` for incompatible future
  changes.
- Feature APIs are domain-based (`/students`, `/attendance`, `/fees`) rather
  than duplicating `/admin/...` CRUD routes. Role-specific dashboard aggregates
  can use endpoints such as `/dashboard/admin` and `/teacher/dashboard`.
- Meaningful workflow actions are preferred over generic CRUD where needed:
  approve/reject admissions, publish results, pay invoices, promote students.
- Validate every request server-side with Zod. Controllers handle HTTP, services
  implement rules, repositories access Prisma/PostgreSQL.
- Return predictable envelopes: `{ success: true, data }` and structured errors
  with a stable error code. Paginate/filter searchable collections server-side.
- Use HTTPS, CORS, Helmet, rate limiting, request IDs, secure token handling,
  parameterized ORM queries, structured logging, and centralized errors.
- Never return broad database rows. Use role-appropriate DTOs; teachers must not
  receive unrelated fee, guardian, medical, or private-note data.
- Audit login/logout/failures, account/permission changes, admissions, student
  changes, attendance, marks, publication, payments/refunds, and notices.

## 7. Backend folder contract

```text
backend/
  src/
    app.ts, server.ts
    config/                 env, database, logger
    common/                 constants, errors, types, utils, validators
    middleware/             auth, authorization, error, rate-limit, request-id
    modules/                domain-owned code
      <domain>/             routes, controller, service, schema, repository, types
    database/
      prisma/               Prisma schema, migrations, seed
      repositories/         shared low-level persistence helpers only
  tests/
    unit/ integration/ authorization/
```

Initial domain modules are `auth`, `users`, `students`, `guardians`, `teachers`,
`academics`, `admissions`, `attendance`, `exams`, `results`, `fees`, `notices`,
`notifications`, `reports`, and `audit`.

## 8. Delivery roadmap

1. Foundation: TypeScript, environment validation, Prisma/PostgreSQL,
   migrations, seeds, errors, logging, versioning.
2. Authentication: Supabase Auth integration, user profile, roles,
   permissions, `/auth/me`, session handling.
3. School setup: academic years, terms, classes, sections, subjects, teachers,
   assignments.
4. Students: students, guardians, links, enrolments, search/profile APIs.
5. Teacher portal: assigned classes/subjects, students, timetable/dashboard.
6. Attendance: sessions, records, monitoring/viewing, analytics.
7. Admissions: application, review, approval/rejection, enrolment conversion.
8. Exams/results: schedules, marks, grades, verification, publication.
9. Fees: structures, assignments, invoices, partial payments, receipts,
   defaulters and reports.
10. Communication: notices, targeting, notifications, read state.
11. Reports: student, attendance, finance, academic, CSV/PDF exports.
12. Security hardening: audit, authorization tests, rate limits, backups, and
   privacy review.

Later phase candidates: documents, promotion, library, transport, staff/HR,
leave, payroll, certificates, events, homework, assignments, PTM, online
payments, SMS/WhatsApp/push, inventory, hostel, and advanced analytics. Do not
start these before the core roadmap is stable.

## 9. Quality and test requirements

Unit tests cover calculations and business rules. Integration tests cover major
workflows. Authorization tests explicitly prove that teacher A cannot access
class B and parent A cannot access child B.
These tests are required as modules evolve.

## 10. Current repository state

- `frontend/` remains a working React/Vite application using seeded/local state.
- `backend/` includes the TypeScript Express foundation, Phase 2 identity
  structure, and Phase 3 academic schema: academic years, terms, classes,
  sections, subjects, class-subject mappings, teachers, and teacher assignments.
  The initial schema and catalogue are connected to the configured Supabase
  database.
- The next implementation task is protected admin academic-setup APIs, followed
  by teachers and assignments once the school provides those details.
