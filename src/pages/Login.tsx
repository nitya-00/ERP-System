import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { demoUsers, schoolStats, type Role } from "../data/db";
import { Icon } from "../components/ui";

const roles: { id: Role; emoji: string; label: string }[] = [
  { id: "admin", emoji: "👨‍💼", label: "Admin" },
  { id: "teacher", emoji: "👩‍🏫", label: "Teacher" },
  { id: "parent", emoji: "👨‍👩‍👧", label: "Parent" },
  { id: "student", emoji: "🎓", label: "Student" },
];

const home: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState(demoUsers.admin.email);
  const [pw, setPw] = useState(demoUsers.admin.password);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Deep-link shortcut: /login?as=teacher signs straight into that portal.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("as") as Role | null;
    if (wanted && wanted in demoUsers) {
      login(wanted);
      nav(home[wanted], { replace: true });
    }
  }, []);

  const pick = (r: Role) => {
    setRole(r);
    setEmail(demoUsers[r].email);
    setPw(demoUsers[r].password);
    setErr("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = demoUsers[role];
    if (email.trim().toLowerCase() !== u.email || pw !== u.password) {
      setErr("Invalid credentials for this role. Use the demo login below.");
      return;
    }
    setErr("");
    setBusy(true);
    setTimeout(() => {
      login(role);
      nav(home[role]);
    }, 450);
  };

  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="flex">
          <div className="brand-logo" style={{ width: 44, height: 44, fontSize: 19 }}>S</div>
          <div>
            <div style={{ fontWeight: 750, fontSize: 17 }}>{schoolStats.name}</div>
            <div style={{ fontSize: 12.5, color: "#9aa5cc", letterSpacing: ".06em" }}>
              SCHOOL ERP · {schoolStats.session}
            </div>
          </div>
        </div>

        <h2>
          One system for admissions, fees, attendance, exams &amp; school communication.
        </h2>
        <p className="lede">
          Separate, simple dashboards for the admin office, teachers and parents — so everyone
          sees exactly what they need, nothing more.
        </p>

        <div className="hero-feats">
          <div className="hero-feat">
            <span className="n">🏫</span>
            <div>
              <div className="t">Complete school overview</div>
              <div className="d">Students, staff, fees, attendance and results in one screen.</div>
            </div>
          </div>
          <div className="hero-feat">
            <span className="n">📢</span>
            <div>
              <div className="t">Instant school communication</div>
              <div className="d">
                Publish a notice to the entire school, a class, a section, parents or teachers —
                and push it to their devices.
              </div>
            </div>
          </div>
          <div className="hero-feat">
            <span className="n">👥</span>
            <div>
              <div className="t">Role-based portals</div>
              <div className="d">Admin · Teacher · Parent · Student — each with its own dashboard.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-side">
        <form className="login-box" onSubmit={submit}>
          <h1>Welcome back</h1>
          <p className="sub">Choose your portal and sign in to continue.</p>

          <div className="role-grid">
            {roles.map((r) => (
              <button
                type="button"
                key={r.id}
                className={`role-card ${role === r.id ? "on" : ""}`}
                onClick={() => pick(r.id)}
              >
                <div className="em">{r.emoji}</div>
                <div className="nm">{r.label}</div>
              </button>
            ))}
          </div>

          <div className="field">
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              className="input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {err && (
              <div className="hint" style={{ color: "var(--danger)", fontWeight: 600 }}>
                ⚠ {err}
              </div>
            )}
          </div>

          <div className="flex" style={{ justifyContent: "space-between", margin: "4px 0 16px" }}>
            <label className="check">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <span className="small muted" style={{ cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>

          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? "Signing in…" : `Sign in as ${role}`}
            {!busy && <Icon name="arrow" size={16} />}
          </button>

          <div className="demo-box">
            <div className="t">Demo credentials</div>
            <div className="demo-cred">
              <span>
                {roles.find((r) => r.id === role)?.label} login
              </span>
              <code>
                {demoUsers[role].email} / {demoUsers[role].password}
              </code>
            </div>
            <div className="hint" style={{ marginTop: 8 }}>
              Select any role card above — the credentials auto-fill. Just press Sign in.
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
