import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { exams, gradeColor, gradeOf, students } from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead, Person, Stat } from "../../components/ui";

export default function TeacherMarks() {
  const { marks, saveMarks, toast } = useApp();
  const [examId, setExamId] = useState("EX-01");
  const [subject, setSubject] = useState("Mathematics");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [saved, setSaved] = useState(false);

  const exam = exams.find((e) => e.id === examId) ?? exams[0];
  const subs = exam.subjects;
  const activeSubject = subs.includes(subject) ? subject : subs[0];

  const roster = useMemo(
    () => students.filter((s) => s.className === exam.className).sort((a, b) => a.roll - b.roll),
    [exam.className],
  );

  const value = (id: string) => {
    if (draft && draft[id] !== undefined) return draft[id];
    const m = marks.find((x) => x.studentId === id && x.examId === exam.id && x.subject === activeSubject);
    return m ? String(m.marks) : "";
  };

  const entered = roster.filter((s) => value(s.id) !== "").length;
  const nums = roster
    .map((s) => value(s.id))
    .filter((v) => v !== "")
    .map(Number);
  const avg = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
  const top = nums.length ? Math.max(...nums) : 0;

  const change = (id: string, v: string) => {
    const clamped = v === "" ? "" : String(Math.max(0, Math.min(exam.maxMarks, Number(v))));
    setDraft({ ...(draft ?? {}), [id]: clamped });
    setSaved(false);
  };

  const publish = () => {
    const rows = roster
      .filter((s) => value(s.id) !== "")
      .map((s) => ({
        studentId: s.id,
        examId: exam.id,
        subject: activeSubject,
        marks: Number(value(s.id)),
        max: exam.maxMarks,
      }));
    if (rows.length === 0) {
      toast("Enter at least one mark first");
      return;
    }
    saveMarks(rows);
    setSaved(true);
  };

  return (
    <>
      <PageHead
        title="Marks Entry"
        desc="Enter and publish subject marks — parents and students see them instantly."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Export sheet
            </button>
            <button className="btn btn-primary" onClick={publish}>
              <Icon name="check" size={16} /> {saved ? "Published ✓" : "Save & publish"}
            </button>
          </>
        }
      />

      <div className="card" style={{ padding: 16 }}>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <div>
            <label className="label">Examination</label>
            <select className="select" style={{ width: 260 }} value={examId} onChange={(e) => { setExamId(e.target.value); setDraft(null); }}>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.className} · {e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="select" style={{ width: 200 }} value={activeSubject} onChange={(e) => { setSubject(e.target.value); setDraft(null); }}>
              {subs.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <label className="label">Maximum marks</label>
            <div className="input" style={{ width: 130, background: "var(--surface-2)", fontWeight: 700 }}>
              {exam.maxMarks}
            </div>
          </div>
        </div>
      </div>

      <div className="grid g-4 mt">
        <Stat label="Students" value={roster.length} icon="users" tone="bg-primary" foot={exam.className} />
        <Stat label="Marks Entered" value={`${entered}/${roster.length}`} icon="edit" tone="bg-info" foot={saved ? "Published" : "Draft mode"} />
        <Stat label="Class Average" value={`${avg}`} icon="chart" tone="bg-success" foot={`out of ${exam.maxMarks}`} trend={avg > exam.maxMarks * 0.6 ? "up" : "down"} />
        <Stat label="Highest Score" value={top} icon="star" tone="bg-violet" foot={`${gradeOf((top / exam.maxMarks) * 100)} grade`} />
      </div>

      <Card
        title={`${exam.name} — ${activeSubject}`}
        sub={`${roster.length} students · enter marks out of ${exam.maxMarks}`}
        pad={false}
        right={<Badge tone={saved ? "b-success" : "b-warning"}>{saved ? "Published" : "Draft"}</Badge>}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Student</th>
                <th className="num">Marks</th>
                <th className="num">%</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const raw = value(s.id);
                const n = raw === "" ? null : Number(raw);
                const pct = n === null ? 0 : Math.round((n / exam.maxMarks) * 100);
                const g = n === null ? "—" : gradeOf(pct);
                return (
                  <tr key={s.id}>
                    <td className="strong">{s.roll}</td>
                    <td><Person name={s.name} sub={s.admNo} /></td>
                    <td className="num">
                      <input
                        className="input"
                        type="number"
                        value={raw}
                        min={0}
                        max={exam.maxMarks}
                        placeholder="—"
                        onChange={(e) => change(s.id, e.target.value)}
                        style={{ width: 96, textAlign: "right", padding: "7px 10px" }}
                      />
                    </td>
                    <td className="num strong">{n === null ? "—" : `${pct}%`}</td>
                    <td>{n === null ? <span className="muted">—</span> : <Badge tone={gradeColor(g)}>{g}</Badge>}</td>
                    <td className="muted small">
                      {n === null ? "Awaiting entry" : pct >= 90 ? "Excellent" : pct >= 75 ? "Very good" : pct >= 50 ? "Satisfactory" : pct >= 33 ? "Needs improvement" : "Below pass mark"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {roster.length === 0 && <Empty icon="📝" title="No students" sub="This class has no enrolled students yet." />}
        </div>
      </Card>

      <div className="mt"><Card title="Already published results" sub="All subjects for this examination" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Student</th><th className="num">Obtained</th><th className="num">%</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {roster.slice(0, 8).map((s) => {
                const ms = marks.filter((m) => m.studentId === s.id && m.examId === exam.id);
                const got = ms.reduce((a, b) => a + b.marks, 0);
                const tot = ms.reduce((a, b) => a + b.max, 0);
                const pct = tot ? Math.round((got / tot) * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td className="strong">{s.name}</td>
                    <td className="num">{got}/{tot || "—"}</td>
                    <td className="num">{tot ? `${pct}%` : "—"}</td>
                    <td>{tot ? <Badge tone={gradeColor(gradeOf(pct))}>{gradeOf(pct)}</Badge> : <span className="muted">Not published</span>}</td>
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
