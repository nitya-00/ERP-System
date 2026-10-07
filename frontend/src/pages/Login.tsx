import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { schoolStats } from "../data/db";
import { Icon, Logo } from "../components/ui";

export default function Login() {
  const { signIn, authStatus, authError } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signIn(email.trim(), pw);
      nav("/", { replace: true });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="flex">
          <Logo size={44} />
          <div>
            <div style={{ fontWeight: 750, fontSize: 15.5, lineHeight: 1.25 }}>{schoolStats.name}</div>
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
          <p className="sub">Sign in with the account provided by your school.</p>

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

          {(err || authError || authStatus === "configuration-required") && (
            <div className="hint" style={{ color: "var(--danger)", fontWeight: 600, margin: "4px 0 16px" }}>
              ⚠ {err || authError || "Authentication setup is required."}
            </div>
          )}

          <button className="btn btn-primary btn-lg btn-block" disabled={busy || authStatus === "configuration-required"}>
            {busy ? "Signing in…" : "Sign in"}
            {!busy && <Icon name="arrow" size={16} />}
          </button>

          <div className="demo-box">
            <div className="t">Secure school account</div>
            <div className="hint" style={{ marginTop: 8 }}>
              Your portal is assigned by the school. The server verifies your account and role after sign-in.
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
