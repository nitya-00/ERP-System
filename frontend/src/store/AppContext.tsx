import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applications as seedApps,
  attendance as seedAttendance,
  classLabel,
  classSections as seedClasses,
  demoParentChildren,
  demoStudentId,
  demoUsers,
  marks as seedMarks,
  seedNotices,
  payments as seedPayments,
  seedNotifications,
  students as seedStudents,
  type AppNotification,
  type Application,
  type AttendanceRow,
  type ClassRow,
  type Mark,
  type Notice,
  type Payment,
  type Role,
  type Student,
} from "../data/db";
import { getCurrentIdentity, type ApiIdentity } from "../api/auth";
import { getSupabaseClient, isAuthConfigured } from "../lib/supabase";

/* ---------------------------------------------------------
   Storage helpers
--------------------------------------------------------- */
const KEY = "school-erp-v3";

type Persisted = {
  role: Role | null;
  notices: Notice[];
  notifications: AppNotification[];
  apps: Application[];
  attendance: AttendanceRow[];
  classes: ClassRow[];
  marks: Mark[];
  payments: Payment[];
  students: Student[];
};

const initial: Persisted = {
  role: null,
  notices: seedNotices,
  notifications: seedNotifications,
  apps: seedApps,
  attendance: seedAttendance,
  classes: seedClasses,
  marks: seedMarks,
  payments: seedPayments,
  students: seedStudents,
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

/* ---------------------------------------------------------
   Context
--------------------------------------------------------- */
export type Toast = { id: number; text: string };

type Ctx = {
  role: Role | null;
  authStatus: "loading" | "authenticated" | "unauthenticated" | "configuration-required";
  authError: string | null;
  identity: ApiIdentity | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  students: Student[];
  notices: Notice[];
  notifications: AppNotification[];
  apps: Application[];
  attendance: AttendanceRow[];
  classes: ClassRow[];
  marks: Mark[];
  payments: Payment[];

  publishNotice: (n: Omit<Notice, "id" | "date" | "author" | "authorRole">) => void;
  markNoticeRead: (id: string) => void;
  markAllNoticesRead: () => void;
  toggleNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;

  setAttendance: (rows: { studentId: string; date: string; status: AttendanceRow["status"] }[]) => void;
  saveMarks: (rows: Mark[]) => void;
  addStudent: (s: Omit<Student, "id" | "admNo" | "photoClass">) => void;
  decideApplication: (id: string, status: Application["status"]) => void;
  addPayment: (p: Omit<Payment, "id" | "receiptNo">) => void;
  assignClassTeacher: (classId: string, teacherName: string) => void;

  toasts: Toast[];
  toast: (text: string) => void;
  reset: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

type AuthState = {
  status: Ctx["authStatus"];
  role: Role | null;
  identity: ApiIdentity | null;
  error: string | null;
};

function portalRole(identity: ApiIdentity): Role {
  const role = identity.roles.find((value): value is "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" =>
    ["ADMIN", "TEACHER", "PARENT", "STUDENT"].includes(value),
  );
  if (!role) throw new Error("Your account has no supported ERP portal role.");
  return role.toLowerCase() as Role;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auth, setAuth] = useState<AuthState>(() => isAuthConfigured
    ? { status: "loading", role: null, identity: null, error: null }
    : { status: "configuration-required", role: null, identity: null, error: "Authentication has not been configured yet." });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota — ignore */
    }
  }, [state]);

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const patch = useCallback((fn: (s: Persisted) => Persisted) => setState((s) => fn(s)), []);

  const loadIdentity = useCallback(async (accessToken: string) => {
    const identity = await getCurrentIdentity(accessToken);
    setAuth({ status: "authenticated", role: portalRole(identity), identity, error: null });
  }, []);

  useEffect(() => {
    if (!isAuthConfigured) return;
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setAuth({ status: "unauthenticated", role: null, identity: null, error: error?.message ?? null });
        return;
      }
      loadIdentity(data.session.access_token).catch((identityError: unknown) => {
        setAuth({ status: "unauthenticated", role: null, identity: null, error: identityError instanceof Error ? identityError.message : "Unable to load your ERP account." });
      });
    });
  }, [loadIdentity]);

  const value = useMemo<Ctx>(() => {
    const role = auth.role;
    const visibleNotices = role
      ? state.notices.filter((n) => n.forRoles.includes(role))
      : [];
    const visibleNotifs = role
      ? state.notifications.filter((n) => n.forRoles.includes(role))
      : [];

    return {
      role,
      authStatus: auth.status,
      authError: auth.error,
      identity: auth.identity,
      signIn: async (email, password) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) throw new Error(error?.message ?? "Unable to sign in.");
        await loadIdentity(data.session.access_token);
      },
      logout: async () => {
        if (isAuthConfigured) await getSupabaseClient().auth.signOut();
        setAuth({ status: isAuthConfigured ? "unauthenticated" : "configuration-required", role: null, identity: null, error: null });
      },

      students: state.students,
      notices: visibleNotices,
      notifications: visibleNotifs,
      apps: state.apps,
      attendance: state.attendance,
      classes: state.classes,
      marks: state.marks,
      payments: state.payments,

      publishNotice: (n) => {
        const now = new Date().toISOString();
        const author =
          role === "admin"
            ? demoUsers.admin.name
            : role === "teacher"
              ? demoUsers.teacher.name
              : demoUsers[role ?? "admin"].name;
        const notice: Notice = {
          ...n,
          id: `N-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          date: now,
          author,
          authorRole: role ?? "admin",
        };
        const extra: AppNotification[] = n.push
          ? [
              {
                id: `NT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                title: n.title,
                body: n.body.length > 130 ? n.body.slice(0, 127) + "…" : n.body,
                kind: n.priority === "Urgent" ? "alert" : n.priority === "Important" ? "reminder" : "info",
                date: now,
                forRoles: n.forRoles,
                read: false,
              },
            ]
          : [];
        patch((s) => ({
          ...s,
          notices: [notice, ...s.notices],
          notifications: n.push ? [...extra, ...s.notifications] : s.notifications,
        }));
        toast(n.push ? "Notice published & push notification sent" : "Notice published");
      },
      markNoticeRead: () => undefined,
      markAllNoticesRead: () => undefined,
      toggleNotifRead: (id) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: !n.read } : n,
          ),
        })),
      markAllNotifsRead: () =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            (role && n.forRoles.includes(role) && !n.read) ? { ...n, read: true } : n,
          ),
        })),

      setAttendance: (rows) => {
        patch((s) => {
          const map = new Map(
            s.attendance.map((a) => [`${a.studentId}|${a.date}`, a]),
          );
          rows.forEach((r) => {
            const k = `${r.studentId}|${r.date}`;
            const prev = map.get(k);
            if (prev) map.set(k, { ...prev, status: r.status });
            else map.set(k, { ...r });
          });
          return { ...s, attendance: [...map.values()] };
        });
        toast("Attendance saved");
      },
      saveMarks: (rows) => {
        patch((s) => {
          const map = new Map(
            s.marks.map((m) => [`${m.studentId}|${m.examId}|${m.subject}`, m]),
          );
          rows.forEach((m) => map.set(`${m.studentId}|${m.examId}|${m.subject}`, m));
          return { ...s, marks: [...map.values()] };
        });
        toast("Marks saved & published");
      },
      addStudent: (s2) => {
        patch((s) => ({
          ...s,
          students: [
            {
              ...s2,
              id: `STU${1000 + s.students.length + 1}`,
              admNo: `ADM-${2400 + s.students.length + 1}`,
              photoClass: (s.students.length % 6) + 1,
            },
            ...s.students,
          ],
        }));
        toast("Student record created");
      },
      decideApplication: (id, status) => {
        patch((s) => ({
          ...s,
          apps: s.apps.map((a) => (a.id === id ? { ...a, status } : a)),
        }));
        toast(`Application marked ${status}`);
      },
      addPayment: (p) => {
        patch((s) => ({
          ...s,
          payments: [
            {
              ...p,
              id: `PAY-${Math.random().toString(36).slice(2, 7)}`,
              receiptNo: `RCT-${20260 + s.payments.length + 1}`,
            },
            ...s.payments,
          ],
        }));
        toast("Payment recorded & receipt generated");
      },
      assignClassTeacher: (classId, teacherName) => {
        const row = state.classes.find((c) => c.id === classId);
        const label = row ? classLabel(row.className, row.section) : classId;
        patch((s) => ({
          ...s,
          classes: s.classes.map((c) =>
            c.id === classId ? { ...c, classTeacher: teacherName } : c,
          ),
          notifications: [
            {
              id: `NT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
              title: `You have been assigned to ${label}`,
              body: `${teacherName} is now the class teacher of ${label}.`,
              kind: "info",
              date: new Date().toISOString(),
              forRoles: ["teacher"],
              read: false,
            },
            ...s.notifications,
          ],
        }));
        toast(`${teacherName} assigned to ${label} · notification sent`);
      },

      toasts,
      toast,
      reset: () => setState({ ...initial, role: null }),
    };
  }, [state, auth, toasts, toast, patch, loadIdentity]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}

export { demoParentChildren, demoStudentId, demoUsers };
