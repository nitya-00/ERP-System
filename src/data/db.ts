// ============================================================
// School ERP — seed data (mock database)
// ============================================================

export type Role = "admin" | "teacher" | "parent" | "student";

export type Student = {
  id: string;
  admNo: string;
  name: string;
  className: string;
  section: string;
  roll: number;
  gender: "Male" | "Female";
  dob: string;
  bloodGroup: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  admissionDate: string;
  status: "Active" | "Pending" | "Inactive";
  photoClass: number;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  phone: string;
  email: string;
  experience: number;
  qualification: string;
  status: "Active" | "On Leave";
  photoClass: number;
};

export type ClassRow = {
  id: string;
  className: string;
  section: string;
  classTeacher: string;
  room: string;
  subjects: string[];
};

export type Application = {
  id: string;
  name: string;
  applyingFor: string;
  parentName: string;
  parentPhone: string;
  prevSchool: string;
  date: string;
  status: "New" | "Under Review" | "Approved" | "Rejected";
  photoClass: number;
};

export type Payment = {
  id: string;
  receiptNo: string;
  studentId: string;
  amount: number;
  date: string;
  mode: "Cash" | "UPI" | "Card" | "Bank Transfer";
  head: string;
  status: "Paid" | "Pending" | "Overdue";
};

export type Exam = {
  id: string;
  name: string;
  term: string;
  className: string;
  from: string;
  to: string;
  status: "Upcoming" | "In Progress" | "Completed";
  maxMarks: number;
  subjects: string[];
};

export type Mark = {
  studentId: string;
  examId: string;
  subject: string;
  marks: number;
  max: number;
};

export type AttendanceRow = {
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Late";
};

export type Audience =
  | "Entire School"
  | "Class"
  | "Section"
  | "Parents"
  | "Teachers";

export type Notice = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  target: string;
  priority: "Urgent" | "Important" | "Normal";
  author: string;
  authorRole: Role;
  date: string;
  push: boolean;
  forRoles: Role[];
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  kind: "alert" | "info" | "success" | "reminder";
  date: string;
  forRoles: Role[];
  read: boolean;
};

/* ---------------------------------------------------------
   Dates — everything is anchored to the real current date
--------------------------------------------------------- */
const pad = (n: number) => String(n).padStart(2, "0");

export const isoOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = () => isoOf(new Date());

export const dateOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoOf(d);
};

export const todayLong = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** local ISO datetime at `days` offset with a fixed clock time, e.g. "08:15" */
const at = (days: number, time: string) => `${dateOffset(days)}T${time}:00`;

/* ---------------------------------------------------------
   Classes & sections — the school's actual grouping
--------------------------------------------------------- */
export const CLASS_SECTIONS: { className: string; section: string }[] = [
  { className: "Nursery", section: "" },
  { className: "LKG", section: "" },
  { className: "UKG", section: "" },
  { className: "First", section: "A" },
  { className: "First", section: "B" },
  { className: "Second", section: "A" },
  { className: "Second", section: "B" },
  { className: "Third", section: "A" },
  { className: "Third", section: "B" },
  { className: "Fourth", section: "A" },
  { className: "Fourth", section: "C" },
  { className: "Fifth", section: "A" },
  { className: "Fifth", section: "B" },
  { className: "Sixth", section: "" },
  { className: "Seventh", section: "" },
  { className: "Eighth", section: "" },
];

export const CLASSES = [...new Set(CLASS_SECTIONS.map((c) => c.className))];
export const SECTIONS = ["A", "B", "C"];
export const sectionOptions = (className: string) =>
  CLASS_SECTIONS.filter((c) => c.className === className).map((c) => c.section);

/** "First – A" for rows that carry a section, "Nursery" when they do not */
export const classLabel = (className: string, section?: string) =>
  section ? `${className} – ${section}` : className;

export const SUBJECTS = [
  "English",
  "Hindi",
  "Mathematics",
  "Science",
  "Social Science",
  "Computer Science",
  "Art & Craft",
  "Physical Education",
];

