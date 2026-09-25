import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { exams, gradeColor, gradeOf, marks as seedMarks, students } from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead, Person, Stat, statusTone } from "../../components/ui";

export default function Exams() {
  const { marks, toast } = useApp();
  const [examId, setExamId] = useState("EX-01");
  const [q, setQ] = useState("");

  const exam = exams.find((e) => e.id === examId) ?? exams[0];
  const classStudents = students.filter((s) => s.className === exam.className);

  const rows = useMemo(
    () =>
      classStudents
        .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
        .map((s) => {
          const ms = marks.filter((m) => m.studentId === s.id && m.examId === exam.id);
          const obtained = ms.reduce((a, b) => a + b.marks, 0);
          const total = ms.reduce((a, b) => a + b.max, 0);
          const pct = total ? Math.round((obtained / total) * 100) : 0;
          return { s, ms, obtained, total, pct, grade: gradeOf(pct) };
        })
        .sort((a, b) => b.pct - a.pct),
    [classStudents, marks, exam.id, q],
  );

  const avg = rows.length ? Math.round(rows.reduce((a, b) => a + b.pct, 0) / rows.length) : 0;
  const pass = rows.filter((r) => r.pct >= 33).length;

  const overall = useMemo(() => {
    const done = exams.filter((e) => e.status !== "Upcoming");
    const bySubject: Record<string, { got: number; max: number }> = {};
    seedMarks.forEach((m) => {
      const ex = exams.find((e) => e.id === m.examId);
      if (!ex || !done.find((d) => d.id === ex.id)) return;
      bySubject[m.subject] ??= { got: 0, max: 0 };
      bySubject[m.subject].got += m.marks;
      bySubject[m.subject].max += m.max;
    });
    return Object.entries(bySubject).map(([k, v]) => ({
      subject: k,
      pct: Math.round((v.got / v.max) * 100),
    }));
  }, []);

  return (
    <>
      <PageHead
        title="Exams & Results"
        desc="Create examinations, enter marks and publish report cards to parents."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => toast("Date sheet exported as PDF")}>
              <Icon name="download" size={16} /> Export date sheet
            </button>
            <button className="btn btn-primary" onClick={() => toast("New exam draft created")}>
              <Icon name="plus" size={16} /> Create Exam
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Exams Scheduled" value={exams.length} icon="calendar" tone="bg-primary" foot={`${exams.filter((e) => e.status === "Upcoming").length} upcoming`} />
        <Stat label="Completed" value={exams.filter((e) => e.status === "Completed").length} icon="check" tone="bg-success" foot="Results published" />
        <Stat label="Average Score" value={`${avg}%`} icon="chart" tone="bg-info" foot={`${exam.className} · ${exam.name}`} trend={avg >= 60 ? "up" : "down"} />
        <Stat label="Pass Rate" value={`${rows.length ? Math.round((pass / rows.length) * 100) : 0}%`} icon="star" tone="bg-violet" foot={`${pass} of ${rows.length} students`} />
      </div>

      <Card title="Examination Schedule" sub="All exams for the current session" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Term</th>
                <th>Class</th>
                <th>Dates</th>
                <th className="num">Max Marks</th>
                <th>Status</th>
                <th className="num">Results</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td className="strong">{e.name}<div className="small muted">{e.id}</div></td>
                  <td>{e.term}</td>
                  <td>{e.className}</td>
                  <td className="nowrap">{e.from} → {e.to}</td>
                  <td className="num">{e.maxMarks}</td>
                  <td><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                  <td className="num">
                    <button
                      className={`btn btn-sm ${e.id === examId ? "btn-soft" : "btn-outline"}`}
                      onClick={() => setExamId(e.id)}
                    >
                      {e.id === examId ? "Viewing" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid g-23 mt">
        <Card
          title={`${exam.className} — ${exam.name} Result Sheet`}
          sub={`${rows.length} students · ${exam.subjects.length} subjects`}
          pad={false}
          right={
            <div className="search" style={{ width: 190 }}>
              <Icon name="search" size={15} />
              <input placeholder="Search student…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  {exam.subjects.map((s) => <th key={s} className="num">{s.slice(0, 4)}</th>)}
                  <th className="num">Total</th>
                  <th className="num">%</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.s.id}>
                    <td className="muted">{i + 1}</td>
                    <td><Person name={r.s.name} sub={`Roll ${r.s.roll}`} /></td>
                    {exam.subjects.map((sub) => {
                      const m = r.ms.find((x) => x.subject === sub);
                      return (
                        <td className="num" key={sub}>
                          {m ? (
                            <span className={m.marks / m.max < 0.4 ? "strong" : ""} style={m.marks / m.max < 0.4 ? { color: "var(--danger)" } : undefined}>
                              {m.marks}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="num strong">{r.obtained}/{r.total}</td>
                    <td className="num strong">{r.pct}%</td>
                    <td><Badge tone={gradeColor(r.grade)}>{r.grade}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <Empty icon="📝" title="No students found" sub="Marks appear once students of this class are enrolled." />}
          </div>
        </Card>

        <div className="grid" style={{ alignContent: "start" }}>
          <Card title="Subject-wise average" sub="Across all completed exams">
            <div className="hbar">
              {overall.map((o) => (
                <div className="row" key={o.subject}>
                  <div className="top"><span>{o.subject}</span><b>{o.pct}%</b></div>
                  <div className="progress"><i style={{ width: `${o.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Grade distribution" sub={`${exam.className} · ${exam.name}`}>
            <div className="flex" style={{ flexWrap: "wrap", gap: 10 }}>
              {["A1", "A2", "B1", "B2", "C1", "C2", "D"].map((g) => {
                const n = rows.filter((r) => r.grade === g).length;
                return (
                  <div key={g} className="stat" style={{ flex: "1 1 90px", padding: 13 }}>
                    <div className="label">{g}</div>
                    <div className="value" style={{ fontSize: 22 }}>{n}</div>
                  </div>
                );
              })}
            </div>
            <div className="hint" style={{ marginTop: 12 }}>
              A1 ≥ 91% · A2 ≥ 81% · B1 ≥ 71% · B2 ≥ 61% · C1 ≥ 51% · C2 ≥ 41% · D ≥ 33%
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
