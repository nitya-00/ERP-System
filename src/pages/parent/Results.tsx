import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { classLabel, exams, gradeColor, gradeOf, marks as seedMarks } from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead, Stat } from "../../components/ui";
import { useFamily } from "../../store/family";

export default function ParentResults() {
  const { marks } = useApp();
  const kids = useFamily();
  const [kid, setKid] = useState(kids[0]?.id ?? "");
  const [examId, setExamId] = useState("EX-01");
  const child = kids.find((k) => k.id === kid) ?? kids[0];

  const published = exams.filter((e) => e.status !== "Upcoming");
  const exam = published.find((e) => e.id === examId) ?? published[0];

  const rows = exam
    ? exam.subjects.map((sub) => {
        const m = marks.find(
          (x) => x.studentId === child?.id && x.examId === exam.id && x.subject === sub,
        );
        return { subject: sub, got: m?.marks ?? null, max: m?.max ?? exam.maxMarks };
      })
    : [];

  const entered = rows.filter((r) => r.got !== null);
  const total = entered.reduce((a, b) => a + (b.got ?? 0), 0);
  const maxTotal = entered.reduce((a, b) => a + b.max, 0) || 1;
  const pct = Math.round((total / maxTotal) * 100);
  const grade = gradeOf(pct);

  const allMarks = child ? marks.filter((m) => m.studentId === child.id) : [];
  const overallTot = allMarks.reduce((a, b) => a + b.max, 0);
  const overallPct = overallTot ? Math.round((allMarks.reduce((a, b) => a + b.marks, 0) / overallTot) * 100) : 0;

  const terms = [
    { label: "Overall session average", value: `${overallPct}%` },
    { label: "Best subject", value: bestSubject() },
    { label: "Subjects cleared", value: `${entered.filter((r) => ((r.got ?? 0) / r.max) * 100 >= 33).length} / ${entered.length}` },
    { label: "Class rank (indicative)", value: `#${Math.max(1, Math.round((100 - pct) / 6))}` },
  ];

  return (
    <>
      <PageHead
        title="Results"
        desc="Marks, grades and the term report card for your child."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Download marksheet
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Icon name="print" size={16} /> Print report card
            </button>
          </>
        }
      />

      {kids.length > 1 && (
        <div className="chipbar" style={{ marginBottom: 18 }}>
          {kids.map((k) => (
            <button key={k.id} className={`chip-pill ${kid === k.id ? "on" : ""}`} onClick={() => setKid(k.id)}>
              {k.name} · {k.className}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <div>
            <label className="label">Examination</label>
            <select className="select" style={{ width: 280 }} value={exam?.id} onChange={(e) => setExamId(e.target.value)}>
              {published.map((e) => (
                <option key={e.id} value={e.id}>{e.className} · {e.name} ({e.term})</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="small muted">Report card</div>
            <div className="strong" style={{ fontSize: 17 }}>{child?.name}</div>
            <div className="small muted">{classLabel(child?.className ?? "", child?.section ?? "")} · {child?.admNo}</div>
          </div>
        </div>
      </div>

      <div className="grid g-4 mt">
        <Stat label="Aggregate" value={`${pct}%`} icon="chart" tone={pct >= 60 ? "bg-success" : "bg-warning"} foot={exam?.name} trend={pct >= 60 ? "up" : "down"} />
        <Stat label="Grade" value={grade} icon="star" tone="bg-primary" foot={pct >= 91 ? "Distinction" : pct >= 60 ? "First class" : "Needs effort"} />
        <Stat label="Total Score" value={`${total}/${maxTotal}`} icon="file" tone="bg-info" foot={`${entered.length} subjects`} />
        <Stat label="Session Average" value={`${overallPct}%`} icon="trend" tone="bg-violet" foot="All published exams" />
      </div>

      <div className="grid g-23 mt">
        <Card title="Subject-wise marks" sub={`${exam?.name} · ${exam?.term} · ${exam?.from ?? ""}`} pad={false}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Subject</th><th className="num">Marks</th><th className="num">Percentage</th><th>Grade</th><th>Remark</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const p = r.got === null ? null : Math.round(((r.got ?? 0) / r.max) * 100);
                  const g = p === null ? "—" : gradeOf(p);
                  return (
                    <tr key={r.subject}>
                      <td className="strong">{r.subject}</td>
                      <td className="num">{r.got === null ? "—" : `${r.got} / ${r.max}`}</td>
                      <td className="num">{p === null ? "—" : `${p}%`}</td>
                      <td>{p === null ? <span className="muted">—</span> : <Badge tone={gradeColor(g)}>{g}</Badge>}</td>
                      <td className="muted small">
                        {p === null ? "Awaiting publication" : p >= 90 ? "Outstanding" : p >= 75 ? "Excellent" : p >= 60 ? "Good" : p >= 40 ? "Average" : "Needs improvement"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {entered.length === 0 && <Empty icon="📊" title="Results not published yet" sub="Marks will appear here once the school publishes them." />}
          </div>
        </Card>

        <div className="grid" style={{ alignContent: "start" }}>
          <Card title="Report card summary">
            {terms.map((t) => (
              <div className="kv" key={t.label}><span className="k">{t.label}</span><span className="v">{t.value}</span></div>
            ))}
          </Card>

          <Card title="Grade scale">
            <div className="kv"><span className="k">A1</span><span className="v">91 – 100%</span></div>
            <div className="kv"><span className="k">A2</span><span className="v">81 – 90%</span></div>
            <div className="kv"><span className="k">B1</span><span className="v">71 – 80%</span></div>
            <div className="kv"><span className="k">B2</span><span className="v">61 – 70%</span></div>
            <div className="kv"><span className="k">C1</span><span className="v">51 – 60%</span></div>
            <div className="kv"><span className="k">C2</span><span className="v">41 – 50%</span></div>
            <div className="kv"><span className="k">D</span><span className="v">33 – 40%</span></div>
          </Card>
        </div>
      </div>

      <div className="mt"><Card title="Performance trend" sub="Percentage across published examinations">
        <div className="bars">
          {published.map((e) => {
            const ms = marks.filter((m) => m.studentId === child?.id && m.examId === e.id);
            const t = ms.reduce((a, b) => a + b.max, 0);
            const p = t ? Math.round((ms.reduce((a, b) => a + b.marks, 0) / t) * 100) : 0;
            return (
              <div className="bar" key={e.id} title={`${e.name}: ${p}%`}>
                <i style={{ height: `${p}%` }} />
                <span>{e.name.split(" ").slice(0, 2).join(" ")}</span>
              </div>
            );
          })}
        </div>
      </Card></div>
    </>
  );
}

function bestSubject() {
  const by: Record<string, { g: number; m: number }> = {};
  seedMarks.forEach((x) => {
    by[x.subject] ??= { g: 0, m: 0 };
    by[x.subject].g += x.marks;
    by[x.subject].m += x.max;
  });
  const best = Object.entries(by).sort(
    (a, b) => b[1].g / b[1].m - a[1].g / a[1].m,
  )[0];
  return best ? best[0] : "—";
}
