import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { demoStudentId, exams, fmtDate, gradeColor, gradeOf, inr, payments, attendance, teachers, classSections } from "../../data/db";
import { Avatar, Badge, Card, Icon, PageHead, Person, Stat, statusTone } from "../../components/ui";

export default function StudentHome() {
  const { students, marks, notices } = useApp();
  const me = students.find((s) => s.id === demoStudentId) ?? students[0];

  const att = attendance.filter((a) => a.studentId === me?.id);
  const present = att.filter((a) => a.status === "Present").length;
  const pct = att.length ? Math.round((present / att.length) * 100) : 0;

  const myMarks = marks.filter((m) => m.studentId === me?.id);
  const tot = myMarks.reduce((a, b) => a + b.max, 0);
  const avg = tot ? Math.round((myMarks.reduce((a, b) => a + b.marks, 0) / tot) * 100) : 0;

  const due = payments
    .filter((p) => p.studentId === me?.id && p.status !== "Paid")
    .reduce((a, b) => a + b.amount, 0);

  const cls = classSections.find((c) => c.className === me?.className && c.section === me?.section);

  const subjects = ["Mathematics", "Science", "English", "Social Science", "Computer Science", "Hindi"];

  return (
    <>
      <PageHead
        title="My Dashboard"
        desc={`${me?.name} · ${me?.className} – ${me?.section} · Roll ${me?.roll} · Session 2026-27`}
        actions={
          <>
            <Link to="/student/results" className="btn btn-outline"><Icon name="file" size={16} /> My results</Link>
            <Link to="/student/attendance" className="btn btn-primary"><Icon name="check" size={16} /> My attendance</Link>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Attendance" value={`${pct}%`} icon="check" tone={pct >= 85 ? "bg-success" : "bg-warning"} foot={`${present} of ${att.length} days`} trend={pct >= 85 ? "up" : "down"} />
        <Stat label="Academic Average" value={`${avg}%`} icon="chart" tone="bg-primary" foot={`Grade ${gradeOf(avg)}`} trend="up" />
        <Stat label="Fees Due" value={inr(due)} icon="wallet" tone={due ? "bg-danger" : "bg-success"} foot={due ? "Payable by 30 Sep" : "All clear"} />
        <Stat label="Class Rank" value="#4" icon="star" tone="bg-violet" foot={`${me?.className} – ${me?.section}`} />
      </div>

      <div className="grid g-23 mt">
        <Card title="My Marks at a glance" sub="Latest published examination" right={<Link to="/student/results" className="btn btn-soft btn-sm">Full report card</Link>}>
          <div className="hbar">
            {subjects.map((s, i) => {
              const ms = myMarks.filter((m) => m.subject === s);
              const t = ms.reduce((a, b) => a + b.max, 0);
              const p = t ? Math.round((ms.reduce((a, b) => a + b.marks, 0) / t) * 100) : [0, 0][i % 2];
              return (
                <div className="row" key={s}>
                  <div className="top"><span>{s}</span><b>{p}%</b></div>
                  <div className="progress"><i style={{ width: `${p}%`, background: p < 50 ? "var(--danger)" : p < 70 ? "var(--warning)" : "var(--success)" }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid" style={{ alignContent: "start" }}>
          <Card title="My profile">
            <div className="flex" style={{ marginBottom: 12 }}>
              <Avatar name={me?.name ?? "Student"} lg />
              <div>
                <div className="strong" style={{ fontSize: 16 }}>{me?.name}</div>
                <div className="small muted">{me?.admNo}</div>
              </div>
            </div>
            <div className="kv"><span className="k">Class</span><span className="v">{me?.className} – {me?.section}</span></div>
            <div className="kv"><span className="k">Roll no</span><span className="v">{me?.roll}</span></div>
            <div className="kv"><span className="k">Class teacher</span><span className="v">{cls?.classTeacher ?? "—"}</span></div>
            <div className="kv"><span className="k">Room</span><span className="v">{cls?.room ?? "—"}</span></div>
          </Card>

          <Card title="Upcoming">
            <div className="kv"><span className="k">Half Yearly Exams</span><span className="v">28 Sep – 10 Oct</span></div>
            <div className="kv"><span className="k">Sports Day trials</span><span className="v">29 Sep 2026</span></div>
            <div className="kv"><span className="k">Fee due date</span><span className="v">30 Sep 2026</span></div>
          </Card>
        </div>
      </div>

      <div className="grid g-2 mt">
        <Card title="My teachers" sub="Subjects I study">
          {teachers.slice(0, 5).map((t) => (
            <div className="list-item" key={t.id}>
              <Person name={t.name} sub={t.subject} />
              <div className="right"><Badge tone={statusTone(t.status)}>{t.status}</Badge></div>
            </div>
          ))}
        </Card>

        <Card title="School notices" sub="Latest announcements" right={<Link to="/student/notices" className="btn btn-outline btn-sm">All</Link>}>
          {notices.slice(0, 4).map((n) => (
            <div className="list-item" key={n.id}>
              <span className="unread-dot" />
              <div className="body">
                <div className="ttl">{n.title}</div>
                <div className="when">
                  <Badge tone={statusTone(n.priority)}>{n.priority}</Badge>
                  <span>{fmtDate(n.date)}</span>
                </div>
              </div>
            </div>
          ))}
          {notices.length === 0 && <div className="muted small">No notices right now.</div>}
        </Card>
      </div>

      <div className="mt"><Card title="Published exams" sub="Results status" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Examination</th><th>Term</th><th>Dates</th><th>Status</th><th className="num">My score</th></tr></thead>
            <tbody>
              {exams.filter((e) => e.className === me?.className).map((e) => {
                const ms = marks.filter((m) => m.studentId === me?.id && m.examId === e.id);
                const t = ms.reduce((a, b) => a + b.max, 0);
                const p = t ? Math.round((ms.reduce((a, b) => a + b.marks, 0) / t) * 100) : 0;
                return (
                  <tr key={e.id}>
                    <td className="strong">{e.name}</td>
                    <td>{e.term}</td>
                    <td className="nowrap">{e.from} → {e.to}</td>
                    <td><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                    <td className="num">
                      {t ? <Badge tone={gradeColor(gradeOf(p))}>{p}% · {gradeOf(p)}</Badge> : <span className="muted">Not published</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card></div>
    </>
  );
}
