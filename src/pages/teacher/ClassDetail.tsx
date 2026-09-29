import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { me, useTeacher } from "../../store/TeacherContext";
import {
  TEACHER_EXAMS,
  classLabel,
  fmtDate,
  todayISO,
  todayLong,
} from "../../data/db";
import {
  Badge,
  Bars,
  Card,
  Empty,
  Icon,
  Modal,
  PageHead,
  Person,
  Stat,
  statusTone,
} from "../../components/ui";
import { HISTORY, classPct, dayCounts, historyOf, rosterOf, streakOf } from "./shared";

export default function ClassDetail() {
  const { classId } = useParams();
  const { students, classes, marks } = useApp();
  const { setClassId, statusOf, contactOf, markContacted, saveNote } = useTeacher();
  const [contactId, setContactId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const cls = classes.find((c) => c.id === classId);

  useEffect(() => {
    if (cls) setClassId(cls.id);
  }, [cls, setClassId]);

  if (!cls) {
    return (
      <>
        <PageHead title="Class not found" desc="This class-section is not part of your timetable." />
        <Card>
          <Empty icon="🏫" title="No such class" sub="Pick one of your classes to continue." />
          <div className="flex" style={{ justifyContent: "center" }}>
            <Link to="/teacher/classes" className="btn btn-primary">
              My classes
            </Link>
          </div>
        </Card>
      </>
    );
  }

  const roster = rosterOf(students, cls);
  const today = todayISO();
  const counts = dayCounts(roster, statusOf, today);
  const pct = classPct(roster, statusOf);

  const exam = TEACHER_EXAMS[0];
  const sheet = marks.filter(
    (m) =>
      m.examId === exam.id &&
      m.subject === me.subject &&
      roster.some((s) => s.id === m.studentId),
  );
  const avg = sheet.length
    ? Math.round(sheet.reduce((a, b) => a + b.marks, 0) / sheet.length)
    : 0;

  const flagged = roster
    .map((s) => ({ s, streak: streakOf(s.id, statusOf) }))
    .filter((x) => x.streak >= 3)
    .sort((a, b) => b.streak - a.streak);

  const daily = HISTORY.slice(-7).map((d) => ({
    m: d.slice(8),
    v: roster.length
      ? Math.round((roster.filter((s) => statusOf(s.id, d) === "Present").length / roster.length) * 100)
      : 0,
  }));

  const contact = contactId ? students.find((s) => s.id === contactId) ?? null : null;

  return (
    <>
      <PageHead
        title={classLabel(cls.className, cls.section)}
        desc={`${roster.length} students · Room ${cls.room} · Class teacher ${cls.classTeacher} · ${todayLong()}`}
        actions={
          <>
            <Link to="/teacher/classes" className="btn btn-outline">
              <Icon name="users" size={16} /> All classes
            </Link>
            <Link to="/teacher/attendance" className="btn btn-soft">
              <Icon name="check" size={16} /> Register
            </Link>
            <Link to="/teacher/marks" className="btn btn-primary">
              <Icon name="edit" size={16} /> Marks
            </Link>
          </>
        }
      />

      <div className="grid g-4">
        <Stat
          label="Strength"
          value={roster.length}
          icon="users"
          tone="bg-primary"
          foot={`${classLabel(cls.className, cls.section)} · ${cls.room}`}
        />
        <Stat
          label="Present Today"
          value={`${counts.present}/${counts.total}`}
          icon="check"
          tone="bg-success"
          foot={`${counts.absent} absent · ${counts.late} late`}
          trend={counts.total && counts.present / counts.total >= 0.85 ? "up" : "down"}
        />
        <Stat
          label="Attendance %"
          value={`${pct}%`}
          icon="calendar"
          tone={pct >= 85 ? "bg-success" : pct >= 75 ? "bg-warning" : "bg-danger"}
          foot={`Last ${HISTORY.length} school days`}
          trend={pct >= 85 ? "up" : "down"}
        />
        <Stat
          label={`${exam.name} avg`}
          value={sheet.length ? avg : "—"}
          icon="star"
          tone="bg-violet"
          foot={`${me.subject} · out of ${exam.maxMarks}`}
        />
      </div>

      <div className="grid g-23 mt">
        <Card
          title="Class register"
          sub={`Today's status · ${fmtDate(today)}`}
          pad={false}
          right={
            <Link to="/teacher/attendance" className="btn btn-soft btn-sm">
              Open register
            </Link>
          }
        >
          <div className="table-wrap" style={{ maxHeight: 460, overflowY: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  <th>Today</th>
                  <th className="num">Present</th>
                  <th className="num">Absent</th>
                  <th className="num">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const st = statusOf(s.id, today);
                  const h = historyOf(s.id, statusOf);
                  const streak = streakOf(s.id, statusOf);
                  return (
                    <tr key={s.id}>
                      <td className="strong">{s.roll}</td>
                      <td><Person name={s.name} sub={s.admNo} /></td>
                      <td>
                        <Badge tone={statusTone(st)}>{st}</Badge>
                        {streak >= 3 && <Badge tone="b-danger" plain>{streak}+ days</Badge>}
                      </td>
                      <td className="num">{h.present}</td>
                      <td className="num">{h.absent}</td>
                      <td className="num strong">{h.pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {roster.length === 0 && (
              <Empty icon="🧑‍🎓" title="No students" sub="This section has no enrolled students yet." />
            )}
          </div>
        </Card>

        <div className="stack">
          <Card
            title="3+ consecutive absences"
            sub="Flagged for follow-up with parents"
            pad={false}
            right={<Badge tone={flagged.length ? "b-danger" : "b-success"}>{flagged.length} students</Badge>}
          >
            {flagged.length === 0 ? (
              <Empty icon="✅" title="No long absences" sub="Nobody has missed 3+ school days in a row." />
            ) : (
              <div className="list">
                {flagged.map(({ s, streak }) => {
                  const log = contactOf(s.id);
                  return (
                    <div className="list-item" key={s.id}>
                      <div className="body">
                        <div className="ttl">{s.name}</div>
                        <div className="txt">
                          Roll {s.roll} · Parent {s.parentName} · {s.parentPhone}
                        </div>
                        <div className="when">
                          <Badge tone="b-danger">{streak} days absent</Badge>
                          <Badge tone={log.status === "Contacted" ? "b-success" : "b-gray"} plain>
                            {log.status}
                          </Badge>
                          {log.note && <span className="muted">“{log.note}”</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-soft btn-sm"
                        onClick={() => {
                          setContactId(s.id);
                          setNoteDraft(log.note);
                        }}
                      >
                        <Icon name="phone" size={14} /> Contact
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Attendance trend" sub={`Present % · last 7 school days`}>
            <Bars data={daily} suffix="%" />
            <div className="divider" />
            <div className="kv"><span className="k">Class teacher</span><span className="v">{cls.classTeacher}</span></div>
            <div className="kv"><span className="k">Room</span><span className="v">{cls.room}</span></div>
            <div className="kv"><span className="k">Subjects</span><span className="v">{cls.subjects.join(", ")}</span></div>
            <div className="kv"><span className="k">Late arrivals</span><span className="v">{counts.late} today</span></div>
          </Card>
        </div>
      </div>

      {contact && (
        <Modal
          title={`Contact parent — ${contact.name}`}
          onClose={() => setContactId(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setContactId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-soft"
                onClick={() => {
                  saveNote(contact.id, noteDraft.trim());
                }}
              >
                Save note
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (noteDraft.trim()) saveNote(contact.id, noteDraft.trim());
                  markContacted(contact.id);
                }}
              >
                <Icon name="check" size={15} /> Mark contacted
              </button>
            </>
          }
        >
          <div className="kv"><span className="k">Student</span><span className="v">{contact.name} · Roll {contact.roll}</span></div>
          <div className="kv"><span className="k">Class</span><span className="v">{classLabel(contact.className, contact.section)}</span></div>
          <div className="kv"><span className="k">Parent</span><span className="v">{contact.parentName}</span></div>
          <div className="kv"><span className="k">Phone</span><span className="v">{contact.parentPhone}</span></div>
          <div className="kv">
            <span className="k">Status</span>
            <span className="v">
              <Badge tone={contactOf(contact.id).status === "Contacted" ? "b-success" : "b-gray"} plain>
                {contactOf(contact.id).status}
              </Badge>
            </span>
          </div>
          <label className="label" style={{ marginTop: 14 }}>Note</label>
          <textarea
            className="input"
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            placeholder="Parent contacted regarding absence…"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
        </Modal>
      )}
    </>
  );
}
