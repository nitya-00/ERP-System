import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { demoUsers, schoolStats } from "../data/db";
import { Icon, Logo } from "./ui";

type NavItem = { to: string; label: string; icon: string; badge?: number };

export const NAV: Record<string, { label: string; items: NavItem[] }[]> = {
  admin: [
    {
      label: "Overview",
      items: [
        { to: "/admin", label: "Dashboard", icon: "home" },
        { to: "/admin/admissions", label: "Admissions", icon: "userPlus" },
      ],
    },
    {
      label: "People",
      items: [
        { to: "/admin/students", label: "Students", icon: "users" },
        { to: "/admin/teachers", label: "Teachers & Classes", icon: "cap" },
      ],
    },
    {
      label: "Academics",
      items: [
        { to: "/admin/exams", label: "Exams & Results", icon: "file" },
        { to: "/admin/reports", label: "Reports", icon: "chart" },
      ],
    },
    {
      label: "Finance",
      items: [{ to: "/admin/fees", label: "Fees", icon: "wallet" }],
    },
    {
      label: "Communication",
      items: [
        { to: "/admin/notices", label: "Notices & Communication", icon: "mega" },
        { to: "/admin/notifications", label: "Notifications", icon: "bell", badge: 3 },
      ],
    },
    {
      label: "Platform",
      items: [{ to: "/admin/architecture", label: "Backend Architecture", icon: "shield" }],
    },
  ],
  teacher: [
    {
      label: "My Teaching",
      items: [
        { to: "/teacher", label: "Dashboard", icon: "home" },
        { to: "/teacher/classes", label: "My Classes", icon: "users" },
        { to: "/teacher/attendance", label: "Attendance", icon: "check" },
        { to: "/teacher/marks", label: "Marks", icon: "edit" },
        { to: "/teacher/timetable", label: "Timetable", icon: "calendar" },
      ],
    },
    {
      label: "Communication",
      items: [
        { to: "/teacher/notices", label: "Notices", icon: "mega" },
        { to: "/teacher/notifications", label: "Notifications", icon: "bell" },
      ],
    },
  ],
  parent: [
    {
      label: "My Family",
      items: [
        { to: "/parent", label: "My Children", icon: "home" },
        { to: "/parent/fees", label: "Fees", icon: "wallet" },
        { to: "/parent/attendance", label: "Attendance", icon: "check" },
        { to: "/parent/results", label: "Results", icon: "file" },
      ],
    },
    {
      label: "Communication",
      items: [
        { to: "/parent/notices", label: "Notices", icon: "mega" },
        { to: "/parent/notifications", label: "Notifications", icon: "bell" },
      ],
    },
  ],
  student: [
    {
      label: "My School",
      items: [
        { to: "/student", label: "My Dashboard", icon: "home" },
        { to: "/student/attendance", label: "Attendance", icon: "check" },
        { to: "/student/results", label: "Results", icon: "file" },
        { to: "/student/fees", label: "Fees", icon: "wallet" },
      ],
    },
    {
      label: "Communication",
      items: [
        { to: "/student/notices", label: "Notices", icon: "mega" },
        { to: "/student/notifications", label: "Notifications", icon: "bell" },
      ],
    },
  ],
};

const roleEmoji: Record<string, string> = {
  admin: "👨‍💼",
  teacher: "👩‍🏫",
  parent: "👨‍👩‍👧",
  student: "🎓",
};

const roleHome: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

export default function Layout({ children, title }: { children: ReactNode; title: string }) {
  const { role, logout, notifications } = useApp();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const user = role ? demoUsers[role] : demoUsers.admin;
  const unread = role ? notifications.filter((n) => !n.read).length : 0;
  const groups = role ? NAV[role] : [];

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    document.title = `${title} · ${schoolStats.name} ERP`;
  }, [title]);

  return (
    <div className="shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <Logo block />
          <div>
            <div className="brand-name">{schoolStats.name}</div>
            <div className="brand-sub">{schoolStats.session}</div>
          </div>
        </div>

        <nav className="nav-scroll">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="nav-label">{g.label}</div>
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === roleHome[role ?? "admin"]}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="ico">
                    <Icon name={it.icon} size={17} />
                  </span>
                  <span className="grow">{it.label}</span>
                  {it.to.endsWith("notifications") && unread > 0 && (
                    <span className="count">{unread}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className={`avatar av-${((user.name.charCodeAt(0) % 6) + 1)}`}>
            {user.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </span>
          <div className="meta">
            <div className="who">{user.name}</div>
            <div className="role">
              {roleEmoji[role ?? "admin"]} {role} · {user.subtitle}
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(true)} aria-label="Menu">
            <Icon name="menu" size={18} />
          </button>
          <div className="crumb">
            {schoolStats.name}
            <b>{title}</b>
          </div>
          <div className="topbar-right">
            <div className="search">
              <Icon name="search" size={15} />
              <input placeholder="Search students, receipts…" />
            </div>
            <NavLink
              to={`${roleHome[role ?? "admin"]}/notifications`}
              className="icon-btn"
              title="Notifications"
            >
              <Icon name="bell" size={17} />
              {unread > 0 && <span className="dot" />}
            </NavLink>
            <span className={`avatar sm av-${((user.name.charCodeAt(0) % 6) + 1)}`}>
              {user.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </span>
          </div>
        </header>

        <main className="page">{children}</main>
      </div>

      <Toasts />
    </div>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span className="ok">✓</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
