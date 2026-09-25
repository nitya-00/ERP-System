import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { CLASSES, attendance, fmtDate, inr, payments } from "../../data/db";
import { Avatar, Badge, Card, Empty, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";

export default function Students() {
  const { students } = useApp();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("All classes");
  const [status, setStatus] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      students.filter(
        (s) =>
          (cls === "All classes" || s.className === cls) &&
          (status === "All" || s.status === status) &&
          (q === "" ||
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.id.toLowerCase().includes(q.toLowerCase()) ||
            s.admNo.toLowerCase().includes(q.toLowerCase()) ||
            s.parentName.toLowerCase().includes(q.toLowerCase())),
      ),
    [students, q, cls, status],
  );

  const student = students.find((s) => s.id === openId);
  const sAttendance = student
    ? attendance.filter((a) => a.studentId === student.id)
    : [];
  const sPresent = sAttendance.filter((a) => a.status === "Present").length;
  const sPct = sAttendance.length ? Math.round((sPresent / sAttendance.length) * 100) : 0;
  const sPaid = payments
    .filter((p) => p.studentId === openId && p.status === "Paid")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <>
      <PageHead
        title="Students"
        desc="Complete student records — academics, guardian details, attendance and fee status."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="print" size={16} /> Print list
            </button>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Export CSV
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Total Enrolled" value={students.length} icon="users" tone="bg-primary" foot="Across 10 classes" trend="up" />
        <Stat label="Active" value={students.filter((s) => s.status === "Active").length} icon="check" tone="bg-success" foot="Attending regularly" />
        <Stat label="Pending" value={students.filter((s) => s.status === "Pending").length} icon="clock" tone="bg-warning" foot="Documents under verification" />
        <Stat label="Inactive / Left" value={students.filter((s) => s.status === "Inactive").length} icon="logout" tone="bg-danger" foot="Withdrawn this session" />
      </div>

      <Card
        title="Student Directory"
        sub={`${rows.length} records`}
        pad={false}
        right={
          <div className="search" style={{ width: 230 }}>
            <Icon name="search" size={15} />
            <input
              placeholder="Search name, ADM no, parent…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ padding: "14px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="select" style={{ width: 170 }} value={cls} onChange={(e) => setCls(e.target.value)}>
            <option>All classes</option>
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="select" style={{ width: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ADM No</th>
                <th>Class</th>
                <th>Roll</th>
                <th>Parent / Guardian</th>
                <th>Contact</th>
                <th>Admitted</th>
                <th>Status</th>
                <th className="num">Profile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td><Person name={s.name} sub={s.gender} /></td>
                  <td className="strong">{s.admNo}</td>
                  <td>{s.className} – {s.section}</td>
                  <td>{s.roll}</td>
                  <td>{s.parentName}</td>
                  <td className="nowrap">{s.parentPhone}</td>
                  <td className="nowrap">{fmtDate(s.admissionDate)}</td>
                  <td><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
                  <td className="num">
                    <button className="btn btn-soft btn-sm" onClick={() => setOpenId(s.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty icon="🔍" title="No students match your filters" sub="Clear the search or pick another class." />}
        </div>
      </Card>

      {student && (
        <Modal title="Student Profile" onClose={() => setOpenId(null)} wide>
          <div className="flex" style={{ marginBottom: 18 }}>
            <Avatar name={student.name} lg />
            <div>
              <div className="strong" style={{ fontSize: 19 }}>{student.name}</div>
              <div className="muted">
                {student.className} – {student.section} · Roll {student.roll} · {student.admNo}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge tone={statusTone(student.status)}>{student.status}</Badge>
            </div>
          </div>

          <div className="grid g-3">
            <div className="stat">
              <div className="label">Attendance</div>
              <div className="value" style={{ fontSize: 23 }}>{sPct}%</div>
              <div className="foot">{sPresent} of {sAttendance.length} days present</div>
            </div>
            <div className="stat">
              <div className="label">Fees Paid</div>
              <div className="value" style={{ fontSize: 23 }}>{inr(sPaid)}</div>
              <div className="foot">This session</div>
            </div>
            <div className="stat">
              <div className="label">Blood Group</div>
              <div className="value" style={{ fontSize: 23 }}>{student.bloodGroup}</div>
              <div className="foot">DOB {fmtDate(student.dob)}</div>
            </div>
          </div>

          <div className="divider" />
          <div className="grid g-2">
            <div>
              <div className="label">Student details</div>
              <div className="kv"><span className="k">Admission no</span><span className="v">{student.admNo}</span></div>
              <div className="kv"><span className="k">Gender</span><span className="v">{student.gender}</span></div>
              <div className="kv"><span className="k">Date of birth</span><span className="v">{fmtDate(student.dob)}</span></div>
              <div className="kv"><span className="k">Contact</span><span className="v">{student.phone}</span></div>
              <div className="kv"><span className="k">Admitted on</span><span className="v">{fmtDate(student.admissionDate)}</span></div>
            </div>
            <div>
              <div className="label">Guardian details</div>
              <div className="kv"><span className="k">Parent / Guardian</span><span className="v">{student.parentName}</span></div>
              <div className="kv"><span className="k">Phone</span><span className="v">{student.parentPhone}</span></div>
              <div className="kv"><span className="k">Email</span><span className="v">{student.parentEmail}</span></div>
              <div className="kv"><span className="k">Address</span><span className="v">{student.address}</span></div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
