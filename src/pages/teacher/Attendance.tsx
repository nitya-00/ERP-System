import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { ATTENDANCE_DATES, classLabel, fmtDate, todayISO } from "../../data/db";
import { useTeacher } from "../../store/TeacherContext";
import { Badge, Card, Empty, Icon, PageHead, Person, Stat } from "../../components/ui";

type Mark = "Present" | "Absent" | "Late";

export default function TeacherAttendance() {
  const { attendance, setAttendance, classes: allClasses, students } = useApp();
  const { classes: assigned, classId, setClassId } = useTeacher();
  const classes = assigned.length ? assigned : allClasses;
  const [date, setDate] = useState(todayISO());
  const [draft, setDraft] = useState<Record<string, Mark> | null>(null);
  const [saved, setSaved] = useState(true);

  const cls = classes.find((c) => c.id === classId) ?? classes[0] ?? allClasses[0];
  const roster = useMemo(
    () =>
      students
        .filter((s) => s.className === cls.className && s.section === cls.section)
        .sort((a, b) => a.roll - b.roll),
    [cls, students],
  );

  const current = (id: string): Mark => {
    if (draft && draft[id]) return draft[id];
    const row = attendance.find((a) => a.studentId === id && a.date === date);
    return (row?.status as Mark) ?? "Present";
  };

  const setAll = (v: Mark) => {
    const next: Record<string, Mark> = {};
    roster.forEach((s) => (next[s.id] = v));
    setDraft(next);
    setSaved(false);
  };

  const setOne = (id: string, v: Mark) => {
    setDraft({ ...(draft ?? {}), [id]: v });
    setSaved(false);
  };

  const counts = roster.reduce(
    (acc, s) => {
      acc[current(s.id)]++;
      return acc;
    },
    { Present: 0, Absent: 0, Late: 0 } as Record<Mark, number>,
  );

  const save = () => {
    setAttendance(roster.map((s) => ({ studentId: s.id, date, status: current(s.id) })));
    setSaved(true);
  };

  return (
    <>
      <PageHead
        title="Attendance"
        desc={`${classLabel(cls.className, cls.section)} · ${fmtDate(date)} · ${roster.length} students on the register`}
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setAll("Present")}>
              <Icon name="check" size={16} /> Mark all present
            </button>
            <button className="btn btn-primary" onClick={save} disabled={roster.length === 0}>
              <Icon name="check" size={16} /> {saved ? "Saved ✓" : "Save attendance"}
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Present" value={counts.Present} icon="check" tone="bg-success" foot={`${Math.round((counts.Present / (roster.length || 1)) * 100)}% of class`} trend="up" />
        <Stat label="Absent" value={counts.Absent} icon="close" tone="bg-danger" foot="Parents will be alerted" />
        <Stat label="Late" value={counts.Late} icon="clock" tone="bg-warning" foot="Arrived after 8:30 AM" />
        <Stat label="Class Strength" value={roster.length} icon="users" tone="bg-primary" foot={classLabel(cls.className, cls.section)} />
      </div>

      <Card
        title={`${classLabel(cls.className, cls.section)} · Daily Register`}
        sub={`Class teacher: ${cls.classTeacher} · Room ${cls.room}`}
        pad={false}
        right={
          <div className="flex" style={{ gap: 9 }}>
            <select className="select" style={{ width: 160 }} value={cls.id} onChange={(e) => { setClassId(e.target.value); setDraft(null); }}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{classLabel(c.className, c.section)}</option>
              ))}
            </select>
            <select className="select" style={{ width: 150 }} value={date} onChange={(e) => { setDate(e.target.value); setDraft(null); }}>
              {[...ATTENDANCE_DATES].reverse().map((d) => (
                <option key={d} value={d}>{fmtDate(d)}</option>
              ))}
            </select>
          </div>
        }
      >
        <div style={{ padding: "14px 20px", display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
          <span className="small muted">Bulk actions:</span>
          <button className="chip-pill" onClick={() => setAll("Present")}>✓ All present</button>
          <button className="chip-pill" onClick={() => setAll("Absent")}>✗ All absent</button>
          <button className="chip-pill" onClick={() => setAll("Late")}>⏱ All late</button>
          <span style={{ marginLeft: "auto" }}>
            <Badge tone={saved ? "b-success" : "b-warning"}>{saved ? "Register saved" : "Unsaved changes"}</Badge>
          </span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Student</th>
                <th>Admission No</th>
                <th style={{ width: 300 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const v = current(s.id);
                return (
                  <tr key={s.id}>
                    <td className="strong">{s.roll}</td>
                    <td><Person name={s.name} sub={s.parentPhone} /></td>
                    <td>{s.admNo}</td>
                    <td>
                      <div className="seg">
                        {(["Present", "Absent", "Late"] as const).map((opt) => (
                          <button
                            key={opt}
                            className={v === opt ? "on" : ""}
                            onClick={() => setOne(s.id, opt)}
                          >
                            {opt === "Present" ? "✓ " : opt === "Absent" ? "✗ " : "⏱ "}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {roster.length === 0 && (
            <Empty icon="🧑‍🎓" title="No students in this class" sub="Admit students to start marking attendance." />
          )}
        </div>
      </Card>

      <div className="mt"><Card title="Monthly summary" sub={`${classLabel(cls.className, cls.section)} · ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}>
        <div className="hbar">
          {roster.slice(0, 10).map((s) => {
            const rows = attendance.filter((a) => a.studentId === s.id);
            const p = rows.filter((r) => r.status === "Present").length;
            const pct = rows.length ? Math.round((p / rows.length) * 100) : 0;
            return (
              <div className="row" key={s.id}>
                <div className="top"><span>{s.name}</span><b>{pct}%</b></div>
                <div className="progress">
                  <i style={{ width: `${pct}%`, background: pct < 75 ? "var(--danger)" : pct < 88 ? "var(--warning)" : "var(--success)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card></div>
    </>
  );
}
