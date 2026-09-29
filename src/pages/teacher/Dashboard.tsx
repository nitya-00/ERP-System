import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { me, useTeacher } from "../../store/TeacherContext";
import {
  TEACHER_EXAMS,
  classLabel,
  fmtDate,
  todayISO,
  todayLong,
} from "../../data/db";
import { Badge, Card, Empty, Icon, PageHead, Person, Stat, statusTone } from "../../components/ui";
import {
  PERIODS,
  classPct,
  dayCounts,
  rosterOf,
  streakOf,
  todaySlots,
} from "./shared";

export default function TeacherDashboard() {
  const { students, classes } = useApp();
  const { classes: myClasses, statusOf, setClassId } = useTeacher();

  const today = todayISO();
  const roster = myClasses.flatMap((c) => rosterOf(students, c));
  const counts = dayCounts(roster, statusOf, today);
  const levels = [...new Set(myClasses.map((c) => c.className))];
  const exam = TEACHER_EXAMS.find((e) => e.status === "In Progress") ?? TEACHER_EXAMS[0];
  const slots = todaySlots();

  const absentToday = roster
    .filter((s) => statusOf(s.id, today) === "Absent")
    .map((s) => {
      const cls = classes.find((c) => c.className === s.className && c.section === s.section);
      return { s, cls, streak: streakOf(s.id, statusOf) };
    })
    .sort((a, b) => b.streak - a.streak);

  const firstName = me.name.split(" ")[0];
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHead
        title="Teacher Dashboard"
        desc={`${greet}, ${firstName} · ${me.subject} · ${todayLong()}`}
        actions={
          <>
            <Link to="/teacher/attendance" className="btn btn-outline">
              <Icon name="check" size={16} /> Mark attendance
            </Link>
            <Link to="/teacher/marks" className="btn btn-primary">
              <Icon name="edit" size={16} /> Enter marks
            </Link>
          </>
        }
      />

      <div className="grid g-4">
        <Stat
          label="My Classes"
          value={myClasses.length}
          icon="book"
          tone="bg-primary"
          foot={levels.join(", ")}
        />
        <Stat
          label="My Students"
          value={roster.length}
          icon="users"
          tone="bg-violet"
          foot={`Across ${myClasses.length} sections`}
        />
        <Stat
          label="Present Today"
          value={`${counts.present}/${counts.total}`}
          icon="check"
          tone="bg-success"
          foot={fmtDate(today)}
          trend={counts.total && counts.present / counts.total >= 0.85 ? "up" : "down"}
        />
        <Stat
          label="Next Examination"
          value={exam.name}
          icon="calendar"
          tone="bg-info"
          foot={`${fmtDate(exam.from)} → ${fmtDate(exam.to)}`}
        />
      </div>

      <div className="grid g-3 mt">
        {myClasses.map((c) => {
          const list = rosterOf(students, c);
          const d = dayCounts(list, statusOf, today);
          const pct = classPct(list, statusOf);
          return (
            <Card
              key={c.id}
              className="class-card"
              title={classLabel(c.className, c.section)}
              sub={`${list.length} students · Room ${c.room}`}
              right={
                c.classTeacher === me.name ? (
                  <Badge tone="b-primary">Class teacher</Badge>
                ) : (
                  <Badge tone="b-gray" plain>{c.classTeacher}</Badge>
                )
              }
            >
              <div className="cc-stats">
                <div className="cc-stat ok">
                  <b>{d.present}</b>
                  <span>Present</span>
                </div>
                <div className="cc-stat bad">
                  <b>{d.absent}</b>
                  <span>Absent</span>
                </div>
                <div className="cc-stat warn">
                  <b>{d.late}</b>
                  <span>Late</span>
                </div>
              </div>

              <div className="cc-meta">
                <span>Attendance · last 14 days</span>
                <b>{pct}%</b>
              </div>
              <div className="progress">
                <i
                  style={{
                    width: `${pct}%`,
                    background: pct >= 85 ? "var(--success)" : pct >= 75 ? "var(--warning)" : "var(--danger)",
                  }}
                />
              </div>

              <div className="cc-actions">
                <Link
                  to={`/teacher/classes/${c.id}`}
                  className="btn btn-primary btn-sm"
                  onClick={() => setClassId(c.id)}
                >
                  Open class
                </Link>
                <Link
                  to="/teacher/attendance"
                  className="btn btn-soft btn-sm"
                  onClick={() => setClassId(c.id)}
                >
                  Register
                </Link>
                <Link
                  to="/teacher/marks"
                  className="btn btn-outline btn-sm"
                  onClick={() => setClassId(c.id)}
                >
                  Marks
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid g-23 mt">
        <Card
          title="Absent today"
          sub="Across my classes · consecutive days marked"
          pad={false}
          right={
            <Badge tone={absentToday.length ? "b-danger" : "b-success"}>
              {absentToday.length} students
            </Badge>
          }
        >
          {absentToday.length === 0 ? (
            <Empty icon="🎉" title="Everyone is present" sub="No absences recorded in your classes today." />
          ) : (
            <div className="table-wrap" style={{ maxHeight: 340, overflowY: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th className="num">Roll</th>
                    <th>Today</th>
                    <th>Consecutive</th>
                  </tr>
                </thead>
                <tbody>
                  {absentToday.slice(0, 12).map(({ s, cls, streak }) => (
                    <tr key={s.id}>
                      <td><Person name={s.name} sub={s.admNo} /></td>
                      <td>{cls ? classLabel(cls.className, cls.section) : classLabel(s.className, s.section)}</td>
                      <td className="num strong">{s.roll}</td>
                      <td><Badge tone={statusTone("Absent")}>Absent</Badge></td>
                      <td>
                        {streak >= 3 ? (
                          <Badge tone="b-danger">{streak}+ days</Badge>
                        ) : streak > 1 ? (
                          <Badge tone="b-warning">{streak} days</Badge>
                        ) : (
                          <span className="muted small">1 day</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Today's timetable"
          sub={todayLong()}
          right={<Link to="/teacher/timetable" className="btn btn-soft btn-sm">Full timetable</Link>}
        >
          {slots.length === 0 ? (
            <Empty icon="🗓️" title="No periods today" sub="The teaching week runs Monday to Friday." />
          ) : (
            <>
              <div className="list">
                {slots.map((s, i) => (
                  <div className="list-item" key={PERIODS[i]}>
                    <div className="body">
                      <div className="ttl">{s === "Free" ? "Free period" : s}</div>
                      <div className="when">
                        <span>{PERIODS[i]}</span>
                        <span>·</span>
                        <span>{s === "Free" ? "Planning time" : "My section"}</span>
                      </div>
                    </div>
                    <Badge tone={s === "Free" ? "b-gray" : "b-primary"} plain>
                      {s === "Free" ? "Free" : "Period " + (i + 1)}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="kv">
                <span className="k">Examination</span>
                <span className="v">
                  {exam.name} · {exam.status}
                </span>
              </div>
              <div className="kv">
                <span className="k">Window</span>
                <span className="v">
                  {fmtDate(exam.from)} – {fmtDate(exam.to)}
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
