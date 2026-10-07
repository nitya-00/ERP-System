# School ERP API

This is the backend workspace for a Node.js + Express API. It is deliberately a
modular monolith: one API and one PostgreSQL database, with clear feature
boundaries. This is simpler to operate than microservices and remains easy to
split later if a real scaling need appears.

## Folder structure

```
backend/
  package.json
  src/
    app.js                         Express app and global middleware
    server.js                      process entry point
    config/
      env.js                       environment configuration
    database/                      connection, migrations and seed scripts
    common/
      constants/roles.js           admin, teacher, parent, student roles
      middleware/                  authentication, authorization, errors
      errors/                      application error classes
      utils/                       shared helpers
    modules/
      auth/                        login, refresh tokens, password reset
      users/                       user accounts and role assignment
      admissions/                  admission applications and documents
      students/                    students, guardians, enrolments
      academics/                   classes, sections, subjects, timetables
      attendance/                  daily attendance registers
      fees/                        fee plans, invoices, payments, receipts
      exams/                       exams, marks, report cards
      communication/               notices and notifications
      reports/                     read-only reports and exports
      portals/
        admin/                     whole-school dashboard and approvals
        teacher/                   assigned-class dashboard and actions
        parent/                    linked-child dashboard and actions
        student/                   self-service dashboard and actions
```

## Role design

Every request will first pass through authentication and authorization. The four
portals are all first-class backend concerns, not admin-only features:

- **Admin:** school-wide administration, admissions decisions, fee controls,
  reports, staff/class configuration, notices.
- **Teacher:** only assigned classes, attendance registers, marks entry,
  timetable, teacher notices.
- **Parent:** only children linked to that parent, their attendance, fees,
  results, notices.
- **Student:** only their own profile, attendance, fees, results, timetable,
  notices.

Role checks alone are not enough: parent and student requests must also enforce
record ownership; teacher requests must validate class/subject assignment.

## Data rules

- PostgreSQL is the system of record. Every school-owned table includes
  `school_id` for tenant isolation.
- Store guardian-to-student links and enrolment history; do not rely on a mutable
  `className` field alone.
- Payment receipts, marks publication, attendance corrections, and admission
  decisions are audit events—not silent updates.
- Uploaded documents live in object storage; PostgreSQL stores metadata and
  access policy only.

## Current scope

The Express bootstrap exposes `GET /health`. Feature routes are intentionally not
implemented in this phase. The first API slice should be authentication plus
read-only student access for all appropriate roles, before replacing mock data in
the frontend.
