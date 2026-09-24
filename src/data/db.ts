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
  students: number;
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

export const CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];
export const SECTIONS = ["A", "B", "C"];
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
  "221, Sunrise Apartments",
  "88, Nehru Nagar",
  "3, Palm Grove Enclave",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const students: Student[] = Array.from({ length: 46 }, (_, i) => {
  const cls = pick(
    ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    i,
  );
  const section = pick(SECTIONS, Math.floor(i / 10));
  const name = `${pick(first, i * 3)} ${pick(last, i * 5)}`;
  const parent = `${pick(["Mr.", "Mrs."], i)} ${pick(last, i * 5)}`;
  return {
    id: `STU${String(1001 + i)}`,
    admNo: `ADM-${2400 + i}`,
    name,
    className: cls,
    section,
    roll: (i % 18) + 1,
    gender: i % 2 === 0 ? "Male" : "Female",
    dob: `${2010 + (i % 9)}-0${(i % 9) + 1}-1${i % 9}`,
    bloodGroup: pick(["A+", "B+", "O+", "AB+", "O-"], i),
    phone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
    address: pick(streets, i),
    parentName: parent,
    parentPhone: `+91 99${String(10000000 + i * 911).slice(0, 8)}`,
    parentEmail: `${pick(first, i * 3).toLowerCase()}.${pick(last, i * 5).toLowerCase()}@gmail.com`,
    admissionDate: `2024-0${(i % 8) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    status: i % 17 === 0 ? "Pending" : i % 23 === 0 ? "Inactive" : "Active",
    photoClass: (i % 6) + 1,
  };
});

export const teachers: Teacher[] = [
  { id: "TCH01", name: "Anjali Deshpande", subject: "Mathematics", classes: ["Class 9", "Class 10"], phone: "+91 98200 11223", email: "anjali.d@school.edu", experience: 11, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 2 },
  { id: "TCH02", name: "Rajesh Kulkarni", subject: "Science", classes: ["Class 8", "Class 9", "Class 10"], phone: "+91 98200 22334", email: "rajesh.k@school.edu", experience: 14, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 5 },
  { id: "TCH03", name: "Priya Menon", subject: "English", classes: ["Class 6", "Class 7"], phone: "+91 98200 33445", email: "priya.m@school.edu", experience: 8, qualification: "M.A, B.Ed", status: "Active", photoClass: 3 },
  { id: "TCH04", name: "Suresh Iyer", subject: "Social Science", classes: ["Class 7", "Class 8"], phone: "+91 98200 44556", email: "suresh.i@school.edu", experience: 9, qualification: "M.A, B.Ed", status: "Active", photoClass: 1 },
  { id: "TCH05", name: "Kavita Sharma", subject: "Hindi", classes: ["Class 5", "Class 6"], phone: "+91 98200 55667", email: "kavita.s@school.edu", experience: 6, qualification: "M.A, B.Ed", status: "On Leave", photoClass: 6 },
  { id: "TCH06", name: "Deepak Rao", subject: "Computer Science", classes: ["Class 9", "Class 10"], phone: "+91 98200 66778", email: "deepak.r@school.edu", experience: 5, qualification: "MCA", status: "Active", photoClass: 4 },
  { id: "TCH07", name: "Meenakshi Nair", subject: "Science", classes: ["Class 6", "Class 7"], phone: "+91 98200 77889", email: "meenakshi.n@school.edu", experience: 12, qualification: "M.Sc, B.Ed", status: "Active", photoClass: 2 },
  { id: "TCH08", name: "Farhan Qureshi", subject: "Physical Education", classes: ["All Classes"], phone: "+91 98200 88990", email: "farhan.q@school.edu", experience: 7, qualification: "B.P.Ed", status: "Active", photoClass: 5 },
];

export const classSections: ClassRow[] = [
  { id: "C1A", className: "Class 1", section: "A", classTeacher: "Kavita Sharma", students: 32, room: "G-01", subjects: ["English", "Hindi", "Mathematics", "Art & Craft"] },
  { id: "C2A", className: "Class 2", section: "A", classTeacher: "Priya Menon", students: 30, room: "G-04", subjects: ["English", "Hindi", "Mathematics", "Science"] },
  { id: "C5A", className: "Class 5", section: "A", classTeacher: "Kavita Sharma", students: 34, room: "F-02", subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "C6A", className: "Class 6", section: "A", classTeacher: "Priya Menon", students: 36, room: "S-11", subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "C7A", className: "Class 7", section: "A", classTeacher: "Suresh Iyer", students: 35, room: "S-13", subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "C8B", className: "Class 8", section: "B", classTeacher: "Rajesh Kulkarni", students: 33, room: "S-15", subjects: ["English", "Hindi", "Mathematics", "Science", "Computer Science"] },
  { id: "C9A", className: "Class 9", section: "A", classTeacher: "Anjali Deshpande", students: 38, room: "U-02", subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"] },
  { id: "C10A", className: "Class 10", section: "A", classTeacher: "Anjali Deshpande", students: 40, room: "U-05", subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"] },
];

export const applications: Application[] = [
  { id: "APP-501", name: "Aadhya Kulkarni", applyingFor: "Class 1 - A", parentName: "Mr. Sunil Kulkarni", parentPhone: "+91 98210 45671", prevSchool: "Little Angels Pre-School", date: "2026-09-21", status: "New", photoClass: 2 },
  { id: "APP-502", name: "Arnav Bhatt", applyingFor: "Class 6 - A", parentName: "Mrs. Neha Bhatt", parentPhone: "+91 98210 45672", prevSchool: "St. Mary's High School", date: "2026-09-20", status: "Under Review", photoClass: 5 },
  { id: "APP-503", name: "Siya Ramachandran", applyingFor: "Class 9 - A", parentName: "Mr. Karthik R.", parentPhone: "+91 98210 45673", prevSchool: "Kendriya Vidyalaya", date: "2026-09-19", status: "Approved", photoClass: 3 },
  { id: "APP-504", name: "Rehan Shaikh", applyingFor: "Class 3 - B", parentName: "Mrs. Farah Shaikh", parentPhone: "+91 98210 45674", prevSchool: "Mount Litera Zee School", date: "2026-09-18", status: "Approved", photoClass: 4 },
  { id: "APP-505", name: "Tanish Grover", applyingFor: "Class 10 - A", parentName: "Mr. Amit Grover", parentPhone: "+91 98210 45675", prevSchool: "Delhi Public School", date: "2026-09-17", status: "Under Review", photoClass: 1 },
  { id: "APP-506", name: "Myra Chauhan", applyingFor: "LKG - A", parentName: "Mrs. Ritu Chauhan", parentPhone: "+91 98210 45676", prevSchool: "Tiny Tots Nursery", date: "2026-09-16", status: "Rejected", photoClass: 6 },
  { id: "APP-507", name: "Ishaan Pillai", applyingFor: "Class 4 - A", parentName: "Mr. Venkat Pillai", parentPhone: "+91 98210 45677", prevSchool: "DAV Public School", date: "2026-09-15", status: "New", photoClass: 2 },
  { id: "APP-508", name: "Aditi Rane", applyingFor: "Class 2 - A", parentName: "Mrs. Shalini Rane", parentPhone: "+91 98210 45678", prevSchool: "Kidzee", date: "2026-09-14", status: "New", photoClass: 5 },
];

export const feeStructure = [
  { className: "Nursery – UKG", tuition: 18000, transport: 9000, lab: 0, exam: 1500, total: 28500 },
  { className: "Class 1 – 5", tuition: 26000, transport: 10000, lab: 2000, exam: 2000, total: 40000 },
  { className: "Class 6 – 8", tuition: 32000, transport: 11000, lab: 4000, exam: 2500, total: 49500 },
  { className: "Class 9 – 10", tuition: 40000, transport: 12000, lab: 6000, exam: 3000, total: 61000 },
];

export const payments: Payment[] = students.slice(0, 34).map((s, i) => ({
  id: `PAY${100 + i}`,
  receiptNo: `RCT-${20260 + i}`,
  studentId: s.id,
  amount: feeStructure[Math.min(3, Math.floor(i / 9))].total,
  date: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
  mode: (["UPI", "Cash", "Card", "Bank Transfer"] as const)[i % 4],
  head: ["Tuition Fee — Term 1", "Tuition Fee — Term 2", "Transport Fee", "Annual Charges"][i % 4],
  status: i % 5 === 0 ? "Pending" : i % 11 === 0 ? "Overdue" : "Paid",
}));

export const exams: Exam[] = [
  { id: "EX-01", name: "Unit Test 1", term: "Term 1", className: "Class 10", from: "2026-07-14", to: "2026-07-22", status: "Completed", maxMarks: 50, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "EX-02", name: "Half Yearly Examination", term: "Term 2", className: "Class 10", from: "2026-09-28", to: "2026-10-10", status: "Upcoming", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"] },
  { id: "EX-03", name: "Unit Test 1", term: "Term 1", className: "Class 9", from: "2026-07-15", to: "2026-07-21", status: "Completed", maxMarks: 50, subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"] },
  { id: "EX-04", name: "Half Yearly Examination", term: "Term 2", className: "Class 8", from: "2026-09-29", to: "2026-10-09", status: "In Progress", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science"] },
  { id: "EX-05", name: "Periodic Assessment", term: "Term 1", className: "Class 7", from: "2026-08-03", to: "2026-08-07", status: "Completed", maxMarks: 40, subjects: ["English", "Mathematics", "Science"] },
  { id: "EX-06", name: "Half Yearly Examination", term: "Term 2", className: "Class 6", from: "2026-10-01", to: "2026-10-08", status: "Upcoming", maxMarks: 100, subjects: ["English", "Hindi", "Mathematics", "Science"] },
];

function seededMarks(): Mark[] {
  const rows: Mark[] = [];
  const done = exams.filter((e) => e.status !== "Upcoming");
  students.forEach((s, si) => {
    done
      .filter((e) => e.className === s.className)
      .forEach((e) => {
        e.subjects.forEach((sub, k) => {
          const base = 55 + ((si * 7 + k * 13) % 42);
          rows.push({
            studentId: s.id,
            examId: e.id,
            subject: sub,
            marks: Math.min(e.maxMarks, base),
            max: e.maxMarks,
          });
        });
      });
  });
  return rows;
}
export const marks: Mark[] = seededMarks();

function seededAttendance(): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  const days = ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"];
  students.forEach((s, si) => {
    days.forEach((d, di) => {
      const n = (si * 3 + di * 5) % 100;
      rows.push({
        studentId: s.id,
        date: d,
        status: n < 8 ? "Absent" : n < 14 ? "Late" : "Present",
      });
    });
  });
  return rows;
}
export const attendance: AttendanceRow[] = seededAttendance();
export const ATTENDANCE_DATES = [
  "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
  "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24",
];

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
    date: "2026-09-24T08:15:00",
    push: true,
    forRoles: ["admin", "teacher", "parent", "student"],
  },
  {
    id: "N-02",
    title: "Half Yearly Examination Date Sheet Released",
    body: "The date sheet for Half Yearly Examinations (Term 2) has been published. Exams begin 28 September 2026. Students must reach the examination hall 15 minutes before the reporting time with their ID card.",
    audience: "Class",
    target: "Class 9 & Class 10",
    priority: "Important",
    author: "Examination Cell",
    authorRole: "admin",
    date: "2026-09-22T11:40:00",
    push: true,
    forRoles: ["admin", "teacher", "parent", "student"],
  },
  {
    id: "N-03",
    title: "PTM — Saturday, 27 September",
    body: "Parent–Teacher Meeting for all sections will be held on Saturday from 9:00 AM to 1:00 PM. Kindly collect your ward's progress report from the class teacher.",
    audience: "Parents",
    target: "All parents",
    priority: "Important",
    author: "Class Teachers",
    authorRole: "admin",
    date: "2026-09-21T09:00:00",
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
    date: "2026-09-20T16:20:00",
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
    date: "2026-09-19T13:05:00",
    push: true,
    forRoles: ["admin", "teacher", "student"],
  },
];

export const seedNotifications: AppNotification[] = [
  { id: "NT-01", title: "School closed tomorrow", body: "Heavy rainfall — school will remain closed on 25 September for all classes.", kind: "alert", date: "2026-09-24T08:16:00", forRoles: ["admin", "teacher", "parent", "student"], read: false },
  { id: "NT-02", title: "Fee payment pending", body: "Term-2 tuition fee for 6 students is overdue. Please review the Fees module.", kind: "reminder", date: "2026-09-24T07:30:00", forRoles: ["admin"], read: false },
  { id: "NT-03", title: "Attendance below 75%", body: "3 students in Class 9-A have fallen below the 75% attendance threshold.", kind: "alert", date: "2026-09-23T17:45:00", forRoles: ["admin", "teacher"], read: false },
  { id: "NT-04", title: "Marks published", body: "Unit Test 1 results for Class 10 are now published and visible to parents.", kind: "success", date: "2026-09-22T12:10:00", forRoles: ["admin", "teacher", "parent", "student"], read: true },
  { id: "NT-05", title: "New admission applications", body: "3 new applications received today. Review them in the Admissions module.", kind: "info", date: "2026-09-22T09:05:00", forRoles: ["admin"], read: true },
  { id: "NT-06", title: "PTM this Saturday", body: "Parent–Teacher Meeting on 27 September, 9:00 AM – 1:00 PM.", kind: "reminder", date: "2026-09-21T09:10:00", forRoles: ["parent", "student"], read: false },
  { id: "NT-07", title: "Attendance marked", body: "Attendance for Class 10-A has been submitted for 24 September.", kind: "success", date: "2026-09-24T09:02:00", forRoles: ["teacher"], read: false },
];

export const demoUsers: Record<Role, { name: string; email: string; password: string; subtitle: string }> = {
  admin: { name: "Vandana Rao", email: "admin@school.edu", password: "admin123", subtitle: "Principal / Administrator" },
  teacher: { name: "Anjali Deshpande", email: "teacher@school.edu", password: "teach123", subtitle: "Mathematics — Class 9 & 10" },
  parent: { name: "Sunil Kulkarni", email: "parent@school.edu", password: "parent123", subtitle: "Parent of 2 children" },
  student: { name: "Aarav Sharma", email: "student@school.edu", password: "study123", subtitle: "Class 10 — Section A" },
};

/* Demo linkage: which students belong to the demo parent / student login */
export const demoParentChildren = ["STU1001", "STU1012"];
export const demoStudentId = "STU1004";

export const schoolStats = {
  name: "Sunrise Public School",
  session: "2026 – 2027",
  address: "Sector 21, Rohini, New Delhi — 110086",
  phone: "+91 11 4567 8900",
  email: "office@sunrise.edu.in",
};

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

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export const relTime = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 60) return `${Math.max(1, Math.round(diff))} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)} hr ago`;
  const days = Math.round(diff / 1440);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fmtDate(d);
};
