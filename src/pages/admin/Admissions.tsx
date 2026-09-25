import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { CLASSES, SECTIONS, fmtDate, initials } from "../../data/db";
import { Avatar, Badge, Card, Empty, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";

const filters = ["All", "New", "Under Review", "Approved", "Rejected"] as const;

export default function Admissions() {
  const { apps, decideApplication, addStudent, toast } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const rows = useMemo(
    () =>
      apps.filter(
        (a) =>
          (filter === "All" || a.status === filter) &&
          (q === "" ||
            a.name.toLowerCase().includes(q.toLowerCase()) ||
            a.parentName.toLowerCase().includes(q.toLowerCase()) ||
            a.id.toLowerCase().includes(q.toLowerCase())),
      ),
    [apps, filter, q],
  );

  const detail = apps.find((a) => a.id === open);

  const counts = {
    New: apps.filter((a) => a.status === "New").length,
    Review: apps.filter((a) => a.status === "Under Review").length,
    Approved: apps.filter((a) => a.status === "Approved").length,
    Rejected: apps.filter((a) => a.status === "Rejected").length,
  };

  return (
    <>
      <PageHead
        title="Admissions"
        desc="Track new applications, review them and convert approved ones into student records."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => toast("Application form link copied")}>
              <Icon name="mail" size={16} /> Share form link
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Icon name="plus" size={16} /> New Admission
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="New Applications" value={counts.New} icon="userPlus" tone="bg-info" foot="Received this week" trend="up" />
        <Stat label="Under Review" value={counts.Review} icon="eye" tone="bg-warning" foot="Awaiting verification" />
        <Stat label="Approved" value={counts.Approved} icon="check" tone="bg-success" foot="Ready to enrol" />
        <Stat label="Rejected" value={counts.Rejected} icon="file" tone="bg-danger" foot="Closed applications" />
      </div>

      <Card
        title="Application Tracker"
        sub={`${rows.length} of ${apps.length} applications`}
        pad={false}
        right={
          <div className="search" style={{ width: 210 }}>
            <Icon name="search" size={15} />
            <input placeholder="Search applicant…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        }
      >
        <div style={{ padding: "14px 20px 0" }}>
          <div className="chipbar">
            {filters.map((f) => (
              <button key={f} className={`chip-pill ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Applying For</th>
                <th>Parent / Guardian</th>
                <th>Previous School</th>
                <th>Applied</th>
                <th>Status</th>
                <th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Person name={a.name} sub={a.id} />
                  </td>
                  <td className="strong">{a.applyingFor}</td>
                  <td>
                    {a.parentName}
                    <div className="small muted">{a.parentPhone}</div>
                  </td>
                  <td>{a.prevSchool}</td>
                  <td className="nowrap">{fmtDate(a.date)}</td>
                  <td>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="num">
                    <button className="btn btn-outline btn-sm" onClick={() => setOpen(a.id)}>
                      <Icon name="eye" size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty icon="🗂️" title="No applications found" sub="Try a different filter or search term." />}
        </div>
      </Card>

      {detail && (
        <Modal
          title={`Application ${detail.id}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setOpen(null)}>Close</button>
              {detail.status !== "Rejected" && (
                <button
                  className="btn btn-danger"
                  onClick={() => { decideApplication(detail.id, "Rejected"); setOpen(null); }}
                >
                  Reject
                </button>
              )}
              {detail.status !== "Approved" ? (
                <button
                  className="btn btn-primary"
                  onClick={() => { decideApplication(detail.id, "Approved"); setOpen(null); }}
                >
                  Approve admission
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    addStudent({
                      name: detail.name,
                      className: detail.applyingFor.split(" - ")[0],
                      section: (detail.applyingFor.split(" - ")[1] ?? "A").trim(),
                      roll: 1,
                      gender: "Female",
                      dob: "2018-05-14",
                      bloodGroup: "O+",
                      phone: detail.parentPhone,
                      address: "—",
                      parentName: detail.parentName,
                      parentPhone: detail.parentPhone,
                      parentEmail: "parent@example.com",
                      admissionDate: "2026-09-25",
                      status: "Active",
                    });
                    decideApplication(detail.id, "Approved");
                    setOpen(null);
                  }}
                >
                  Convert to student
                </button>
              )}
            </>
          }
        >
          <div className="flex" style={{ marginBottom: 16 }}>
            <Avatar name={detail.name} lg />
            <div>
              <div className="strong" style={{ fontSize: 17 }}>{detail.name}</div>
              <div className="muted small">Applying for {detail.applyingFor}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge tone={statusTone(detail.status)}>{detail.status}</Badge>
            </div>
          </div>
          <div className="kv"><span className="k">Application ID</span><span className="v">{detail.id}</span></div>
          <div className="kv"><span className="k">Parent / Guardian</span><span className="v">{detail.parentName}</span></div>
          <div className="kv"><span className="k">Contact number</span><span className="v">{detail.parentPhone}</span></div>
          <div className="kv"><span className="k">Previous school</span><span className="v">{detail.prevSchool}</span></div>
          <div className="kv"><span className="k">Date of application</span><span className="v">{fmtDate(detail.date)}</span></div>
          <div className="kv"><span className="k">Documents submitted</span><span className="v">Birth certificate, Transfer certificate, Aadhaar</span></div>
        </Modal>
      )}

      {showForm && <NewAdmissionModal onClose={() => setShowForm(false)} />}
    </>
  );
}

