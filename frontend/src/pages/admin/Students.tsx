import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { CLASSES, attendance, exams, fmtDate, gradeColor, gradeOf, inr, payments } from "../../data/db";
import { Avatar, Badge, Card, Empty, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";

const PASS = 33;

export default function Students() {
  const { students, classes, marks } = useApp();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("All classes");
  const [status, setStatus] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const examById = useMemo(() => new Map(exams.map((e) => [e.id, e])), []);

  /* attendance summary per student */
  const attSummary = useMemo(() => {
    const m = new Map<string, { present: number; total: number }>();
    attendance.forEach((a) => {
      const c = m.get(a.studentId) ?? { present: 0, total: 0 };
      c.total += 1;
      if (a.status === "Present") c.present += 1;
      m.set(a.studentId, c);
    });
    return m;
  }, []);

  /* latest completed-exam result per student */
  const examResult = useMemo(() => {
    const byKey = new Map<string, { got: number; max: number; examId: string; studentId: string }>();
    marks.forEach((m) => {
      const k = `${m.studentId}|${m.examId}`;
      const c = byKey.get(k);
      if (c) {
        c.got += m.marks;
        c.max += m.max;
      } else byKey.set(k, { got: m.marks, max: m.max, examId: m.examId, studentId: m.studentId });
    });
    const latest = new Map<string, { examId: string; pct: number }>();
    byKey.forEach((v) => {
      const ex = examById.get(v.examId);
      if (!ex) return;
      const pct = v.max ? Math.round((v.got / v.max) * 100) : 0;
      const prev = latest.get(v.studentId);
      if (!prev || (examById.get(prev.examId)?.to ?? "") < ex.to) {
        latest.set(v.studentId, { examId: v.examId, pct });
      }
    });
    return latest;
  }, [marks, examById]);

  /* school-level summary for the most recent examination */
  const latestExam = useMemo(
    () =>
      exams
        .filter((e) => e.status === "Completed")
        .sort((a, b) => (a.to < b.to ? 1 : -1))[0],
    [],
  );

  const examSummary = useMemo(() => {
    if (!latestExam) return { appeared: 0, passed: 0, passPct: 0 };
    const per = new Map<string, { got: number; max: number }>();
    marks
      .filter((m) => m.examId === latestExam.id)
      .forEach((m) => {
        const c = per.get(m.studentId) ?? { got: 0, max: 0 };
        c.got += m.marks;
        c.max += m.max;
        per.set(m.studentId, c);
      });
    const rows = [...per.values()];
    const appeared = rows.length;
    const passed = rows.filter((r) => r.max > 0 && r.got / r.max >= PASS / 100).length;
    return {
      appeared,
      passed,
      passPct: appeared ? Math.round((passed / appeared) * 100) : 0,
    };
  }, [marks, latestExam]);

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
  const sAttendance = student ? attendance.filter((a) => a.studentId === student.id) : [];
  const sPresent = sAttendance.filter((a) => a.status === "Present").length;
  const sPct = sAttendance.length ? Math.round((sPresent / sAttendance.length) * 100) : 0;
  const sExam = student ? examResult.get(student.id) : undefined;
  const sExamName = sExam ? examById.get(sExam.examId)?.name : undefined;
  const sPaid = payments
    .filter((p) => p.studentId === openId && p.status === "Paid")
    .reduce((a, b) => a + b.amount, 0);

  const attPct = (id: string) => {
    const a = attSummary.get(id);
    return a && a.total ? Math.round((a.present / a.total) * 100) : 0;
  };

  return (
    <>
      <PageHead
        title="Students"
        desc="All-student overview — enrolment, guardian details, attendance and academic performance."
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
        <Stat label="Total Enrolled" value={students.length} icon="users" tone="bg-primary" foot={`${classes.length} class-sections`} trend="up" />
        <Stat label="Active" value={students.filter((s) => s.status === "Active").length} icon="check" tone="bg-success" foot="Attending regularly" />
        <Stat label="Pending" value={students.filter((s) => s.status === "Pending").length} icon="clock" tone="bg-warning" foot="Documents under verification" />
        <Stat label="Inactive / Left" value={students.filter((s) => s.status === "Inactive").length} icon="logout" tone="bg-danger" foot="Withdrawn this session" />
      </div>

      <Card
        title="Academic / Exam Summary"
        sub={
          latestExam
            ? `${latestExam.name} · Class ${latestExam.className} · ${latestExam.term}`
            : "No completed examinations yet"
        }
        right={<Icon name="chart" size={18} />}
      >
        <div className="flex" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="stat" style={{ flex: "1 1 180px" }}>
            <div className="label">Students appeared</div>
            <div className="value" style={{ fontSize: 25 }}>{examSummary.appeared}</div>
            <div className="foot">In the latest exam</div>
          </div>
          <div className="stat" style={{ flex: "1 1 180px" }}>
            <div className="label">Students passed</div>
            <div className="value" style={{ fontSize: 25 }}>{examSummary.passed}</div>
            <div className="foot">Scored 33% or above</div>
          </div>
          <div className="stat" style={{ flex: "1 1 180px" }}>
            <div className="label">Pass percentage</div>
            <div className="value" style={{ fontSize: 25, color: examSummary.passPct >= 80 ? "var(--success)" : "var(--warning)" }}>
              {examSummary.passPct}%
            </div>
            <div className="foot">Appeared students clearing the exam</div>
          </div>
        </div>
      </Card>

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
                <th>Class &amp; Section</th>
                <th>Parent / Guardian</th>
                <th>Contact</th>
                <th className="num">Attendance</th>
                <th className="num">Latest Exam</th>
                <th>Admitted</th>
                <th>Status</th>
                <th className="num">Profile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const pct = attPct(s.id);
                const r = examResult.get(s.id);
                const g = r ? gradeOf(r.pct) : null;
                return (
                  <tr key={s.id}>
                    <td><Person name={s.name} sub={s.gender} /></td>
                    <td className="strong">{s.admNo}</td>
                    <td>{s.className}{s.section ? ` – ${s.section}` : ""}</td>
                    <td>{s.parentName}</td>
                    <td className="nowrap">{s.parentPhone}</td>
                    <td className="num">
                      <Badge tone={pct >= 85 ? "b-success" : pct >= 75 ? "b-warning" : "b-danger"}>
                        {pct}%
                      </Badge>
                    </td>
                    <td className="num">
                      {r && g ? (
                        <Badge tone={gradeColor(g)}>{r.pct}% · {g}</Badge>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="nowrap">{fmtDate(s.admissionDate)}</td>
                    <td><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
                    <td className="num">
                      <button className="btn btn-soft btn-sm" onClick={() => setOpenId(s.id)}>View</button>
                    </td>
                  </tr>
                );
              })}
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
                {student.className}{student.section ? ` – ${student.section}` : ""} · Roll {student.roll} · {student.admNo}
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
              <div className="label">Latest Exam</div>
              <div className="value" style={{ fontSize: 23 }}>
                {sExam ? `${sExam.pct}%` : "—"}
              </div>
              <div className="foot">
                {sExam && sExamName
                  ? `${sExamName} · Grade ${gradeOf(sExam.pct)}`
                  : "No results published"}
              </div>
            </div>
          </div>

          <div className="divider" />
          <div className="grid g-2">
            <div>
              <div className="label">Student details</div>
              <div className="kv"><span className="k">Admission no</span><span className="v">{student.admNo}</span></div>
              <div className="kv"><span className="k">Student ID</span><span className="v">{student.id}</span></div>
              <div className="kv"><span className="k">Gender</span><span className="v">{student.gender}</span></div>
              <div className="kv"><span className="k">Date of birth</span><span className="v">{fmtDate(student.dob)}</span></div>
              <div className="kv"><span className="k">Contact</span><span className="v">{student.phone}</span></div>
              <div className="kv"><span className="k">Blood group</span><span className="v">{student.bloodGroup}</span></div>
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
