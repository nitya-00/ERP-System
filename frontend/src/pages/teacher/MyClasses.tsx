import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { useTeacher } from "../../store/TeacherContext";
import { classLabel, demoUsers, exams, fmtDate, strength, teachers, todayISO } from "../../data/db";
import { Badge, Card, Icon, PageHead, Person, Stat } from "../../components/ui";

const timetable = [
  { day: "Monday", slots: ["Mathematics", "Mathematics", "Science", "English", "Free"] },
  { day: "Tuesday", slots: ["Mathematics", "Free", "Computer Sci.", "Mathematics", "Sports"] },
  { day: "Wednesday", slots: ["English", "Mathematics", "Mathematics", "Free", "Science"] },
  { day: "Thursday", slots: ["Science", "Mathematics", "Free", "English", "Mathematics"] },
  { day: "Friday", slots: ["Mathematics", "Computer Sci.", "Science", "Mathematics", "Assembly"] },
];

const periods = ["8:00 – 8:45", "8:45 – 9:30", "9:35 – 10:20", "10:20 – 11:05", "11:20 – 12:05"];

export default function TeacherClasses() {
  const { students, attendance, classes } = useApp();
  const { setClassId } = useTeacher();
  const me = teachers.find((t) => t.email === demoUsers.teacher.email) ?? teachers[0];
  const myClasses = classes.filter((c) => me.classes.includes(c.className));
  const home = myClasses[0] ?? classes[0];
  const classTeacherOfMe = classes.filter((c) => c.classTeacher === me.name);
  const today = todayISO();
  const marked = students.filter((s) => attendance.some((a) => a.studentId === s.id && a.date === today));

  const roster = home
    ? students.filter((s) => s.className === home.className && s.section === home.section)
    : [];
  const presentToday = marked.filter((s) =>
    attendance.find((a) => a.studentId === s.id && a.date === today)?.status === "Present",
  ).length;

  return (
    <>
      <PageHead
        title="My Classes"
        desc={`Good morning, ${me.name} · ${me.subject} · ${me.classes.join(" & ")}`}
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
        <Stat label="Classes Assigned" value={myClasses.length} icon="book" tone="bg-primary" foot={myClasses.map((c) => c.className).join(", ")} />
        <Stat label="My Students" value={myClasses.reduce((a, c) => a + strength(students, c.className, c.section), 0)} icon="users" tone="bg-violet" foot="Across all sections" />
        <Stat label="Present Today" value={`${presentToday}/${roster.length}`} icon="check" tone="bg-success" foot={`${home ? classLabel(home.className, home.section) : "—"} · ${fmtDate(today)}`} trend="up" />
        <Stat label="Periods This Week" value={22} icon="clock" tone="bg-info" foot="7 free periods" />
      </div>

      <div className="grid g-23 mt">
        <Card title="My Timetable" sub="Weekly period allocation" pad={false}
          right={<Badge tone="b-primary" plain>Room U-02</Badge>}>
          <div className="table-wrap">
            <table className="tt">
              <thead>
                <tr>
                  <th>Day</th>
                  {periods.map((p) => <th key={p}>{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {timetable.map((d) => (
                  <tr key={d.day}>
                    <td style={{ fontWeight: 700, background: "var(--surface-2)" }}>{d.day}</td>
                    {d.slots.map((s, i) => (
                      <td key={i} className={`slot ${s === "Free" ? "free" : ""}`}>{s}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="flex flex-wrap">
            <Link to="/teacher/attendance" className="btn btn-primary btn-block">
              <Icon name="check" size={16} /> Take attendance
            </Link>
            <Link to="/teacher/marks" className="btn btn-outline btn-block">
              <Icon name="edit" size={16} /> Enter exam marks
            </Link>
            <Link to="/teacher/notices" className="btn btn-outline btn-block">
              <Icon name="mega" size={16} /> Read notices
            </Link>
            <Link to="/teacher/notifications" className="btn btn-outline btn-block">
              <Icon name="bell" size={16} /> Notifications
            </Link>
          </div>
          <div className="divider" />
          <div className="kv"><span className="k">Class teacher of</span><span className="v">{classTeacherOfMe.map((c) => classLabel(c.className, c.section)).join(", ") || "—"}</span></div>
          <div className="kv"><span className="k">Subjects</span><span className="v">{me.subject}, Mathematics</span></div>
          <div className="kv"><span className="k">Experience</span><span className="v">{me.experience} years</span></div>
          <div className="kv"><span className="k">Next exam</span><span className="v">{(() => { const e = exams.filter((x) => x.status === "Upcoming").sort((a, b) => (a.from < b.from ? -1 : 1))[0]; return e ? `${e.name} · ${fmtDate(e.from)}` : "—"; })()}</span></div>
        </Card>
      </div>

      <div className="grid g-2 mt">
        <Card title={`${home ? classLabel(home.className, home.section) : "Class"} roster`} sub={`${roster.length} students`} pad={false}
          right={<Link to="/teacher/attendance" className="btn btn-soft btn-sm">Attendance</Link>}>
          <div className="table-wrap" style={{ maxHeight: 430, overflowY: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Roll</th><th>Today</th></tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const a = attendance.find((x) => x.studentId === s.id && x.date === today);
                  return (
                    <tr key={s.id}>
                      <td><Person name={s.name} sub={s.admNo} /></td>
                      <td>{s.roll}</td>
                      <td>
                        <Badge tone={a?.status === "Present" ? "b-success" : a?.status === "Late" ? "b-warning" : a?.status === "Absent" ? "b-danger" : "b-gray"}>
                          {a?.status ?? "—"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Classes handled" sub="Subject-wise allocation">
          {myClasses.map((c) => (
            <div className="list-item" key={c.id}>
              <div className="body">
                <div className="ttl">{classLabel(c.className, c.section)}</div>
                <div className="txt">{c.subjects.join(" · ")}</div>
                <div className="when">
                  <Badge tone="b-gray" plain>{c.room}</Badge>
                  <span>{strength(students, c.className, c.section)} students</span>
                  <span>·</span>
                  <span>Class teacher: {c.classTeacher}</span>
                </div>
              </div>
              <Link
                to={`/teacher/classes/${c.id}`}
                className="btn btn-soft btn-sm"
                onClick={() => setClassId(c.id)}
              >
                Open
              </Link>
            </div>
          ))}
          <div className="hint" style={{ marginTop: 10 }}>
            Term-2 lesson plans are due by {fmtDate("2026-09-30")}.
          </div>
        </Card>
      </div>
    </>
  );
}
