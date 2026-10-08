# Phase 3 School Setup - Agreed Initial Configuration

## School and academic year

- **School name:** The New Horizon Academy and Technology Center
- **First ERP academic year:** 2026-27
- Historical records from the previous ERP will be imported in later phases.

## Active ERP roles

Only these roles are active:

- `ADMIN`
- `TEACHER`
- `PARENT`

Students are managed as records and are linked to parent accounts; they do not
have individual ERP login roles at this time.

## Initial class and section catalogue

These are the approved initial class-section choices. `A` is a provisional
default section for Nursery, LKG, UKG, and Classes 6-8 until the school confirms
additional sections.

| Class | Initial sections |
| --- | --- |
| Nursery | A |
| LKG | A |
| UKG | A |
| 1st | A, B |
| 2nd | A, B |
| 3rd | A, B |
| 4th | A, B |
| 5th | A, B |
| 6th | A |
| 7th | A |
| 8th | A |

No classes above 8th are part of the current scope.

## Provisional subject catalogue

The final class-wise subject offering will be confirmed later. Until then, the
catalogue can contain these common subjects, without treating every subject as
mandatory for every class:

- English
- Hindi
- Mathematics
- Science
- Social Science
- Computer Science
- Art and Craft
- Physical Education

The Phase 3 schema will use a class-subject mapping, so the exact subject list
for each class can be corrected later without changing the system design.

## Teachers and assignments

No real teacher profile, class-teacher, subject-teacher, or assignment data will
be seeded yet. These records will be entered after the school provides the
details.

## Parent visibility

Parents may view, for their linked child only:

- the child’s class and section;
- the subjects configured for that child’s class and academic year;
- the class teacher’s limited public profile.

The class-teacher profile should expose only safe information such as name,
designation, school email, and school contact method. It must not expose private
address, personal phone, salary, identity documents, or unrelated assignments.
This access will be implemented after GuardianStudent and Enrollment exist.

## Shared parent/student phone numbers

A student and parent may use the same phone number. Phone numbers are contact
data, not identity or authorization keys. Parent-to-child access is always based
on the explicit `GuardianStudent` relationship.

## Migration status

The initial Prisma migration was applied to the configured Supabase PostgreSQL
database on 8 October 2026. The initial seed created the school, active 2026-27
academic year, 11 classes, 16 sections, and 8 provisional subjects. English is
the only initial class-subject mapping; the school will confirm the remaining
class-wise subject mappings later. No teacher or teacher-assignment records were
seeded.

## First management API slice

The initial API routes are available under `/api/v1/academics` and are limited
to authenticated administrators with `ACADEMICS_MANAGE`. They support viewing
the setup catalogue and creating or editing academic years, classes, sections,
subjects, and class-subject mappings. Closing uses statuses rather than deleting
historical records. Teacher and parent routes will be added only after their
assignment and guardian-child scope data exists.
