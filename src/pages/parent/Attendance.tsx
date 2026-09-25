import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { ATTENDANCE_DATES } from "../../data/db";
import { Badge, Card, Empty, PageHead, Stat } from "../../components/ui";
import { useFamily } from "../../store/family";

const color: Record<string, string> = {
  Present: "var(--success)",
  Absent: "var(--danger)",
  Late: "var(--warning)",
};
const bg: Record<string, string> = {
  Present: "var(--success-soft)",
  Absent: "var(--danger-soft)",
  Late: "var(--warning-soft)",
};

export default function ParentAttendance() {
  const { attendance } = useApp();
  const kids = useFamily();
  const [kid, setKid] = useState(kids[0]?.id ?? "");
  const child = kids.find((k) => k.id === kid) ?? kids[0];

  const rows = attendance.filter((a) => a.studentId === child?.id);
  const present = rows.filter((r) => r.status === "Present").length;
  const absent = rows.filter((r) => r.status === "Absent").length;
  const late = rows.filter((r) => r.status === "Late").length;
  const pct = rows.length ? Math.round((present / rows.length) * 100) : 0;

  const byDate = new Map(rows.map((r) => [r.date, r.status]));

  return (
    <>
      <PageHead
        title="Attendance"
        desc="Daily and monthly attendance record for your child."
        actions={
          <button className="btn btn-outline" onClick={() => window.print()}>
            ⬇ Download report
          </button>
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

      <div className="grid g-4">
        <Stat label="Attendance %" value={`${pct}%`} icon="check" tone={pct >= 85 ? "bg-success" : "bg-warning"} foot="September 2026" trend={pct >= 85 ? "up" : "down"} />
        <Stat label="Days Present" value={present} icon="calendar" tone="bg-primary" foot={`of ${rows.length} working days`} />
        <Stat label="Absent" value={absent} icon="close" tone="bg-danger" foot="Parents notified" />
        <Stat label="Late" value={late} icon="clock" tone="bg-warning" foot="After 8:30 AM" />
      </div>

      <div className="grid g-23 mt">
        <Card title="Monthly register" sub={`${child?.name} · September 2026`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="small muted" style={{ textAlign: "center", fontWeight: 700 }}>{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 0;
              const date = `2026-09-${String(day).padStart(2, "0")}`;
              const st = byDate.get(date);
              const inMonth = day >= 1 && day <= 30;
              const weekend = (i % 7) >= 5;
              if (!inMonth) return <div key={i} />;
              if (weekend)
                return (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: 10, background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: 12, color: "var(--text-3)" }}>
                    {day}
                  </div>
                );
              return (
                <div
                  key={i}
                  title={st ?? "No record"}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: st ? bg[st] : "#f8fafc",
                    color: st ? color[st] : "var(--text-3)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    border: st ? "1px solid transparent" : "1px dashed var(--border-strong)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap" style={{ marginTop: 16, gap: 16 }}>
            <span className="flex gap-sm small"><i style={{ width: 12, height: 12, borderRadius: 4, background: "var(--success-soft)", border: `2px solid var(--success)` }} /> Present</span>
            <span className="flex gap-sm small"><i style={{ width: 12, height: 12, borderRadius: 4, background: "var(--danger-soft)", border: `2px solid var(--danger)` }} /> Absent</span>
            <span className="flex gap-sm small"><i style={{ width: 12, height: 12, borderRadius: 4, background: "var(--warning-soft)", border: `2px solid var(--warning)` }} /> Late</span>
            <span className="flex gap-sm small"><i style={{ width: 12, height: 12, borderRadius: 4, background: "#f1f5f9" }} /> Holiday</span>
          </div>
        </Card>

        <Card title="Day-by-day record" sub="Last 14 working days" pad={false}>
          <div className="table-wrap" style={{ maxHeight: 460, overflowY: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {[...ATTENDANCE_DATES].reverse().map((d) => {
                  const st = byDate.get(d);
                  return (
                    <tr key={d}>
                      <td className="strong">{new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</td>
                      <td>{st ? <Badge tone={st === "Present" ? "b-success" : st === "Late" ? "b-warning" : "b-danger"}>{st}</Badge> : <span className="muted">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <Empty icon="🗓️" title="No attendance records" sub="Attendance has not been marked yet." />}
          </div>
        </Card>
      </div>

      <div className="mt"><Card title="Attendance summary" sub="Month-wise percentage">
        <div className="hbar">
          {[
            ["April 2026", 96], ["May 2026", 93], ["June 2026", 90],
            ["July 2026", 97], ["August 2026", 94], ["September 2026", pct],
          ].map(([m, v]) => (
            <div className="row" key={m as string}>
              <div className="top"><span>{m}</span><b>{v}%</b></div>
              <div className="progress"><i style={{ width: `${v}%`, background: (v as number) < 85 ? "var(--warning)" : "var(--success)" }} /></div>
            </div>
          ))}
        </div>
      </Card></div>
    </>
  );
}
