import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { me, useTeacher } from "../../store/TeacherContext";
import {
  PASS_PERCENT,
  TEACHER_EXAMS,
  classLabel,
  fmtDate,
  gradeColor,
  gradeOf,
} from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead, Person, Stat } from "../../components/ui";
import { rosterOf } from "./shared";

export default function TeacherMarks() {
  const { students, classes } = useApp();
  const { classes: myClasses, classId, setClassId, markOf, setMark, publishMarks } =
    useTeacher();

  const [examId, setExamId] = useState(TEACHER_EXAMS[0].id);
  const [saved, setSaved] = useState(false);

  const exam = TEACHER_EXAMS.find((e) => e.id === examId) ?? TEACHER_EXAMS[0];
  const cls = classes.find((c) => c.id === classId) ?? myClasses[0];
  const roster = rosterOf(students, cls);
  const subject = me.subject;

  const value = (id: string) => markOf(id, exam.id, subject);
  const entered = roster.filter((s) => value(s.id) !== null).length;
  const nums = roster
    .map((s) => value(s.id))
    .filter((v): v is number => v !== null);
  const avg = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
  const top = nums.length ? Math.max(...nums) : 0;
  const passed = nums.filter((v) => v >= PASS_PERCENT).length;
  const failed = nums.length - passed;

  const publish = () => {
    const rows = roster
      .filter((s) => value(s.id) !== null)
      .map((s) => ({
        studentId: s.id,
        examId: exam.id,
        subject,
        marks: value(s.id) as number,
        max: exam.maxMarks,
      }));
    publishMarks(rows);
    if (rows.length > 0) setSaved(true);
  };

  return (
    <>
      <PageHead
        title="Marks Entry"
        desc={`${cls ? classLabel(cls.className, cls.section) : "—"} · ${exam.name} · ${subject} · ${fmtDate(exam.from)} – ${fmtDate(exam.to)}`}
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
            <label className="label">Class</label>
            <select
              className="select"
              style={{ width: 200 }}
              value={cls?.id ?? ""}
              onChange={(e) => {
                setClassId(e.target.value);
                setSaved(false);
              }}
            >
              {myClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c.className, c.section)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Examination</label>
            <select
              className="select"
              style={{ width: 240 }}
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                setSaved(false);
              }}
            >
              {TEACHER_EXAMS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} · {e.status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <div
              className="input"
              style={{ width: 160, background: "var(--surface-2)", fontWeight: 700 }}
            >
              {subject}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <label className="label">Max marks / pass mark</label>
            <div className="flex" style={{ gap: 8 }}>
              <div
                className="input"
                style={{ width: 84, background: "var(--surface-2)", fontWeight: 700 }}
              >
                {exam.maxMarks}
              </div>
              <div
                className="input"
                style={{ width: 96, background: "var(--surface-2)", fontWeight: 700 }}
              >
                {PASS_PERCENT}
              </div>
            </div>
          </div>
        </div>
        <div className="hint" style={{ marginTop: 10 }}>
          The teacher portal runs two examinations — {TEACHER_EXAMS.map((e) => e.name).join(" and ")}.
        </div>
      </div>

      <div className="grid g-4 mt">
        <Stat
          label="Marks Entered"
          value={`${entered}/${roster.length}`}
          icon="edit"
          tone="bg-info"
          foot={saved ? "Published" : "Draft — not yet saved"}
        />
        <Stat
          label="Class Average"
          value={nums.length ? avg : "—"}
          icon="chart"
          tone="bg-success"
          foot={`out of ${exam.maxMarks}`}
          trend={nums.length && avg >= exam.maxMarks * 0.6 ? "up" : "down"}
        />
        <Stat
          label="Highest Score"
          value={nums.length ? top : "—"}
          icon="star"
          tone="bg-violet"
          foot={nums.length ? `${gradeOf((top / exam.maxMarks) * 100)} grade` : "No entries yet"}
        />
        <Stat
          label="Passed"
          value={nums.length ? passed : "—"}
          icon="check"
          tone={failed ? "bg-warning" : "bg-success"}
          foot={nums.length ? `${failed} below pass mark (${PASS_PERCENT})` : `Pass mark ${PASS_PERCENT}`}
        />
      </div>

      <Card
        title={`${exam.name} — ${subject}`}
        sub={`${cls ? classLabel(cls.className, cls.section) : ""} · enter marks out of ${exam.maxMarks}`}
        pad={false}
        right={
          <Badge tone={saved ? "b-success" : "b-warning"}>{saved ? "Published" : "Draft"}</Badge>
        }
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
                <th>Result</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const n = value(s.id);
                const pct = n === null ? 0 : Math.round((n / exam.maxMarks) * 100);
                const g = n === null ? "—" : gradeOf(pct);
                return (
                  <tr key={s.id}>
                    <td className="strong">{s.roll}</td>
                    <td>
                      <Person name={s.name} sub={s.admNo} />
                    </td>
                    <td className="num">
                      <input
                        className="input"
                        type="number"
                        value={n === null ? "" : String(n)}
                        min={0}
                        max={exam.maxMarks}
                        placeholder="—"
                        onChange={(e) => {
                          setMark(s.id, exam.id, subject, e.target.value, exam.maxMarks);
                          setSaved(false);
                        }}
                        style={{ width: 96, textAlign: "right", padding: "7px 10px" }}
                      />
                    </td>
                    <td className="num strong">{n === null ? "—" : `${pct}%`}</td>
                    <td>
                      {n === null ? (
                        <span className="muted">—</span>
                      ) : (
                        <Badge tone={gradeColor(g)}>{g}</Badge>
                      )}
                    </td>
                    <td>
                      {n === null ? (
                        <span className="muted small">Awaiting</span>
                      ) : n >= PASS_PERCENT ? (
                        <Badge tone="b-success">Passed</Badge>
                      ) : (
                        <Badge tone="b-danger">Failed</Badge>
                      )}
                    </td>
                    <td className="muted small">
                      {n === null
                        ? "Awaiting entry"
                        : pct >= 90
                          ? "Excellent"
                          : pct >= 75
                            ? "Very good"
                            : pct >= 50
                              ? "Satisfactory"
                              : n >= PASS_PERCENT
                                ? "Needs improvement"
                                : "Below pass mark"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {roster.length === 0 && (
            <Empty
              icon="📝"
              title="No students"
              sub="This class-section has no enrolled students yet."
            />
          )}
        </div>
      </Card>
    </>
  );
}
