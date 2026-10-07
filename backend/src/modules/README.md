# Domain module contract

| Module | Responsibility |
| --- | --- |
| auth | Supabase token verification, current session, account recovery hooks |
| users | ERP user profile, roles, permissions, account status |
| students | Student identity, lifecycle, student profile API |
| guardians | Guardians and guardian-student relationships |
| teachers | Teacher profile and teacher-facing assigned work |
| academics | Academic years, terms, classes, sections, subjects, timetable, assignments |
| admissions | Application review and transactional enrolment conversion |
| attendance | Sessions, records, corrections, summaries, analytics |
| exams | Exams, schedules, subjects, grade scales, raw marks |
| results | Result calculation, verification, and publication |
| fees | Structures, assignments, invoices, items, payments, receipts |
| notices | Targeted school announcements |
| notifications | Per-user in-app notification records and delivery workflow |
| reports | Read-only reporting and exports |
| audit | Sensitive action audit trail |

The modules are intentionally separate from role routes. A dashboard may compose
data from several public module services, but a teacher/parent/student request
must still be scope-checked by the owning feature service.
