# Role portals

All users authenticate through `auth`; their role is attached to `req.user` and
enforced with `authorize(...)`. These folders are intentional, even though the
business data belongs to feature modules.

| Portal | Role-only dashboard responsibility |
| --- | --- |
| `admin/` | whole-school metrics, approvals, configuration and reports |
| `teacher/` | assigned classes, registers, marks entry and timetable |
| `parent/` | linked children, their fees, attendance, results and notices |
| `student/` | own attendance, results, timetable, fees and notices |

The parent and student routes must additionally verify ownership: a parent may
only access their linked children, and a student may only access their own record.
