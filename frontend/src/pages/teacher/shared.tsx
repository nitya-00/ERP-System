import { ATTENDANCE_DATES, type ClassRow, type Student } from "../../data/db";

export type Status = "Present" | "Absent" | "Late";
export type StatusOf = (studentId: string, date: string) => Status;

/** rolling window every register / insight is computed over (oldest → today) */
export const HISTORY: string[] = [...ATTENDANCE_DATES];

/** students of a class-section, ordered by roll */
export const rosterOf = (students: Student[], cls?: ClassRow): Student[] =>
  cls
    ? students
        .filter((s) => s.className === cls.className && s.section === cls.section)
        .sort((a, b) => a.roll - b.roll)
    : [];

export function dayCounts(roster: Student[], statusOf: StatusOf, date: string) {
  const out = { present: 0, absent: 0, late: 0, total: roster.length };
  roster.forEach((s) => {
    const st = statusOf(s.id, date);
    if (st === "Present") out.present++;
    else if (st === "Absent") out.absent++;
    else out.late++;
  });
  return out;
}

/** consecutive school days absent, counting back from today */
export function streakOf(studentId: string, statusOf: StatusOf): number {
  let n = 0;
  for (let i = HISTORY.length - 1; i >= 0; i--) {
    if (statusOf(studentId, HISTORY[i]) === "Absent") n++;
    else break;
  }
  return n;
}

/** per-student totals over the rolling window */
export function historyOf(studentId: string, statusOf: StatusOf) {
  let present = 0;
  let absent = 0;
  let late = 0;
  HISTORY.forEach((d) => {
    const st = statusOf(studentId, d);
    if (st === "Present") present++;
    else if (st === "Absent") absent++;
    else late++;
  });
  const pct = HISTORY.length ? Math.round((present / HISTORY.length) * 100) : 0;
  return { present, absent, late, pct, days: HISTORY.length };
}

/** class attendance % over the window (absences count against strength × days) */
export function classPct(roster: Student[], statusOf: StatusOf): number {
  if (!roster.length || !HISTORY.length) return 0;
  const total = roster.reduce((a, s) => a + historyOf(s.id, statusOf).present, 0);
  return Math.round((total / (roster.length * HISTORY.length)) * 100);
}

/* ---------------- Weekly timetable ---------------- */

export const PERIODS = [
  "8:00 – 8:45",
  "8:45 – 9:30",
  "9:35 – 10:20",
  "10:20 – 11:05",
  "11:20 – 12:05",
];

export const WEEK: { day: string; slots: string[] }[] = [
  { day: "Monday", slots: ["Mathematics", "Mathematics", "Science", "English", "Free"] },
  { day: "Tuesday", slots: ["Mathematics", "Free", "Computer Sci.", "Mathematics", "Sports"] },
  { day: "Wednesday", slots: ["English", "Mathematics", "Mathematics", "Free", "Science"] },
  { day: "Thursday", slots: ["Science", "Mathematics", "Free", "English", "Mathematics"] },
  { day: "Friday", slots: ["Mathematics", "Computer Sci.", "Science", "Mathematics", "Assembly"] },
];

/** 0 = Monday … 4 = Friday, -1 outside the teaching week */
export const todayWeekdayIndex = () => {
  const d = new Date().getDay() - 1;
  return d >= 0 && d < WEEK.length ? d : -1;
};

export const todaySlots = () => {
  const i = todayWeekdayIndex();
  return i < 0 ? [] : WEEK[i].slots;
};