function NewAdmissionModal({ onClose }: { onClose: () => void }) {
  const { addStudent } = useApp();
  const [f, setF] = useState({
    name: "",
    className: "Class 1",
    section: "A",
    gender: "Male" as "Male" | "Female",
    dob: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    bloodGroup: "O+",
    phone: "",
    admissionDate: "2026-09-25",
    status: "Active" as "Active" | "Pending" | "Inactive",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = () => {
    if (!f.name.trim() || !f.parentName.trim()) return;
    addStudent({ ...f, roll: 1 });
    onClose();
  };

  return (
    <Modal
      title="New Admission"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!f.name.trim() || !f.parentName.trim()}>
            <Icon name="check" size={16} /> Create student record
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="field">
          <label className="label">Student full name *</label>
          <input className="input" value={f.name} onChange={set("name")} placeholder="e.g. Aarav Sharma" />
        </div>
        <div className="field">
          <label className="label">Date of birth</label>
          <input className="input" type="date" value={f.dob} onChange={set("dob")} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label">Class</label>
          <select className="select" value={f.className} onChange={set("className")}>
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Section</label>
          <select className="select" value={f.section} onChange={set("section")}>
            {SECTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label">Gender</label>
          <select className="select" value={f.gender} onChange={set("gender")}>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Blood group</label>
          <input className="input" value={f.bloodGroup} onChange={set("bloodGroup")} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label">Parent / Guardian *</label>
          <input className="input" value={f.parentName} onChange={set("parentName")} placeholder="Mr. / Mrs. …" />
        </div>
        <div className="field">
          <label className="label">Parent phone</label>
          <input className="input" value={f.parentPhone} onChange={set("parentPhone")} placeholder="+91 …" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label">Parent email</label>
          <input className="input" value={f.parentEmail} onChange={set("parentEmail")} placeholder="parent@email.com" />
        </div>
        <div className="field">
          <label className="label">Student contact</label>
          <input className="input" value={f.phone} onChange={set("phone")} placeholder="+91 …" />
        </div>
      </div>
      <div className="field">
        <label className="label">Residential address</label>
        <input className="input" value={f.address} onChange={set("address")} placeholder="House no., street, city" />
      </div>
      <div className="hint">
        Fields marked * are required. An admission number is generated automatically.
      </div>
      <div className="small muted" style={{ marginTop: 6 }}>
        Preview ID: {initials(f.name || "New Student")} · auto ADM number
      </div>
    </Modal>
  );
}
