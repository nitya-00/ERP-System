import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { demoUsers, fmtDate, inr, gradeOf, marks as seedMarks, payments, attendance } from "../../data/db";
import { Avatar, Badge, Card, Icon, PageHead, Person, Stat, statusTone } from "../../components/ui";
import { useFamily } from "../../store/family";

export default function MyChildren() {
  const { notices } = useApp();
  const kids = useFamily();
  const [sel, setSel] = useState(kids[0]?.id ?? "");

  const child = kids.find((k) => k.id === sel) ?? kids[0];

  const att = child ? attendance.filter((a) => a.studentId === child.id) : [];
  const present = att.filter((a) => a.status === "Present").length;
  const pct = att.length ? Math.round((present / att.length) * 100) : 0;

  const kidMarks = child ? seedMarks.filter((m) => m.studentId === child.id) : [];
  const got = kidMarks.reduce((a, b) => a + b.marks, 0);
  const tot = kidMarks.reduce((a, b) => a + b.max, 0);
  const avg = tot ? Math.round((got / tot) * 100) : 0;

  const dues = payments
    .filter((p) => child && p.studentId === child.id && p.status !== "Paid")
    .reduce((a, b) => a + b.amount, 0);
  const paid = payments
    .filter((p) => child && p.studentId === child.id && p.status === "Paid")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <>
      <PageHead
        title="My Children"
        desc={`Welcome, ${demoUsers.parent.name} · Parent portal for ${kids.length} children`}
        actions={
          <Link to="/parent/notices" className="btn btn-outline">
            <Icon name="mega" size={16} /> School notices
          </Link>
        }
      />

      <div className="grid g-3">
        {kids.map((k) => (
          <button
            key={k.id}
            className="card"
            onClick={() => setSel(k.id)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              padding: 18,
              borderColor: sel === k.id ? "var(--primary)" : undefined,
              boxShadow: sel === k.id ? "0 0 0 3px rgba(79,70,229,.12), var(--shadow)" : undefined,
            }}
          >
            <div className="flex">
              <Avatar name={k.name} lg />
              <div className="grow">
                <div className="strong" style={{ fontSize: 16 }}>{k.name}</div>
                <div className="small muted">{k.className} – {k.section} · Roll {k.roll}</div>
              </div>
              <Badge tone={statusTone(k.status)}>{k.status}</Badge>
            </div>
            <div className="divider" />
            <div className="flex" style={{ gap: 18 }}>
              <div><div className="small muted">Attendance</div><div className="strong">{pctOf(k.id)}%</div></div>
              <div><div className="small muted">Fees due</div><div className="strong" style={{ color: dues ? "var(--danger)" : "var(--success)" }}>{inr(paid2(k.id))}</div></div>
              <div><div className="small muted">Adm no</div><div className="strong">{k.admNo}</div></div>
            </div>
          </button>
        ))}
      </div>

      {child && (
        <>
          <div className="grid g-4 mt">
            <Stat label="Attendance" value={`${pct}%`} icon="check" tone={pct >= 85 ? "bg-success" : "bg-warning"} foot={`${present} of ${att.length} days`} trend={pct >= 85 ? "up" : "down"} />
            <Stat label="Academic Average" value={`${avg}%`} icon="chart" tone="bg-primary" foot={`Grade ${gradeOf(avg)}`} trend={avg >= 60 ? "up" : "down"} />
            <Stat label="Fees Paid" value={inr(paid)} icon="wallet" tone="bg-info" foot="Session 2026-27" />
            <Stat label="Fees Due" value={inr(dues)} icon="bell" tone={dues ? "bg-danger" : "bg-success"} foot={dues ? "Pay before 30 Sep" : "All clear"} />
          </div>

          <div className="grid g-23 mt">
            <Card title={`${child.name} — Profile`} sub={`${child.className} – ${child.section} · ${child.admNo}`}
              right={<Badge tone={statusTone(child.status)}>{child.status}</Badge>}>
              <div className="flex" style={{ marginBottom: 14 }}>
                <Avatar name={child.name} lg />
                <div>
                  <div className="strong" style={{ fontSize: 17 }}>{child.name}</div>
                  <div className="muted small">DOB {fmtDate(child.dob)} · Blood group {child.bloodGroup}</div>
                </div>
              </div>
              <div className="kv"><span className="k">Roll number</span><span className="v">{child.roll}</span></div>
              <div className="kv"><span className="k">Class teacher</span><span className="v">Anjali Deshpande</span></div>
              <div className="kv"><span className="k">Room</span><span className="v">U-02</span></div>
              <div className="kv"><span className="k">Admitted on</span><span className="v">{fmtDate(child.admissionDate)}</span></div>
              <div className="kv"><span className="k">Address</span><span className="v">{child.address}</span></div>
              <div className="flex mt">
                <Link to="/parent/attendance" className="btn btn-outline grow"><Icon name="check" size={15} /> Attendance</Link>
                <Link to="/parent/results" className="btn btn-outline grow"><Icon name="file" size={15} /> Results</Link>
                <Link to="/parent/fees" className="btn btn-primary grow"><Icon name="wallet" size={15} /> Pay fees</Link>
              </div>
            </Card>

            <div className="grid" style={{ alignContent: "start" }}>
              <Card title="Recent notices" sub="For your child's class">
                {notices.slice(0, 3).map((n) => (
                  <div className="list-item" key={n.id}>
                    <span className="unread-dot" />
                    <div className="body">
                      <div className="ttl">{n.title}</div>
                      <div className="when">
                        <Badge tone={statusTone(n.priority)}>{n.priority}</Badge>
                        <span>{n.audience}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && <div className="muted small">No notices right now.</div>}
              </Card>

              <Card title="Upcoming">
                <div className="kv"><span className="k">PTM</span><span className="v">Sat, 27 Sep · 9 AM</span></div>
                <div className="kv"><span className="k">Half Yearly Exams</span><span className="v">28 Sep – 10 Oct</span></div>
                <div className="kv"><span className="k">Fee due date</span><span className="v">30 Sep 2026</span></div>
                <div className="kv"><span className="k">Sports Day trials</span><span className="v">29 Sep 2026</span></div>
              </Card>
            </div>
          </div>

          <div className="mt"><Card title="Children overview" sub="Quick comparison" pad={false}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Class</th><th className="num">Attendance</th><th className="num">Average</th><th className="num">Fees due</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {kids.map((k) => (
                    <tr key={k.id}>
                      <td><Person name={k.name} sub={k.admNo} /></td>
                      <td>{k.className} – {k.section}</td>
                      <td className="num">{pctOf(k.id)}%</td>
                      <td className="num">{avgOf(k.id)}%</td>
                      <td className="num strong">{inr(paid2(k.id))}</td>
                      <td><Badge tone={statusTone(k.status)}>{k.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card></div>
        </>
      )}
    </>
  );
}

function pctOf(id: string) {
  const rows = attendance.filter((a) => a.studentId === id);
  if (!rows.length) return 0;
  return Math.round((rows.filter((r) => r.status === "Present").length / rows.length) * 100);
}
function avgOf(id: string) {
  const ms = seedMarks.filter((m) => m.studentId === id);
  const tot = ms.reduce((a, b) => a + b.max, 0);
  return tot ? Math.round((ms.reduce((a, b) => a + b.marks, 0) / tot) * 100) : 0;
}
function paid2(id: string) {
  return payments.filter((p) => p.studentId === id && p.status !== "Paid").reduce((a, b) => a + b.amount, 0);
}