const first = [
  "Aarav", "Diya", "Ishaan", "Ananya", "Kabir", "Meera", "Rohan", "Sara",
  "Vivaan", "Riya", "Arjun", "Kiara", "Aditya", "Tanvi", "Neel", "Ira",
  "Yash", "Nisha", "Dev", "Pari", "Kunal", "Aisha", "Manav", "Zoya",
  "Reyansh", "Sneha", "Krish", "Naina", "Aryan", "Tara", "Omkar", "Myra",
  "Shaurya", "Anvi", "Parth", "Rhea", "Hari", "Lavanya", "Veer", "Saanvi",
];
const last = [
  "Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Gupta", "Singh",
  "Mehta", "Joshi", "Rao", "Chopra", "Bose", "Kapoor", "Malhotra", "Desai",
];
const streets = [
  "12, Rose Villa, MG Road",
  "45, Shanti Nagar, Block C",
  "7, Green Park Colony",
  "221, Horizon Apartments",
  "88, Nehru Nagar",
  "3, Palm Grove Enclave",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

/** 16 class-sections × 40 students each → every section has a strength of 40 */
export const STUDENTS_PER_SECTION = 40;

export const students: Student[] = Array.from({ length: CLASS_SECTIONS.length * STUDENTS_PER_SECTION }, (_, i) => {
  const ci = i % CLASS_SECTIONS.length;
  const cs = CLASS_SECTIONS[ci];
  const name = `${pick(first, i * 3)} ${pick(last, i * 5)}`;
  const parent = `${pick(["Mr.", "Mrs."], i)} ${pick(last, i * 5)}`;
  const age = 3 + Math.floor((ci / (CLASS_SECTIONS.length - 1)) * 10);
  const year = 2026 - age;
  return {
    id: `STU${String(1001 + i)}`,
    admNo: `ADM-${2400 + i}`,
    name,
    className: cs.className,
    section: cs.section,
    roll: Math.floor(i / CLASS_SECTIONS.length) + 1,
    gender: i % 2 === 0 ? "Male" : "Female",
    dob: `${year}-${pad((i % 12) + 1)}-${pad((i % 27) + 1)}`,
    bloodGroup: pick(["A+", "B+", "O+", "AB+", "O-"], i),
    phone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
    address: pick(streets, i),
    parentName: parent,
    parentPhone: `+91 99${String(10000000 + i * 911).slice(0, 8)}`,
    parentEmail: `${pick(first, i * 3).toLowerCase()}.${pick(last, i * 5).toLowerCase()}@gmail.com`,
    admissionDate: `${2026 - Math.min(3, Math.floor(ci / 4))}-04-${pad((i % 27) + 1)}`,
    status: i % 17 === 0 ? "Pending" : i % 23 === 0 ? "Inactive" : "Active",
    photoClass: (i % 6) + 1,
  };
});

/** live head-count for a class/section */
export const strength = (
  list: { className: string; section: string }[],
  className: string,
  section: string,
) => list.filter((s) => s.className === className && s.section === section).length;

export const teachers: Teacher[] = [
  { id: "TCH01", name: "Anjali Deshpande", subject: "Mathematics", classes: ["First", "Second", "Third"], phone: "+91 98200 11223", email: "anjali.d@school.edu", experience: 11, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 2 },
  { id: "TCH02", name: "Rajesh Kulkarni", subject: "Science", classes: ["Fifth", "Sixth"], phone: "+91 98200 22334", email: "rajesh.k@school.edu", experience: 14, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 5 },
  { id: "TCH03", name: "Priya Menon", subject: "English", classes: ["UKG", "First"], phone: "+91 98200 33445", email: "priya.m@school.edu", experience: 8, qualification: "M.A, B.Ed", status: "Active", photoClass: 3 },
  { id: "TCH04", name: "Suresh Iyer", subject: "Social Science", classes: ["Second"], phone: "+91 98200 44556", email: "suresh.i@school.edu", experience: 9, qualification: "M.A, B.Ed", status: "Active", photoClass: 1 },
  { id: "TCH05", name: "Kavita Sharma", subject: "Hindi", classes: ["Third"], phone: "+91 98200 55667", email: "kavita.s@school.edu", experience: 6, qualification: "M.A, B.Ed", status: "On Leave", photoClass: 6 },
  { id: "TCH06", name: "Deepak Rao", subject: "Computer Science", classes: ["Fourth", "Seventh", "Eighth"], phone: "+91 98200 66778", email: "deepak.r@school.edu", experience: 5, qualification: "MCA", status: "Active", photoClass: 4 },
  { id: "TCH07", name: "Meenakshi Nair", subject: "Science", classes: ["Nursery", "LKG"], phone: "+91 98200 77889", email: "meenakshi.n@school.edu", experience: 12, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 2 },
  { id: "TCH08", name: "Farhan Qureshi", subject: "Physical Education", classes: ["All Classes"], phone: "+91 98200 88990", email: "farhan.q@school.edu", experience: 7, qualification: "B.P.Ed", status: "Active", photoClass: 5 },
];

const prePrimary = ["English", "Numbers", "Art & Craft", "Physical Education"];
const primary = ["English", "Hindi", "Mathematics", "Art & Craft"];
const upper = ["English", "Hindi", "Mathematics", "Science", "Social Science"];
const senior = [...upper, "Computer Science"];

export const classSections: ClassRow[] = [
  { id: "NUR", className: "Nursery", section: "", classTeacher: "Meenakshi Nair", room: "P-01", subjects: prePrimary },
  { id: "LKG", className: "LKG", section: "", classTeacher: "Meenakshi Nair", room: "P-02", subjects: prePrimary },
  { id: "UKG", className: "UKG", section: "", classTeacher: "Priya Menon", room: "P-03", subjects: prePrimary },
  { id: "FIRST-A", className: "First", section: "A", classTeacher: "Anjali Deshpande", room: "G-01", subjects: primary },
  { id: "FIRST-B", className: "First", section: "B", classTeacher: "Priya Menon", room: "G-02", subjects: primary },
  { id: "SECOND-A", className: "Second", section: "A", classTeacher: "Suresh Iyer", room: "G-03", subjects: primary },
  { id: "SECOND-B", className: "Second", section: "B", classTeacher: "Suresh Iyer", room: "G-04", subjects: primary },
  { id: "THIRD-A", className: "Third", section: "A", classTeacher: "Kavita Sharma", room: "G-05", subjects: primary },
  { id: "THIRD-B", className: "Third", section: "B", classTeacher: "Kavita Sharma", room: "G-06", subjects: primary },
  { id: "FOURTH-A", className: "Fourth", section: "A", classTeacher: "Deepak Rao", room: "F-01", subjects: upper },
  { id: "FOURTH-C", className: "Fourth", section: "C", classTeacher: "Deepak Rao", room: "F-02", subjects: upper },
  { id: "FIFTH-A", className: "Fifth", section: "A", classTeacher: "Rajesh Kulkarni", room: "F-03", subjects: upper },
  { id: "FIFTH-B", className: "Fifth", section: "B", classTeacher: "Rajesh Kulkarni", room: "F-04", subjects: upper },
  { id: "SIXTH", className: "Sixth", section: "", classTeacher: "Rajesh Kulkarni", room: "S-11", subjects: senior },
  { id: "SEVENTH", className: "Seventh", section: "", classTeacher: "Deepak Rao", room: "S-13", subjects: senior },
  { id: "EIGHTH", className: "Eighth", section: "", classTeacher: "Deepak Rao", room: "S-15", subjects: senior },
];

export const applications: Application[] = [
  { id: "APP-501", name: "Aadhya Kulkarni", applyingFor: "First - A", parentName: "Mr. Sunil Kulkarni", parentPhone: "+91 98210 45671", prevSchool: "Little Angels Pre-School", date: dateOffset(-4), status: "New", photoClass: 2 },
  { id: "APP-502", name: "Arnav Bhatt", applyingFor: "Sixth", parentName: "Mrs. Neha Bhatt", parentPhone: "+91 98210 45672", prevSchool: "St. Mary's High School", date: dateOffset(-5), status: "Under Review", photoClass: 5 },
  { id: "APP-503", name: "Siya Ramachandran", applyingFor: "Eighth", parentName: "Mr. Karthik R.", parentPhone: "+91 98210 45673", prevSchool: "Kendriya Vidyalaya", date: dateOffset(-6), status: "Approved", photoClass: 3 },
  { id: "APP-504", name: "Rehan Shaikh", applyingFor: "Third - B", parentName: "Mrs. Farah Shaikh", parentPhone: "+91 98210 45674", prevSchool: "Mount Litera Zee School", date: dateOffset(-7), status: "Approved", photoClass: 4 },
  { id: "APP-505", name: "Tanish Grover", applyingFor: "Eighth", parentName: "Mr. Amit Grover", parentPhone: "+91 98210 45675", prevSchool: "Delhi Public School", date: dateOffset(-8), status: "Under Review", photoClass: 1 },
  { id: "APP-506", name: "Myra Chauhan", applyingFor: "LKG", parentName: "Mrs. Ritu Chauhan", parentPhone: "+91 98210 45676", prevSchool: "Tiny Tots Nursery", date: dateOffset(-9), status: "Rejected", photoClass: 6 },
  { id: "APP-507", name: "Ishaan Pillai", applyingFor: "Fourth - A", parentName: "Mr. Venkat Pillai", parentPhone: "+91 98210 45677", prevSchool: "DAV Public School", date: dateOffset(-10), status: "New", photoClass: 2 },
  { id: "APP-508", name: "Aditi Rane", applyingFor: "Second - A", parentName: "Mrs. Shalini Rane", parentPhone: "+91 98210 45678", prevSchool: "Kidzee", date: dateOffset(-11), status: "New", photoClass: 5 },
];

export const feeStructure = [
  { className: "Nursery – UKG", tuition: 18000, transport: 9000, lab: 0, exam: 1500, total: 28500 },
  { className: "First – Second", tuition: 26000, transport: 10000, lab: 2000, exam: 2000, total: 40000 },
  { className: "Third – Fifth", tuition: 32000, transport: 11000, lab: 3500, exam: 2500, total: 49000 },
  { className: "Sixth – Eighth", tuition: 40000, transport: 12000, lab: 6000, exam: 3000, total: 61000 },
];

export const payments: Payment[] = students.slice(0, 340).map((s, i) => ({
  id: `PAY${100 + i}`,
  receiptNo: `RCT-${20260 + i}`,
  studentId: s.id,
  amount: feeStructure[Math.min(3, Math.floor(i / 85))].total,
  date: dateOffset(-(60 - (i % 55))),
  mode: (["UPI", "Cash", "Card", "Bank Transfer"] as const)[i % 4],
  head: ["Tuition Fee — Term 1", "Tuition Fee — Term 2", "Transport Fee", "Annual Charges"][i % 4],
  status: i % 5 === 0 ? "Pending" : i % 11 === 0 ? "Overdue" : "Paid",
}));

export const exams: Exam[] = [
  { id: "EX-01", name: "Unit Test 1", term: "Term 1", className: "Eighth", from: dateOffset(-60), to: dateOffset(-55), status: "Completed", maxMarks: 50, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "EX-02", name: "Half Yearly Examination", term: "Term 2", className: "Eighth", from: dateOffset(6), to: dateOffset(18), status: "Upcoming", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"] },
  { id: "EX-03", name: "Unit Test 1", term: "Term 1", className: "Seventh", from: dateOffset(-58), to: dateOffset(-53), status: "Completed", maxMarks: 50, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "EX-04", name: "Half Yearly Examination", term: "Term 2", className: "Sixth", from: dateOffset(-1), to: dateOffset(9), status: "In Progress", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science"] },
  { id: "EX-05", name: "Periodic Assessment", term: "Term 1", className: "Fifth", from: dateOffset(-45), to: dateOffset(-41), status: "Completed", maxMarks: 40, subjects: ["English", "Mathematics", "Science"] },
  { id: "EX-06", name: "Half Yearly Examination", term: "Term 2", className: "Fourth", from: dateOffset(9), to: dateOffset(16), status: "Upcoming", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science"] },
];

function seededMarks(): Mark[] {
  const rows: Mark[] = [];
  const done = exams.filter((e) => e.status === "Completed");
  students.forEach((s, si) => {
    done
      .filter((e) => e.className === s.className)
      .forEach((e) => {
        e.subjects.forEach((sub, k) => {
          const pct = 30 + ((si * 7 + (si % 11) + k * 13) % 67);
          rows.push({
            studentId: s.id,
            examId: e.id,
            subject: sub,
            marks: Math.min(e.maxMarks, Math.round((pct * e.maxMarks) / 100)),
            max: e.maxMarks,
          });
        });
      });
  });
  return rows;
}
export const marks: Mark[] = seededMarks();

/** the last 14 weekdays ending today (today is always included) */
function recentSchoolDays(n: number): string[] {
  const out = [todayISO()];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) out.push(isoOf(d));
  }
  return out.reverse();
}

export const ATTENDANCE_DATES = recentSchoolDays(14);

/* Deterministic attendance patterns for the demo teacher's own classes, so the
   class-first register, "absent today" and the 3+ consecutive absence views all
   line up with realistic numbers. */
type ClassPattern = {
  className: string;
  section: string;
  /** rolls marked absent today (drives the register + "Absent Today") */
  absentToday: number[];
  /** rolls marked late today */
  lateToday: number[];
  /** rolls absent for `days` consecutive school days ending today */
  streaks: { roll: number; days: number }[];
};

const TEACHER_CLASS_PATTERNS: ClassPattern[] = [
  { className: "First", section: "A", absentToday: [3, 12, 27], lateToday: [4], streaks: [{ roll: 12, days: 4 }, { roll: 3, days: 4 }] },
  { className: "Second", section: "A", absentToday: [7, 15, 22, 30], lateToday: [11], streaks: [{ roll: 15, days: 4 }, { roll: 22, days: 3 }] },
  { className: "Third", section: "A", absentToday: [5, 19, 28, 34], lateToday: [12, 6], streaks: [{ roll: 19, days: 5 }, { roll: 28, days: 3 }] },
];

/** index inside `students` for a roll number of a class-section */
const rollIndex = (className: string, section: string, roll: number) => {
  const ci = CLASS_SECTIONS.findIndex((c) => c.className === className && c.section === section);
  return ci < 0 ? -1 : (roll - 1) * CLASS_SECTIONS.length + ci;
};

function applyTeacherPatterns(rows: AttendanceRow[]) {
  const pos = new Map<string, number>();
  rows.forEach((r, i) => pos.set(`${r.studentId}|${r.date}`, i));
  const last = ATTENDANCE_DATES.length - 1;
  const today = ATTENDANCE_DATES[last];

  const mark = (className: string, section: string, roll: number, date: string, status: AttendanceRow["status"]) => {
    const idx = rollIndex(className, section, roll);
    const sid = idx >= 0 ? students[idx]?.id : undefined;
    if (!sid || !date) return;
    const at = pos.get(`${sid}|${date}`);
    if (at !== undefined) rows[at] = { ...rows[at], status };
  };

  for (const p of TEACHER_CLASS_PATTERNS) {
    // today: the whole class is resolved explicitly (absent / late / present)
    for (let roll = 1; roll <= STUDENTS_PER_SECTION; roll++) {
      mark(p.className, p.section, roll, today,
        p.absentToday.includes(roll) ? "Absent" : p.lateToday.includes(roll) ? "Late" : "Present");
    }
    // streaks: absent on the last `days` school days, present the day before
    for (const s of p.streaks) {
      for (let k = 0; k < s.days; k++) mark(p.className, p.section, s.roll, ATTENDANCE_DATES[last - k] ?? "", "Absent");
      mark(p.className, p.section, s.roll, ATTENDANCE_DATES[last - s.days] ?? "", "Present");
    }
  }
}

function seededAttendance(): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  students.forEach((s, si) => {
    ATTENDANCE_DATES.forEach((d, di) => {
      const n = (si * 3 + di * 5) % 100;
      rows.push({
        studentId: s.id,
        date: d,
        status: n < 8 ? "Absent" : n < 14 ? "Late" : "Present",
      });
    });
  });
  applyTeacherPatterns(rows);
  return rows;
}
export const attendance: AttendanceRow[] = seededAttendance();

export const seedNotices: Notice[] = [
  {
    id: "N-01",
    title: "School Closed Tomorrow Due to Heavy Rainfall",
    body: "In view of the heavy rainfall warning issued by the IMD, the school will remain closed tomorrow for all classes. All pending exams and activities stand postponed. Stay safe and keep children indoors.",
    audience: "Entire School",
    target: "All classes & sections",
    priority: "Urgent",
    author: "Principal — Mrs. Vandana Rao",
    authorRole: "admin",
    date: at(-1, "08:15"),
    push: true,
    forRoles: ["admin", "teacher", "parent", "student"],
  },
  {
    id: "N-02",
    title: "Half Yearly Examination Date Sheet Released",
    body: "The date sheet for Half Yearly Examinations (Term 2) has been published. Students must reach the examination hall 15 minutes before the reporting time with their ID card.",
    audience: "Class",
    target: "Sixth, Seventh & Eighth",
    priority: "Important",
    author: "Examination Cell",
    authorRole: "admin",
    date: at(-3, "11:40"),
    push: true,
    forRoles: ["admin", "teacher", "parent", "student"],
  },
  {
    id: "N-03",
    title: "PTM — This Saturday",
    body: "Parent–Teacher Meeting for all sections will be held this Saturday from 9:00 AM to 1:00 PM. Kindly collect your ward's progress report from the class teacher.",
    audience: "Parents",
    target: "All parents",
    priority: "Important",
    author: "Class Teachers",
    authorRole: "admin",
    date: at(-4, "09:00"),
    push: false,
    forRoles: ["admin", "parent"],
  },
  {
    id: "N-04",
    title: "Staff Meeting — Curriculum Planning",
    body: "All teaching staff are requested to attend the curriculum planning meeting in the conference room on Friday at 3:30 PM. Please bring your term-2 lesson plans.",
    audience: "Teachers",
    target: "All teachers",
    priority: "Normal",
    author: "Vice Principal",
    authorRole: "admin",
    date: at(-5, "16:20"),
    push: false,
    forRoles: ["admin", "teacher"],
  },
  {
    id: "N-05",
    title: "Annual Sports Day — Trials Next Week",
    body: "Trials for the Annual Sports Day will be held on the school ground during the Physical Education period. Students interested in track and field events should register with Mr. Farhan Qureshi.",
    audience: "Entire School",
    target: "All classes & sections",
    priority: "Normal",
    author: "Sports Department",
    authorRole: "teacher",
    date: at(-6, "13:05"),
    push: true,
    forRoles: ["admin", "teacher", "student"],
  },
];

export const seedNotifications: AppNotification[] = [
  { id: "NT-01", title: "School closed tomorrow", body: "Heavy rainfall — school will remain closed tomorrow for all classes.", kind: "alert", date: at(-1, "08:16"), forRoles: ["admin", "teacher", "parent", "student"], read: false },
  { id: "NT-02", title: "Fee payment pending", body: "Term-2 tuition fee for 6 students is overdue. Please review the Fees module.", kind: "reminder", date: at(-1, "07:30"), forRoles: ["admin"], read: false },
  { id: "NT-03", title: "Attendance below 75%", body: "3 students in Third A have fallen below the 75% attendance threshold.", kind: "alert", date: at(-2, "17:45"), forRoles: ["admin", "teacher"], read: false },
  { id: "NT-04", title: "Marks published", body: "Unit Test 1 results for Class Eighth are now published and visible to parents.", kind: "success", date: at(-3, "12:10"), forRoles: ["admin", "teacher", "parent", "student"], read: true },
  { id: "NT-05", title: "New admission applications", body: "3 new applications received today. Review them in the Admissions module.", kind: "info", date: at(-3, "09:05"), forRoles: ["admin"], read: true },
  { id: "NT-06", title: "PTM this Saturday", body: "Parent–Teacher Meeting this Saturday, 9:00 AM – 1:00 PM.", kind: "reminder", date: at(-4, "09:10"), forRoles: ["parent", "student"], read: false },
  { id: "NT-07", title: "Attendance marked", body: "Attendance for Third A has been submitted for today.", kind: "success", date: at(-1, "09:02"), forRoles: ["teacher"], read: false },
];

export const schoolStats = {
  name: "New Horizon Academy and Technology Center",
  shortName: "New Horizon Academy",
  /**
   * Real school logo. Drop the file path here (e.g. "/logo.svg" or
   * "/logo.png") and every branding slot switches to the image — the layout
   * stays exactly the same. Until then a placeholder is rendered.
   */
  logo: null as string | null,
  /** shown wherever the logo image is not available yet */
  logoPlaceholder: "Logo / Image 1",
  session: "2026 – 2027",
  address: "Sector 21, Rohini, New Delhi — 110086",
  phone: "+91 11 4567 8900",
  email: "office@newhorizonacademy.edu.in",
};

/* Demo linkage: which students belong to the demo parent / student login */
const activeIn = (className: string) =>
  students.find((s) => s.className === className && s.status === "Active") ?? students[0];

export const demoStudentId = activeIn("Eighth").id;
export const demoParentChildren = [demoStudentId, activeIn("First").id];

export const demoUsers: Record<Role, { name: string; email: string; password: string; subtitle: string }> = {
  admin: { name: "Vandana Rao", email: "admin@school.edu", password: "admin123", subtitle: "Principal / Administrator" },
  teacher: { name: "Anjali Deshpande", email: "teacher@school.edu", password: "teach123", subtitle: "Mathematics — First, Second & Third" },
  parent: { name: "Sunil Kulkarni", email: "parent@school.edu", password: "parent123", subtitle: "Parent of 2 children" },
  student: {
    name: students.find((s) => s.id === demoStudentId)?.name ?? "Aarav Sharma",
    email: "student@school.edu",
    password: "study123",
    subtitle: classLabel(
      students.find((s) => s.id === demoStudentId)?.className ?? "Eighth",
      students.find((s) => s.id === demoStudentId)?.section ?? "",
    ),
  },
};

/* ---------------------------------------------------------
   Teacher portal — examinations & marks (class-first)
   The school runs only two examinations for teachers:
   Half-Yearly and the Main Examination.
--------------------------------------------------------- */
export const PASS_PERCENT = 33;

export type TeacherExam = {
  id: string;
  name: string;
  maxMarks: number;
  from: string;
  to: string;
  status: "In Progress" | "Upcoming";
};

export const TEACHER_EXAMS: TeacherExam[] = [
  { id: "T-HY", name: "Half-Yearly", maxMarks: 100, from: dateOffset(-2), to: dateOffset(10), status: "In Progress" },
  { id: "T-MAIN", name: "Main Examination", maxMarks: 100, from: dateOffset(160), to: dateOffset(172), status: "Upcoming" },
];

/** the sections the demo teacher is assigned to (class-first portals) */
export const teacherClasses = classSections.filter((c) =>
  (teachers.find((t) => t.email === demoUsers.teacher.email) ?? teachers[0]).classes.includes(c.className),
);

/** hand-tuned sheet: average 72.4, highest 98, 3 fails — 40 students */
function tunedScores(n: number): number[] {
  const fails = [12, 24, 31];
  const failAt = [7, 18, 32];
  const arr = Array.from({ length: n }, (_, r) => 55 + ((r * 11) % 40));
  arr[0] = 98;
  failAt.forEach((i, k) => {
    if (i < n) arr[i] = fails[k];
  });
  let diff = Math.round(72.4 * n) - arr.reduce((a, b) => a + b, 0);
  const adjustable = Array.from({ length: n }, (_, i) => i).filter((i) => i !== 0 && !failAt.includes(i));
  let p = 0;
  while (diff !== 0 && p < adjustable.length * 200) {
    const i = adjustable[p % adjustable.length];
    const step = diff > 0 ? 1 : -1;
    const v = arr[i] + step;
    if (v >= 40 && v <= 95) {
      arr[i] = v;
      diff -= step;
    }
    p++;
  }
  return arr;
}

/** deterministic sheet with a handful of fails (marks below the pass mark) */
function genericScores(n: number, salt: number, subjectIdx: number): number[] {
  return Array.from({ length: n }, (_, r) => {
    if ((r + salt * 3 + subjectIdx) % 11 === 0) return 21 + ((r * 5 + salt + subjectIdx) % 11);
    return 38 + ((r * 17 + salt * 7 + subjectIdx * 13) % 58);
  });
}

function seededTeacherMarks(): Mark[] {
  const rows: Mark[] = [];
  teacherClasses.forEach((cls, ti) => {
    const roster = students
      .filter((s) => s.className === cls.className && s.section === cls.section)
      .sort((a, b) => a.roll - b.roll);
    cls.subjects.forEach((subject, si) => {
      const scores =
        ti === 0 && subject === "Mathematics"
          ? tunedScores(roster.length)
          : genericScores(roster.length, ti, si);
      roster.forEach((s, r) =>
        rows.push({ studentId: s.id, examId: "T-HY", subject, marks: scores[r], max: 100 }),
      );
    });
  });
  return rows;
}

/** Half-Yearly sheets are already entered; Main Examination opens blank. */
export const teacherMarks: Mark[] = seededTeacherMarks();
marks.push(...teacherMarks);

export const monthlyAttendance = [
  { m: "Apr", present: 94 }, { m: "May", present: 91 }, { m: "Jun", present: 89 },
  { m: "Jul", present: 96 }, { m: "Aug", present: 93 }, { m: "Sep", present: 95 },
];

export const monthlyCollection = [
  { m: "Apr", v: 780 }, { m: "May", v: 640 }, { m: "Jun", v: 910 },
  { m: "Jul", v: 1240 }, { m: "Aug", v: 860 }, { m: "Sep", v: 1120 },
];

export const gradeOf = (pct: number) =>
  pct >= 91 ? "A1" : pct >= 81 ? "A2" : pct >= 71 ? "B1" : pct >= 61 ? "B2" : pct >= 51 ? "C1" : pct >= 41 ? "C2" : pct >= 33 ? "D" : "E";

export const gradeColor = (g: string) =>
  g.startsWith("A") ? "b-success" : g.startsWith("B") ? "b-info" : g.startsWith("C") ? "b-warning" : "b-danger";

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** "29 September 2026" — for an ISO date (YYYY-MM-DD) or today's date */
export const fmtLong = (d?: string) =>
  new Date(d ? `${d}T00:00:00` : Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export const relTime = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.max(1, Math.round(diff))} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)} hr ago`;
  const days = Math.round(diff / 1440);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fmtDate(d);
};
