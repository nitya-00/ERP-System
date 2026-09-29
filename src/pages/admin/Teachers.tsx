import { useState } from "react";
import { classLabel, teachers } from "../../data/db";
import { Badge, Card, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";
import { useApp } from "../../store/AppContext";
import type { ClassRow } from "../../data/db";

const teacherOf = (name: string) => teachers.find((x) => x.name === name);

export default function TeachersClasses() {
  const { toast, classes, students, assignClassTeacher } = useApp();
  const [tab, setTab] = useState<"teachers" | "classes">("teachers");
  const [open, setOpen] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<ClassRow | null>(null);
  const t = teachers.find((x) => x.id === open);

  /* a class is unstaffed when its teacher is missing or not on duty */
  const unstaffed = (c: ClassRow) => {
    const tch = teacherOf(c.classTeacher);
    return !tch || tch.status !== "Active";
  };
  const needsSub = classes.filter(unstaffed);

  const classTeacherOf = (name: string) =>
    classes.filter((c) => c.classTeacher === name).map((c) => classLabel(c.className, c.section));

  return (
    <>
      <PageHead
        title="Teachers & Classes"
        desc="Faculty directory, subject allocation and class-wise section management."
        actions={
          <>
            <div className="seg">
              <button className={tab === "teachers" ? "on" : ""} onClick={() => setTab("teachers")}>Teachers</button>
              <button className={tab === "classes" ? "on" : ""} onClick={() => setTab("classes")}>Classes & Sections</button>
            </div>
            <button className="btn btn-primary" onClick={() => toast("Teacher onboarding form opened")}>
              <Icon name="userPlus" size={16} /> Add Teacher
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Teaching Staff" value={teachers.length} icon="cap" tone="bg-primary" foot={`${teachers.filter((x) => x.status === "Active").length} currently on duty`} />
        <Stat label="Classes & Sections" value={classes.length} icon="book" tone="bg-violet" foot={`${students.length} students enrolled`} />
        <Stat label="On Leave" value={teachers.filter((x) => x.status === "On Leave").length} icon="clock" tone="bg-warning" foot="Today" />
        <Stat
          label="Needs a Substitute"
          value={needsSub.length}
          icon="bell"
          tone={needsSub.length ? "bg-danger" : "bg-success"}
          foot={needsSub.length ? "Class teacher unavailable" : "All classes staffed"}
        />
      </div>

      {tab === "teachers" ? (
        <div className="grid g-3 mt">
          {teachers.map((x) => (
            <div className="card" key={x.id} style={{ padding: 20 }}>
              <div className="flex">
                <Person name={x.name} sub={x.id} />
                <div style={{ marginLeft: "auto" }}>
                  <Badge tone={statusTone(x.status)}>{x.status}</Badge>
                </div>
              </div>
              <div className="divider" />
              <div className="kv"><span className="k">Subject</span><span className="v">{x.subject}</span></div>
              <div className="kv"><span className="k">Classes handled</span><span className="v">{x.classes.join(", ")}</span></div>
              <div className="kv">
                <span className="k">Class teacher of</span>
                <span className="v">{classTeacherOf(x.name).join(", ") || "—"}</span>
              </div>
              <div className="kv"><span className="k">Experience</span><span className="v">{x.experience} years</span></div>
              <div className="kv"><span className="k">Qualification</span><span className="v">{x.qualification}</span></div>
              <div className="flex" style={{ marginTop: 14 }}>
                <a className="btn btn-outline btn-sm grow" href={`mailto:${x.email}`}>
                  <Icon name="mail" size={14} /> Email
                </a>
                <a className="btn btn-outline btn-sm grow" href={`tel:${x.phone}`}>
                  <Icon name="phone" size={14} /> Call
                </a>
                <button className="btn btn-soft btn-sm grow" onClick={() => setOpen(x.id)}>Profile</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {needsSub.length > 0 && (
            <div className="card mt" style={{ padding: "14px 18px", borderColor: "var(--danger)", background: "rgba(224,36,36,.05)" }}>
              <div className="flex" style={{ gap: 10 }}>
                <Icon name="bell" size={18} />
                <div>
                  <div className="strong">
                    {needsSub.length} class{needsSub.length > 1 ? "es" : ""} currently {needsSub.length > 1 ? "have" : "has"} no available teacher
                  </div>
                  <div className="small muted">
                    {needsSub.map((c) => classLabel(c.className, c.section)).join(", ")} — a replacement / temporary
                    class teacher is required.
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card title="Class & Section Register" sub="Class teacher, availability, strength, room and subject load" pad={false}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Class Teacher</th>
                    <th>Availability</th>
                    <th className="num">Students</th>
                    <th>Room</th>
                    <th className="num">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => {
                    const bad = unstaffed(c);
                    return (
                      <tr key={c.id}>
                        <td className="strong">{c.className}</td>
                        <td><Badge tone="b-primary" plain>{c.section || "—"}</Badge></td>
                        <td>{c.classTeacher}</td>
                        <td>
                          {bad ? (
                            <Badge tone="b-danger">No teacher available</Badge>
                          ) : (
                            <Badge tone="b-success">On duty</Badge>
                          )}
                        </td>
                        <td className="num">
                          {students.filter((s) => s.className === c.className && s.section === c.section).length}
                        </td>
                        <td>{c.room}</td>
                        <td className="num">
                          <button
                            className={`btn btn-sm ${bad ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setAssignFor(c)}
                          >
                            {bad ? "Assign substitute" : "Change teacher"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <div className="grid g-2 mt">
        <Card title="Subject Allocation" sub="Teachers per subject">
          <div className="hbar">
            {["Mathematics", "Science", "English", "Social Science", "Hindi", "Computer Science"].map((s) => {
              const n = teachers.filter((x) => x.subject === s).length;
              return (
                <div className="row" key={s}>
                  <div className="top"><span>{s}</span><b>{n} teacher{n === 1 ? "" : "s"}</b></div>
                  <div className="progress"><i style={{ width: `${Math.max(14, n * 34)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Weekly Period Load" sub="Average periods per teacher">
          <div className="hbar">
            {teachers.slice(0, 6).map((x) => {
              const p = 18 + (x.experience % 8);
              return (
                <div className="row" key={x.id}>
                  <div className="top"><span>{x.name}</span><b>{p} / 30 periods</b></div>
                  <div className="progress"><i style={{ width: `${(p / 30) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {assignFor && (
        <Modal
          title={`Assign class teacher — ${classLabel(assignFor.className, assignFor.section)}`}
          onClose={() => setAssignFor(null)}
          footer={<button className="btn btn-outline" onClick={() => setAssignFor(null)}>Cancel</button>}
        >
          <div className="hint" style={{ marginBottom: 6 }}>
            Picking a teacher updates the class register and sends them a notification:
            <b> “You have been assigned to {classLabel(assignFor.className, assignFor.section)}.”</b>
          </div>
          <div className="small muted" style={{ marginBottom: 4 }}>
            Current class teacher: {assignFor.classTeacher} · Room {assignFor.room}
          </div>
          {teachers
            .filter((x) => x.status === "Active")
            .map((x) => (
              <div className="list-item" key={x.id}>
                <Person name={x.name} sub={`${x.subject} · ${x.qualification}`} />
                <div className="right" style={{ marginLeft: "auto" }}>
                  <button
                    className="btn btn-soft btn-sm"
                    disabled={x.name === assignFor.classTeacher}
                    onClick={() => {
                      assignClassTeacher(assignFor.id, x.name);
                      setAssignFor(null);
                    }}
                  >
                    {x.name === assignFor.classTeacher ? "Current" : "Assign"}
                  </button>
                </div>
              </div>
            ))}
        </Modal>
      )}

      {t && (
        <Modal title={t.name} onClose={() => setOpen(null)}
          footer={<button className="btn btn-primary" onClick={() => setOpen(null)}>Done</button>}>
          <div className="flex" style={{ marginBottom: 14 }}>
            <Person name={t.name} sub={t.qualification} lg />
            <div style={{ marginLeft: "auto" }}><Badge tone={statusTone(t.status)}>{t.status}</Badge></div>
          </div>
          <div className="kv"><span className="k">Employee ID</span><span className="v">{t.id}</span></div>
          <div className="kv"><span className="k">Primary subject</span><span className="v">{t.subject}</span></div>
          <div className="kv"><span className="k">Classes</span><span className="v">{t.classes.join(", ")}</span></div>
          <div className="kv"><span className="k">Class teacher of</span><span className="v">{classTeacherOf(t.name).join(", ") || "—"}</span></div>
          <div className="kv"><span className="k">Experience</span><span className="v">{t.experience} years</span></div>
          <div className="kv"><span className="k">Email</span><span className="v">{t.email}</span></div>
          <div className="kv"><span className="k">Phone</span><span className="v">{t.phone}</span></div>
        </Modal>
      )}
    </>
  );
}
