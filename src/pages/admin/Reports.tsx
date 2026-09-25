import { useState } from "react";
import { useApp } from "../../store/AppContext";
import {
  attendance,
  classSections,
  feeStructure,
  inr,
  monthlyAttendance,
  monthlyCollection,
  payments,
  students,
} from "../../data/db";
import { Bars, Badge, Card, Donut, Icon, PageHead, Stat } from "../../components/ui";

const reports = [
  { id: "attendance", icon: "✅", title: "Attendance Report", desc: "Daily, monthly and class-wise attendance with defaulters list." },
  { id: "fees", icon: "💰", title: "Fee Collection Report", desc: "Collections, outstanding dues and mode-wise breakdown." },
  { id: "students", icon: "👨‍🎓", title: "Student Strength Report", desc: "Enrolment by class, gender and admission status." },
  { id: "academic", icon: "📈", title: "Academic Performance Report", desc: "Subject averages, toppers and pass percentage." },
];

export default function Reports() {
  const { toast, notices } = useApp();
  const [active, setActive] = useState("attendance");

  const today = "2026-09-24";
  const todays = attendance.filter((a) => a.date === today);
  const present = todays.filter((a) => a.status === "Present").length;
  const absent = todays.filter((a) => a.status === "Absent").length;
  const late = todays.filter((a) => a.status === "Late").length;

  const collected = payments.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const dues = payments.filter((p) => p.status !== "Paid").reduce((a, b) => a + b.amount, 0);

  const defaulters = students
    .map((s) => {
      const rows = attendance.filter((a) => a.studentId === s.id);
      const p = rows.filter((r) => r.status === "Present").length;
      return { s, pct: rows.length ? Math.round((p / rows.length) * 100) : 0 };
    })
    .filter((r) => r.pct < 82)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 8);

  return (
    <>
      <PageHead
        title="Reports"
        desc="Generate, preview and export operational reports for the management."
        actions={
          <button className="btn btn-primary" onClick={() => toast("Report queued — download will start shortly")}>
            <Icon name="download" size={16} /> Export current report
          </button>
        }
      />

      <div className="grid g-4">
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className="card"
            style={{
              textAlign: "left",
              cursor: "pointer",
              padding: 18,
              borderColor: active === r.id ? "var(--primary)" : undefined,
              boxShadow: active === r.id ? "0 0 0 3px rgba(79,70,229,.12), var(--shadow)" : undefined,
            }}
          >
            <div style={{ fontSize: 24 }}>{r.icon}</div>
            <div className="strong" style={{ marginTop: 8 }}>{r.title}</div>
            <div className="small muted" style={{ marginTop: 4 }}>{r.desc}</div>
          </button>
        ))}
      </div>

      {active === "attendance" && (
        <>
          <div className="grid g-4 mt">
            <Stat label="Present Today" value={present} icon="check" tone="bg-success" foot={`${Math.round((present / todays.length) * 100)}% of strength`} trend="up" />
            <Stat label="Absent Today" value={absent} icon="close" tone="bg-danger" foot="Parents notified" />
            <Stat label="Late Arrivals" value={late} icon="clock" tone="bg-warning" foot="After 8:30 AM" />
            <Stat label="Defaulters (<82%)" value={defaulters.length} icon="bell" tone="bg-primary" foot="Action required" />
          </div>

          <div className="grid g-23 mt">
            <Card title="Monthly attendance %" sub="School average across all classes">
              <Bars data={monthlyAttendance.map((m) => ({ m: m.m, v: m.present }))} tone="alt" suffix="%" />
            </Card>
            <Card title="Today's split" sub={today}>
              <Donut
                parts={[
                  { label: "Present", value: present, color: "#0e9f6e" },
                  { label: "Late", value: late, color: "#d97706" },
                  { label: "Absent", value: absent, color: "#e02424" },
                ]}
              />
            </Card>
          </div>

          <div className="mt"><Card title="Attendance Defaulters" sub="Students below the 82% threshold this month" pad={false}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Class</th><th>Attendance %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {defaulters.map((d) => (
                    <tr key={d.s.id}>
                      <td className="strong">{d.s.name}</td>
                      <td>{d.s.className} – {d.s.section}</td>
                      <td>
                        <div className="flex">
                          <div className="progress" style={{ width: 130 }}>
                            <i style={{ width: `${d.pct}%`, background: d.pct < 75 ? "var(--danger)" : "var(--warning)" }} />
                          </div>
                          <b>{d.pct}%</b>
                        </div>
                      </td>
                      <td>
                        <Badge tone={d.pct < 75 ? "b-danger" : "b-warning"}>
                          {d.pct < 75 ? "Critical" : "Watch"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card></div>
        </>
      )}

      {active === "fees" && (
        <>
          <div className="grid g-4 mt">
            <Stat label="Collected" value={inr(collected)} icon="wallet" tone="bg-success" foot="Session 2026-27" trend="up" />
            <Stat label="Outstanding" value={inr(dues)} icon="clock" tone="bg-warning" foot="Across all classes" />
            <Stat label="Collection Rate" value={`${Math.round((collected / (collected + dues || 1)) * 100)}%`} icon="trend" tone="bg-info" foot="Target 95%" />
            <Stat label="Receipts" value={payments.length} icon="file" tone="bg-primary" foot="Issued this session" />
          </div>
          <div className="grid g-2 mt">
            <Card title="Monthly collection" sub="₹ in thousands">
              <Bars data={monthlyCollection.map((m) => ({ m: m.m, v: m.v }))} />
            </Card>
            <Card title="Expected revenue by class group" sub="Fee structure totals">
              <div className="hbar">
                {feeStructure.map((f) => (
                  <div className="row" key={f.className}>
                    <div className="top"><span>{f.className}</span><b>{inr(f.total)}</b></div>
                    <div className="progress"><i style={{ width: `${(f.total / 61000) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {active === "students" && (
        <>
          <div className="grid g-4 mt">
            <Stat label="Total Enrolment" value={students.length} icon="users" tone="bg-primary" foot="All classes" trend="up" />
            <Stat label="Boys" value={students.filter((s) => s.gender === "Male").length} icon="users" tone="bg-info" foot="52% of strength" />
            <Stat label="Girls" value={students.filter((s) => s.gender === "Female").length} icon="users" tone="bg-violet" foot="48% of strength" />
            <Stat label="Classes Running" value={classSections.length} icon="book" tone="bg-success" foot="Primary + secondary" />
          </div>
          <div className="mt"><Card title="Class-wise enrolment" sub="Strength per class section">
            <div className="hbar">
              {classSections.map((c) => (
                <div className="row" key={c.id}>
                  <div className="top"><span>{c.className} – {c.section}</span><b>{c.students} students</b></div>
                  <div className="progress"><i style={{ width: `${(c.students / 40) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </Card></div>
        </>
      )}

      {active === "academic" && (
        <Card title="Academic performance summary" sub="Subject averages across completed examinations">
          <div className="grid g-2">
            <div className="hbar">
              {[["Mathematics", 74], ["Science", 78], ["English", 81], ["Social Science", 69], ["Computer Science", 86], ["Hindi", 77]].map(([s, v]) => (
                <div className="row" key={s as string}>
                  <div className="top"><span>{s}</span><b>{v}%</b></div>
                  <div className="progress"><i style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
            <div>
              <div className="kv"><span className="k">School average</span><span className="v">77.5%</span></div>
              <div className="kv"><span className="k">Highest subject</span><span className="v">Computer Science — 86%</span></div>
              <div className="kv"><span className="k">Needs attention</span><span className="v">Social Science — 69%</span></div>
              <div className="kv"><span className="k">Overall pass rate</span><span className="v">96.4%</span></div>
              <div className="kv"><span className="k">Distinctions (≥90%)</span><span className="v">42 students</span></div>
              <div className="kv"><span className="k">Report cards issued</span><span className="v">{notices.length > 0 ? "Yes" : "No"}</span></div>
            </div>
          </div>
          <div className="grid g-3 mt">
            <div className="stat"><div className="label">Topper — Class 10</div><div className="value" style={{ fontSize: 20 }}>Ananya Iyer</div><div className="foot">94.2% aggregate</div></div>
            <div className="stat"><div className="label">Topper — Class 9</div><div className="value" style={{ fontSize: 20 }}>Kabir Patel</div><div className="foot">92.6% aggregate</div></div>
            <div className="stat"><div className="label">Most improved</div><div className="value" style={{ fontSize: 20 }}>Rohan Nair</div><div className="foot">+14% vs last exam</div></div>
          </div>
        </Card>
      )}
    </>
  );
}
