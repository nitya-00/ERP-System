import { useState } from "react";
import { classSections, teachers } from "../../data/db";
import { Badge, Card, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";
import { useApp } from "../../store/AppContext";

export default function TeachersClasses() {
  const { toast } = useApp();
  const [tab, setTab] = useState<"teachers" | "classes">("teachers");
  const [open, setOpen] = useState<string | null>(null);
  const t = teachers.find((x) => x.id === open);

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
        <Stat label="Classes & Sections" value={classSections.length} icon="book" tone="bg-violet" foot="Across primary & secondary" />
        <Stat label="Subjects Offered" value={8} icon="file" tone="bg-info" foot="Core + co-curricular" />
        <Stat label="On Leave" value={teachers.filter((x) => x.status === "On Leave").length} icon="clock" tone="bg-warning" foot="Today" />
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
        <Card title="Class & Section Register" sub="Class teacher, strength, room and subject load" pad={false}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Class Teacher</th>
                  <th className="num">Students</th>
                  <th>Room</th>
                  <th>Subjects</th>
                </tr>
              </thead>
              <tbody>
                {classSections.map((c) => (
                  <tr key={c.id}>
                    <td className="strong">{c.className}</td>
                    <td><Badge tone="b-primary" plain>{c.section}</Badge></td>
                    <td>{c.classTeacher}</td>
                    <td className="num">{c.students}</td>
                    <td>{c.room}</td>
                    <td>
                      <div className="flex flex-wrap gap-sm">
                        {c.subjects.map((s) => (
                          <span key={s} className="badge b-gray plain">{s}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
          <div className="kv"><span className="k">Experience</span><span className="v">{t.experience} years</span></div>
          <div className="kv"><span className="k">Email</span><span className="v">{t.email}</span></div>
          <div className="kv"><span className="k">Phone</span><span className="v">{t.phone}</span></div>
        </Modal>
      )}
    </>
  );
}
