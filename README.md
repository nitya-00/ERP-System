# School ERP

School ERP is a role-based school management system for running the daily
academic, administrative, financial, and communication work of a school. It
provides separate portals for administrators, teachers, parents, and students so
each person sees only the information and actions relevant to them.

The current product is a React frontend with realistic local demo data. A Node.js
and Express backend workspace has been added as the foundation for the next phases;
the frontend does **not** call a live database or API yet.

## What the project manages

- Student records, guardians, admissions, class and section placement
- Teacher records, class-teacher assignment, subjects, and timetables
- Daily attendance and attendance summaries
- Exams, marks, results, and report-card data
- Fee collection, payment status, and receipts
- Notices and notifications for the correct school audience
- School-wide reports and operational dashboard information

## User portals and features

### Administrator portal

The administrator manages the school as a whole.

| Area | Administrator capabilities |
| --- | --- |
| Dashboard | View school-level student, teacher, attendance, fee collection, class, and notice summaries. |
| Admissions | Review applications, approve or reject them, and convert approved applicants into students. |
| Students | Search and view student records; create and maintain enrolment information. |
| Teachers & classes | View teachers, assign class teachers, and manage class/section setup. |
| Fees | View payment records, paid/pending/overdue status, record payments, and generate receipts. |
| Exams & results | Create and manage exam setup, view marks, and monitor results. |
| Reports | Review academic, attendance, student, and financial reporting information. |
| Notices | Publish school, class, section, parent, or teacher notices; optionally send notifications. |
| Notifications | Review and manage the administrator's notifications. |

### Teacher portal

The teacher works only with their assigned classes and teaching responsibilities.

| Area | Teacher capabilities |
| --- | --- |
| Dashboard | See assigned-class summaries, upcoming work, and recent school communication. |
| My Classes | Open classes assigned to the teacher and view enrolled students. |
| Attendance | Take and update the daily attendance register for assigned classes. |
| Marks | Enter and save marks for the teacher's assigned class, subject, and exam. |
| Timetable | View the teacher's timetable and teaching periods. |
| Notices | Read notices intended for teachers and permitted school/class communications. |
| Notifications | View teacher-specific alerts, reminders, and updates. |

Teachers must never be able to access a class or subject that has not been
assigned to them.

### Parent portal

The parent portal is centred on the children linked to that parent account.

| Area | Parent capabilities |
| --- | --- |
| My Children | View profiles and key information for linked children. |
| Attendance | Review each linked child's attendance record and summary. |
| Fees | Review invoices, payment status, due amounts, receipts, and payment history for linked children. |
| Results | View published examination marks and results for linked children. |
| Notices | Read notices sent to parents, the child's class, section, or the whole school. |
| Notifications | View reminders and alerts relevant to the parent or their children. |

A parent must only be able to access records for children explicitly linked to
their account.

### Student portal

The student portal gives students access to their own school information.

| Area | Student capabilities |
| --- | --- |
| Dashboard | View personal academic and school updates. |
| Attendance | Review their own attendance record. |
| Results | View their own published marks and results. |
| Fees | View fee status and receipts made available to the student account. |
| Notices | Read notices addressed to students, their class, section, or school. |
| Notifications | View personal school alerts and reminders. |

A student must only ever access their own profile and records.

## Access and privacy rules

The system is role-based, but role checks are only the first layer:

- Administrators can manage school-wide data according to their assigned
  administrative permissions.
- Teachers are additionally checked against their assigned classes and subjects.
- Parents are additionally checked against guardian-to-student links.
- Students are additionally checked against their own student record.
- Financial activity, admission decisions, attendance changes, marks publication,
  and other sensitive changes should create audit records in the backend.
- Fee amounts have a privacy control in the current interface.

## Technology and workspace layout

```
ERP System/
  frontend/                 React 19 + TypeScript + Vite user interface
    src/
      pages/                Admin, teacher, parent, and student screens
      components/           Shared UI and application layout
      store/                Current local application state
      data/                 Current demo data
  backend/                  Node.js + Express API foundation
    src/
      common/               Roles, middleware, errors, shared helpers
      config/               Environment configuration
      database/             Future database connection, migrations, and seeds
      modules/              Feature modules and role-specific portal APIs
```

### Frontend

The frontend is built with React, TypeScript, React Router, and Vite. It currently
uses browser local storage and seeded data to demonstrate the full user flows.

### Backend

The backend uses Node.js and Express and follows a modular-monolith design: one
API service, a PostgreSQL database, and separate modules for each school domain.
Feature modules will contain their routes, controllers, services, validation, and
database repositories. Role portal modules will compose only the data appropriate
for admin, teacher, parent, and student dashboards.

See [backend/README.md](backend/README.md) for the backend folder structure and
implementation boundaries.

The complete architecture and product context is preserved in
[sources/project-context.md](sources/project-context.md). It is the reference to
consult before making future backend decisions.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

To create a production build:

```bash
cd frontend
npm run build
```

## Backend status and next phases

The backend currently includes the Express application bootstrap and `GET /health`.
Its package dependencies are declared, but feature routes and the database are not
implemented yet.

The recommended small implementation sequence is:

1. Add environment validation, PostgreSQL connection, migrations, and seed data.
2. Build authentication, roles, and secure admin/teacher/parent/student sessions.
3. Add read-only student profiles with ownership checks for every role.
4. Move admissions, attendance, fees, and exams one feature at a time from mock
   data to API-backed data.
5. Add audit logging, file storage, notifications, reporting exports, and payment
   provider integration only when their earlier dependencies are stable.

## Current limitations

- Frontend records are demo data, persisted locally in the browser.
- No production authentication, PostgreSQL connection, file storage, payment
  gateway, or notification provider is connected yet.
- The backend is intentionally a foundation, not a completed API.
