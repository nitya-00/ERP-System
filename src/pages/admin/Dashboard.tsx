import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import {
  classSections,
  fmtDateTime,
  inr,
  monthlyAttendance,
  monthlyCollection,
  relTime,
  schoolStats,
  teachers,
} from "../../data/db";
import { Bars, Badge, Card, Donut, Icon, PageHead, Person, ProgressRow, Stat, statusTone } from "../../components/ui";

export default function AdminDashboard() {
  const { students, payments, attendance, notices, apps } = useApp();

  const active = students.filter((s) => s.status === "Active").length;
  const paid = payments.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const due = payments.filter((p) => p.status !== "Paid").reduce((a, b) => a + b.amount, 0);
  const today = "2026-09-24";
  const todays = attendance.filter((a) => a.date === today);
  const present = todays.filter((a) => a.status === "Present").length;
  const attPct = todays.length ? Math.round((present / todays.length) * 100) : 0;
  const newApps = apps.filter((a) => a.status === "New").length;

  const genderM = students.filter((s) => s.gender === "Male").length;
  const genderF = students.length - genderM;

  return (
    <>
      <PageHead
        title="Admin Dashboard"
        desc={`${schoolStats.name} · Session ${schoolStats.session} · Friday, 25 September 2026`}
        actions={
          <>
            <Link to="/admin/admissions" className="btn btn-outline">
              <Icon name="userPlus" size={16} /> New Admission
            </Link>
            <Link to="/admin/notices" className="btn btn-primary">
              <Icon name="mega" size={16} /> Publish Notice
            </Link>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Total Students" value={students.length} icon="users" tone="bg-primary" foot={`${active} active enrolled`} trend="up" />
        <Stat label="Total Teachers" value={teachers.length} icon="cap" tone="bg-violet" foot={`${teachers.filter((t) => t.status === "Active").length} on duty`} />
        <Stat label="Attendance Today" value={`${attPct}%`} icon="check" tone="bg-success" foot={`${present} of ${todays.length} present`} trend={attPct > 90 ? "up" : "down"} />
        <Stat label="Fees Collected" value={inr(paid)} icon="wallet" tone="bg-info" foot={`${inr(due)} still pending`} trend="up" />
      </div>

      <div className="grid g-23 mt">
        <Card
          title="Fee Collection — this session"
          sub="Amounts in ₹ thousands, month-wise"
          right={<Link to="/admin/fees" className="btn btn-outline btn-sm">Open Fees</Link>}
        >
          <Bars data={monthlyCollection.map((m) => ({ m: m.m, v: m.v }))} />
          <div className="flex flex-wrap mt">
            <div className="grow">
              <div className="small muted">Total collected</div>
              <div className="strong" style={{ fontSize: 20 }}>{inr(paid)}</div>
            </div>
            <div className="grow">
              <div className="small muted">Outstanding</div>
              <div className="strong" style={{ fontSize: 20, color: "var(--danger)" }}>{inr(due)}</div>
            </div>
            <div className="grow">
              <div className="small muted">Collection rate</div>
              <div className="strong" style={{ fontSize: 20, color: "var(--success)" }}>
                {Math.round((paid / (paid + due || 1)) * 100)}%
              </div>
            </div>
          </div>
        </Card>

        <Card title="Student Strength" sub="By gender across all classes">
          <Donut
            parts={[
              { label: "Boys", value: genderM, color: "#6366f1" },
              { label: "Girls", value: genderF, color: "#ec4899" },
            ]}
          />
          <div className="divider" />
          <div className="hbar">
            <ProgressRow label="Boys" value={genderM} max={students.length} suffix="" />
            <ProgressRow label="Girls" value={genderF} max={students.length} suffix="" />
          </div>
        </Card>
      </div>

      <div className="grid g-23 mt">
        <Card
          title="Attendance Trend"
          sub="School-wide monthly average"
          right={<Badge tone="b-success">Healthy</Badge>}
        >
          <Bars data={monthlyAttendance.map((m) => ({ m: m.m, v: m.present }))} tone="alt" suffix="%" />
        </Card>

        <Card
          title="Pending Admissions"
          sub={`${newApps} applications awaiting action`}
          right={<Link to="/admin/admissions" className="btn btn-soft btn-sm">Review all</Link>}
        >
          {apps.slice(0, 4).map((a) => (
            <div className="list-item" key={a.id}>
              <Person name={a.name} sub={`${a.applyingFor} · ${a.id}`} />
              <div className="right">
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                <div className="small muted" style={{ marginTop: 6 }}>{relTime(a.date + "T10:00:00")}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid g-32 mt">
        <Card title="Classes & Sections" sub="Class teacher allocation" right={<Link to="/admin/teachers" className="btn btn-outline btn-sm">Manage</Link>} pad={false}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Class Teacher</th>
                  <th className="num">Students</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {classSections.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td className="strong">{c.className} – {c.section}</td>
                    <td>{c.classTeacher}</td>
                    <td className="num">{c.students}</td>
                    <td><Badge tone="b-gray" plain>{c.room}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Latest Notices" sub="School communication feed" right={<Link to="/admin/notices" className="btn btn-outline btn-sm">Open</Link>}>
          {notices.slice(0, 4).map((n) => (
            <div className="list-item" key={n.id}>
              <span className="unread-dot" />
              <div className="body">
                <div className="ttl">{n.title}</div>
                <div className="when">
                  <Badge tone={statusTone(n.priority)}>{n.priority}</Badge>
                  <span>{n.audience}</span>
                  <span>·</span>
                  <span>{fmtDateTime(n.date)}</span>
                </div>
              </div>
            </div>
          ))}
          {notices.length === 0 && <div className="muted small">No notices yet.</div>}
        </Card>
      </div>
    </>
  );
}
