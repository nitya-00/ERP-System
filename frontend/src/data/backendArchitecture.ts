export type ArchitectureModule = {
  id: string;
  name: string;
  description: string;
  owns: string;
  phase: string;
  tone: "primary" | "success" | "violet" | "info" | "warning";
};

export const backendModules: ArchitectureModule[] = [
  { id: "identity", name: "Identity & access", description: "Login, sessions, roles and school-scoped permissions.", owns: "Users · roles · sessions", phase: "Phase 2", tone: "primary" },
  { id: "students", name: "Students & guardians", description: "Student profile, guardian links and enrolment history.", owns: "Students · guardians · enrolments", phase: "Phase 2", tone: "success" },
  { id: "admissions", name: "Admissions", description: "Applications, review workflow and conversion into enrolment.", owns: "Applications · documents", phase: "Phase 3", tone: "violet" },
  { id: "academics", name: "Academic setup", description: "Classes, sections, subjects and timetables.", owns: "Classes · sections · subjects", phase: "Phase 3", tone: "info" },
  { id: "attendance", name: "Attendance", description: "Daily registers, corrections and attendance summaries.", owns: "Registers · attendance entries", phase: "Phase 4", tone: "warning" },
  { id: "fees", name: "Fees & receipts", description: "Fee plans, invoices, payments and immutable receipts.", owns: "Invoices · payments · receipts", phase: "Phase 5", tone: "success" },
  { id: "exams", name: "Exams & results", description: "Assessment setup, marks and report-card generation.", owns: "Assessments · marks · reports", phase: "Phase 6", tone: "primary" },
  { id: "communication", name: "Communication", description: "Notices, notifications and delivery jobs.", owns: "Notices · deliveries", phase: "Phase 7", tone: "violet" },
];
