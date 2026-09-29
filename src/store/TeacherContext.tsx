import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useApp } from "./AppContext";
import {
  demoUsers,
  teachers,
  type AttendanceRow,
  type ClassRow,
  type Mark,
} from "../data/db";

export type AttendanceStatus = AttendanceRow["status"];
export type ContactStatus = "Not Contacted" | "Contacted";
export type ContactLog = { status: ContactStatus; note: string };

/* The signed-in demo teacher — the portal only ever shows their own classes. */
export const me = teachers.find((t) => t.email === demoUsers.teacher.email) ?? teachers[0];

type TeacherCtx = {
  /** class-first: the class every attendance / marks / timetable screen is scoped to */
  classId: string;
  setClassId: (id: string) => void;
  /** only the classes assigned to this teacher */
  classes: ClassRow[];

  /* ---- attendance (live draft, committed with saveDay) ---- */
  statusOf: (studentId: string, date: string) => AttendanceStatus;
  setStatus: (studentId: string, date: string, status: AttendanceStatus) => void;
  setMany: (studentIds: string[], date: string, status: AttendanceStatus) => void;
  isSaved: (date: string) => boolean;
  saveDay: (rows: { studentId: string; date: string; status: AttendanceStatus }[]) => void;

  /* ---- marks (live draft, committed with publishMarks) ---- */
  markOf: (studentId: string, examId: string, subject: string) => number | null;
  setMark: (
    studentId: string,
    examId: string,
    subject: string,
    value: string,
    max: number,
  ) => void;
  publishMarks: (rows: Mark[]) => void;

  /* ---- parent contact log (mock/local state) ---- */
  contactOf: (studentId: string) => ContactLog;
  markContacted: (studentId: string) => void;
  saveNote: (studentId: string, note: string) => void;
};

const TeacherCtx = createContext<TeacherCtx | null>(null);

const key = (...parts: string[]) => parts.join("|");

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { classes, attendance, marks, setAttendance, saveMarks, toast } = useApp();

  const [classId, setClassId] = useState<string>(
    () => classes.find((c) => me.classes.includes(c.className))?.id ?? classes[0]?.id ?? "",
  );
  /* date -> { studentId: status } — pending register edits */
  const [dayEdits, setDayEdits] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  /* "studentId|examId|subject" -> raw input value */
  const [markEdits, setMarkEdits] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Record<string, ContactLog>>({});

  const attIndex = useMemo(() => {
    const m = new Map<string, AttendanceStatus>();
    attendance.forEach((a) => m.set(key(a.studentId, a.date), a.status));
    return m;
  }, [attendance]);

  const markIndex = useMemo(() => {
    const m = new Map<string, number>();
    marks.forEach((x) => m.set(key(x.studentId, x.examId, x.subject), x.marks));
    return m;
  }, [marks]);

  const myClasses = useMemo(
    () => classes.filter((c) => me.classes.includes(c.className)),
    [classes],
  );

  const statusOf = useCallback(
    (studentId: string, date: string) =>
      dayEdits[date]?.[studentId] ?? attIndex.get(key(studentId, date)) ?? "Present",
    [dayEdits, attIndex],
  );

  const setStatus = useCallback((studentId: string, date: string, status: AttendanceStatus) => {
    setDayEdits((d) => ({ ...d, [date]: { ...(d[date] ?? {}), [studentId]: status } }));
  }, []);

  const setMany = useCallback((studentIds: string[], date: string, status: AttendanceStatus) => {
    setDayEdits((d) => {
      const day = { ...(d[date] ?? {}) };
      studentIds.forEach((id) => (day[id] = status));
      return { ...d, [date]: day };
    });
  }, []);

  const isSaved = useCallback((date: string) => Object.keys(dayEdits[date] ?? {}).length === 0, [dayEdits]);

  const saveDay = useCallback(
    (rows: { studentId: string; date: string; status: AttendanceStatus }[]) => {
      if (rows.length === 0) return;
      const date = rows[0].date;
      setAttendance(rows);
      setDayEdits((d) => {
        if (!d[date]) return d;
        const next = { ...d };
        delete next[date];
        return next;
      });
    },
    [setAttendance],
  );

  const markOf = useCallback(
    (studentId: string, examId: string, subject: string) => {
      const k = key(studentId, examId, subject);
      if (k in markEdits) return markEdits[k] === "" ? null : Number(markEdits[k]);
      return markIndex.get(k) ?? null;
    },
    [markEdits, markIndex],
  );

  const setMark = useCallback(
    (studentId: string, examId: string, subject: string, value: string, max: number) => {
      const n = value === "" ? NaN : Number(value);
      const clean = Number.isNaN(n) ? "" : String(Math.max(0, Math.min(max, n)));
      setMarkEdits((m) => ({ ...m, [key(studentId, examId, subject)]: clean }));
    },
    [],
  );

  const publishMarks = useCallback(
    (rows: Mark[]) => {
      if (rows.length === 0) {
        toast("Enter at least one mark first");
        return;
      }
      saveMarks(rows);
      setMarkEdits((m) => {
        const next = { ...m };
        rows.forEach((r) => delete next[key(r.studentId, r.examId, r.subject)]);
        return next;
      });
    },
    [saveMarks, toast],
  );

  const contactOf = useCallback(
    (studentId: string) => contacts[studentId] ?? { status: "Not Contacted", note: "" },
    [contacts],
  );

  const markContacted = useCallback(
    (studentId: string) => {
      setContacts((c) => ({ ...c, [studentId]: { status: "Contacted", note: c[studentId]?.note ?? "" } }));
      toast("Parent contacted · status updated");
    },
    [toast],
  );

  const saveNote = useCallback(
    (studentId: string, note: string) => {
      setContacts((c) => ({
        ...c,
        [studentId]: { status: c[studentId]?.status ?? "Not Contacted", note },
      }));
      toast("Note saved to student record");
    },
    [toast],
  );

  const value = useMemo<TeacherCtx>(
    () => ({
      classId,
      setClassId,
      classes: myClasses,
      statusOf,
      setStatus,
      setMany,
      isSaved,
      saveDay,
      markOf,
      setMark,
      publishMarks,
      contactOf,
      markContacted,
      saveNote,
    }),
    [
      classId,
      myClasses,
      statusOf,
      setStatus,
      setMany,
      isSaved,
      saveDay,
      markOf,
      setMark,
      publishMarks,
      contactOf,
      markContacted,
      saveNote,
    ],
  );

  return <TeacherCtx.Provider value={value}>{children}</TeacherCtx.Provider>;
}

export function useTeacher() {
  const c = useContext(TeacherCtx);
  if (!c) throw new Error("useTeacher must be used inside TeacherProvider");
  return c;
}
