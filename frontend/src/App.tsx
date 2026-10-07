import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Admissions from "./pages/admin/Admissions";
import Students from "./pages/admin/Students";
import TeachersClasses from "./pages/admin/Teachers";
import Fees from "./pages/admin/Fees";
import Exams from "./pages/admin/Exams";
import Reports from "./pages/admin/Reports";
import Notices from "./pages/Notices";
import Notifications from "./pages/Notifications";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherClasses from "./pages/teacher/MyClasses";
import TeacherClassDetail from "./pages/teacher/ClassDetail";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherMarks from "./pages/teacher/Marks";
import TeacherTimetable from "./pages/teacher/Timetable";
import MyChildren from "./pages/parent/MyChildren";
import ParentFees from "./pages/parent/Fees";
import ParentAttendance from "./pages/parent/Attendance";
import ParentResults from "./pages/parent/Results";
import StudentHome from "./pages/student/Home";
import { useApp } from "./store/AppContext";
import { classSections as allClasses, classLabel, type Role } from "./data/db";

const titles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/admissions": "Admissions",
  "/admin/students": "Students",
  "/admin/teachers": "Teachers & Classes",
  "/admin/fees": "Fees",
  "/admin/exams": "Exams & Results",
  "/admin/reports": "Reports",
  "/admin/notices": "Notices & Communication",
  "/admin/notifications": "Notifications",

  "/teacher": "Dashboard",
  "/teacher/classes": "My Classes",
  "/teacher/attendance": "Attendance",
  "/teacher/marks": "Marks",
  "/teacher/timetable": "Timetable",
  "/teacher/notices": "Notices",
  "/teacher/notifications": "Notifications",

  "/parent": "My Children",
  "/parent/fees": "Fees",
  "/parent/attendance": "Attendance",
  "/parent/results": "Results",
  "/parent/notices": "Notices",
  "/parent/notifications": "Notifications",

  "/student": "My Dashboard",
  "/student/attendance": "Attendance",
  "/student/results": "Results",
  "/student/fees": "Fees",
  "/student/notices": "Notices",
  "/student/notifications": "Notifications",
};

/** routes that are not statically mapped (e.g. a single class) get a live title */
function titleFor(path: string): string {
  const mapped = titles[path];
  if (mapped) return mapped;
  const m = path.match(/^\/teacher\/classes\/(.+)$/);
  if (m) {
    const cls = allClasses.find((c: { id: string }) => c.id === m[1]);
    if (cls) return classLabel(cls.className, cls.section);
    return "My Classes";
  }
  return "Dashboard";
}

function Portal({ role }: { role: Role }) {
  const { role: current, login } = useApp();
  const loc = useLocation();
  const wanted = new URLSearchParams(loc.search).get("as") as Role | null;

  // Demo deep-link: /admin/fees?as=admin opens that portal without the login form.
  useEffect(() => {
    if (wanted && wanted === role && current !== wanted) login(wanted);
  }, [wanted, role, current, login]);

  if (current !== role && wanted !== role) return <Navigate to="/login" replace />;

  return (
    <Layout title={titleFor(loc.pathname)}>
      <Outlet />
    </Layout>
  );
}

function Home() {
  const { role } = useApp();
  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}`} replace />;
}

export default function App() {
  const { role } = useApp();

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={role ? <Navigate to={`/${role}`} replace /> : <Login />}
      />

      <Route path="/admin" element={<Portal role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<TeachersClasses />} />
        <Route path="fees" element={<Fees />} />
        <Route path="exams" element={<Exams />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notices" element={<Notices title="Notices & Communication" />} />
        <Route path="notifications" element={<Notifications title="Notifications" />} />
      </Route>

      <Route path="/teacher" element={<Portal role="teacher" />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="classes/:classId" element={<TeacherClassDetail />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="marks" element={<TeacherMarks />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="notices" element={<Notices title="Notices" />} />
        <Route path="notifications" element={<Notifications title="Notifications" />} />
      </Route>

      <Route path="/parent" element={<Portal role="parent" />}>
        <Route index element={<MyChildren />} />
        <Route path="fees" element={<ParentFees />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="results" element={<ParentResults />} />
        <Route path="notices" element={<Notices title="Notices" />} />
        <Route path="notifications" element={<Notifications title="Notifications" />} />
      </Route>

      <Route path="/student" element={<Portal role="student" />}>
        <Route index element={<StudentHome />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="results" element={<ParentResults />} />
        <Route path="fees" element={<ParentFees />} />
        <Route path="notices" element={<Notices title="Notices" />} />
        <Route path="notifications" element={<Notifications title="Notifications" />} />
      </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
