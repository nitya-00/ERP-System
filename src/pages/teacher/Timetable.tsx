import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { me, useTeacher } from "../../store/TeacherContext";
import { classLabel, todayLong } from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead } from "../../components/ui";
import { PERIODS, WEEK, rosterOf, todayWeekdayIndex } from "./shared";

export default function TeacherTimetable() {
  const { students } = useApp();
  const { classes: myClasses } = useTeacher();

  const idx = todayWeekdayIndex();
  const list = myClasses.flatMap((c) => rosterOf(students, c));
  const free = WEEK.reduce((a, d) => a + d.slots.filter((s) => s === "Free").length, 0);
  const total = WEEK.reduce((a, d) => a + d.slots.length, 0);

  return (
    <>
      <PageHead
        title="Timetable"
        desc={`${me.name} · ${me.subject} · ${todayLong()}`}
        actions={
          <>
            <Link to="/teacher/attendance" className="btn btn-outline">
              <Icon name="check" size={16} /> Register
            </Link>
            <Link to="/teacher/marks" className="btn btn-primary">
              <Icon name="edit" size={16} /> Marks
            </Link>
          </>
        }
      />

      <Card
        title="Weekly periods"
        sub="Monday – Friday · 5 periods a day"
        pad={false}
        right={<Badge tone="b-primary" plain>{total - free} teaching periods</Badge>}
      >
        <div className="table-wrap">
          <table className="tt">
            <thead>
              <tr>
                <th>Day</th>
                {PERIODS.map((p, i) => (
                  <th key={p} className={i === idx ? "today-col" : ""}>
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEK.map((d, di) => (
                <tr key={d.day} className={di === idx ? "today-row" : ""}>
                  <td style={{ fontWeight: 700, background: "var(--surface-2)" }}>
                    {d.day}
                    {di === idx && <Badge tone="b-success" plain> · today</Badge>}
                  </td>
                  {d.slots.map((s, i) => (
                    <td
                      key={i}
                      className={`slot ${s === "Free" ? "free" : ""} ${i === idx ? "today-col" : ""}`}
                    >
                      {s}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid g-2 mt">
        <Card title="My classes & rooms" sub={`${myClasses.length} sections · ${list.length} students`} pad={false}>
          <div className="list">
            {myClasses.map((c) => (
              <div className="list-item" key={c.id}>
                <div className="body">
                  <div className="ttl">{classLabel(c.className, c.section)}</div>
                  <div className="txt">{c.subjects.join(" · ")}</div>
                  <div className="when">
                    <Badge tone="b-gray" plain>{c.room}</Badge>
                    <span>{rosterOf(students, c).length} students</span>
                    <span>·</span>
                    <span>Class teacher: {c.classTeacher}</span>
                  </div>
                </div>
                <Link to={`/teacher/classes/${c.id}`} className="btn btn-soft btn-sm">
                  Open
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Week at a glance">
          <div className="kv"><span className="k">Periods per week</span><span className="v">{total}</span></div>
          <div className="kv"><span className="k">Free periods</span><span className="v">{free}</span></div>
          <div className="kv"><span className="k">Subjects</span><span className="v">{me.subject}</span></div>
          <div className="kv"><span className="k">Classes</span><span className="v">{[...new Set(myClasses.map((c) => c.className))].join(", ")}</span></div>
          <div className="kv"><span className="k">Today</span><span className="v">{idx >= 0 ? WEEK[idx].day : "Weekend — no periods"}</span></div>
          <div className="divider" />
          <div className="chipbar">
            {myClasses.map((c) => (
              <Link key={c.id} to={`/teacher/classes/${c.id}`} className="chip">
                {classLabel(c.className, c.section)}
              </Link>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 10 }}>
            Need to check a register or enter marks? Open a class to jump straight in.
          </div>
          <div className="flex mt-sm">
            <Link to="/teacher/attendance" className="btn btn-soft btn-sm"><Icon name="check" size={14} /> Register</Link>
            <Link to="/teacher/marks" className="btn btn-soft btn-sm"><Icon name="edit" size={14} /> Marks</Link>
          </div>
        </Card>
      </div>

      {myClasses.length === 0 && (
        <div className="mt">
          <Card>
            <Empty icon="🗓️" title="No classes assigned" sub="Your timetable will appear here once classes are assigned." />
          </Card>
        </div>
      )}
    </>
  );
}
