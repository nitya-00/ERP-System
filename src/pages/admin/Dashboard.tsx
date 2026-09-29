import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import {
  fmtDateTime,
  inr,
  monthlyCollection,
  schoolStats,
  strength,
  teachers,
  todayLong,
} from "../../data/db";
import { Badge, Card, Icon, Money, PageHead, Person, PrivacyProvider, PrivacyToggle, Stat, Bars, statusTone } from "../../components/ui";

export default function AdminDashboard() {
  const { students, payments, notices, classes } = useApp();

  const active = students.filter((s) => s.status === "Active").length;
  const paid = payments.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const due = payments.filter((p) => p.status !== "Paid").reduce((a, b) => a + b.amount, 0);
  const rate = Math.round((paid / (paid + due || 1)) * 100);

  const onDuty = teachers.filter((t) => t.status === "Active").length;
  const dutyPct = Math.round((onDuty / teachers.length) * 100);

  return (
    <PrivacyProvider>
      <PageHead
        title="Admin Dashboard"
        desc={`${schoolStats.name} · Session ${schoolStats.session} · ${todayLong()}`}
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
        <Stat
          label="Total Students"
          value={students.length}
          icon="users"
          tone="bg-primary"
          foot={`${active} active enrolled`}
          trend="up"
        />
        <Stat
          label="Total Teachers"
          value={teachers.length}
          icon="cap"
          tone="bg-violet"
          foot={`${onDuty} on duty`}
        />
        <Stat
          label="Teacher Attendance Today"
          value={`${dutyPct}%`}
          icon="check"
          tone="bg-success"
          foot={`${onDuty} of ${teachers.length} on duty`}
          trend={dutyPct >= 90 ? "up" : "down"}
        />
        <Stat
          label="Fees Collected"
          value={inr(paid)}
          icon="wallet"
          tone="bg-info"
          foot={`${rate}% of billed amount`}
          trend="up"
          secret
        />
      </div>

      <div className="grid g-23 mt">
        <Card
          title="Fee Collection — this session"
          sub="Amounts in ₹ thousands, month-wise"
          right={
            <div className="flex" style={{ gap: 8 }}>
              <PrivacyToggle label={false} />
              <Link to="/admin/fees" className="btn btn-outline btn-sm">Open Fees</Link>
            </div>
          }
        >
          <Bars data={monthlyCollection.map((m) => ({ m: m.m, v: m.v }))} />
          <div className="flex flex-wrap mt">
            <div className="grow">
              <div className="small muted">Total collected</div>
              <div className="strong" style={{ fontSize: 20 }}><Money n={paid} /></div>
            </div>
            <div className="grow">
              <div className="small muted">Outstanding</div>
              <div className="strong" style={{ fontSize: 20, color: "var(--danger)" }}><Money n={due} /></div>
            </div>
            <div className="grow">
              <div className="small muted">Collection rate</div>
              <div className="strong" style={{ fontSize: 20, color: "var(--success)" }}>{rate}%</div>
            </div>
          </div>
        </Card>

        <Card
          title="Latest Notices"
          sub="School communication feed"
          right={<Link to="/admin/notices" className="btn btn-outline btn-sm">Open</Link>}
        >
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

      <div className="mt">
        <Card
          title="Classes & Sections"
          sub={`${classes.length} class-sections · strength and class teacher for each`}
          right={
            <Link to="/admin/teachers" className="btn btn-outline btn-sm">Manage teachers</Link>
          }
          pad={false}
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th className="num">Students</th>
                  <th>Class Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td className="strong">{c.className}</td>
                    <td>
                      <Badge tone="b-primary" plain>{c.section || "—"}</Badge>
                    </td>
                    <td className="num strong">
                      {strength(students, c.className, c.section)}
                    </td>
                    <td>
                      <Person name={c.classTeacher} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="hint"
            style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}
          >
            {classes.length} sections · {students.length} students enrolled · attendance is
            tracked inside each class register.
          </div>
        </Card>
      </div>
    </PrivacyProvider>
  );
}
