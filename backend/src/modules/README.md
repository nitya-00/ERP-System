# Domain modules

Each feature module will use the same internal layout:

```
module-name/
  module-name.routes.js
  module-name.controller.js
  module-name.service.js
  module-name.repository.js
  module-name.validation.js
```

`portals/` is different: it contains read-model routes composed for each role's
dashboard. It never owns student, fee, attendance, or marks data; it asks the
relevant feature service for that data.

| Module | Owns |
| --- | --- |
| auth | credentials, tokens, sessions and password resets |
| users | accounts and role assignment |
| admissions | applications and admissions documents |
| students | student, guardian and enrolment records |
| academics | classes, sections, subjects and timetable |
| attendance | registers and attendance entries |
| fees | fee plans, invoices, payments and receipts |
| exams | exams, marks and report cards |
| communication | notices, notifications and delivery attempts |
| reports | read-only exports and aggregate reports |
