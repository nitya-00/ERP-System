import { useMemo, useState } from "react";
import { useApp } from "../store/AppContext";
import {
  CLASSES,
  SECTIONS,
  fmtDateTime,
  relTime,
  type Audience,
  type Role,
} from "../data/db";
import { Badge, Card, Empty, Icon, Modal, PageHead, Stat, statusTone } from "../components/ui";

const audiences: { id: Audience; emoji: string; hint: string; roles: Role[] }[] = [
  { id: "Entire School", emoji: "🏫", hint: "Everyone in the ERP", roles: ["admin", "teacher", "parent", "student"] },
  { id: "Class", emoji: "📚", hint: "A specific class", roles: ["admin", "teacher", "parent", "student"] },
  { id: "Section", emoji: "🅰️", hint: "A single section", roles: ["admin", "teacher", "parent", "student"] },
  { id: "Parents", emoji: "👨‍👩‍👧", hint: "Guardians only", roles: ["admin", "parent"] },
  { id: "Teachers", emoji: "👩‍🏫", hint: "Faculty only", roles: ["admin", "teacher"] },
];

export default function Notices({ title }: { title: string }) {
  const { role, notices, publishNotice } = useApp();
  const isAdmin = role === "admin";
  const [compose, setCompose] = useState(false);
  const [filter, setFilter] = useState<"All" | "Urgent" | "Important" | "Normal">("All");

  const rows = useMemo(
    () => notices.filter((n) => filter === "All" || n.priority === filter),
    [notices, filter],
  );

  const urgent = notices.filter((n) => n.priority === "Urgent").length;
  const pushCount = notices.filter((n) => n.push).length;

  return (
    <>
      <PageHead
        title={title}
        desc={
          isAdmin
            ? "Publish school-wide or targeted announcements and push them to the relevant portals."
            : "Announcements from the school — urgent items are pushed to your device."
        }
        actions={
          isAdmin ? (
            <button className="btn btn-primary" onClick={() => setCompose(true)}>
              <Icon name="mega" size={16} /> Create notice
            </button>
          ) : undefined
        }
      />

      <div className="grid g-3">
        <Stat label="Total Notices" value={notices.length} icon="mega" tone="bg-primary" foot="This session" />
        <Stat label="Urgent" value={urgent} icon="bell" tone="bg-danger" foot="Require immediate attention" />
        <Stat label="Push Notifications Sent" value={pushCount} icon="trend" tone="bg-success" foot="Delivered to devices" trend="up" />
      </div>

      <div className="mt flex flex-wrap" style={{ gap: 10 }}>
        {(["All", "Urgent", "Important", "Normal"] as const).map((f) => (
          <button key={f} className={`chip-pill ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid g-2 mt">
        {rows.map((n) => (
          <article key={n.id} className={`notice-card ${n.priority.toLowerCase()}`}>
            <div className="flex" style={{ alignItems: "flex-start" }}>
              <div className="grow">
                <div className="ttl">{n.title}</div>
              </div>
              <Badge tone={statusTone(n.priority)}>{n.priority}</Badge>
            </div>
            <p className="msg">{n.body}</p>
            <div className="foot">
              <span>📢 {n.audience}</span>
              <span>·</span>
              <span>{n.target}</span>
              <span>·</span>
              <span>{n.author}</span>
              <span style={{ marginLeft: "auto" }}>{relTime(n.date)}</span>
            </div>
            <div className="foot" style={{ marginTop: 8 }}>
              {n.push && <Badge tone="b-success">📲 Push sent</Badge>}
              <Badge tone="b-gray" plain>{fmtDateTime(n.date)}</Badge>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <Card><Empty icon="📢" title="No notices here" sub="Nothing matches the selected filter." /></Card>
          </div>
        )}
      </div>

      {compose && <ComposeModal onClose={() => setCompose(false)} onPublish={publishNotice} />}
    </>
  );
}

function ComposeModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: ReturnType<typeof useApp>["publishNotice"];
}) {
  const [title, setTitle] = useState("School Closed Tomorrow Due to Heavy Rainfall");
  const [body, setBody] = useState(
    "In view of the heavy rainfall warning issued by the IMD, the school will remain closed tomorrow for all classes. All pending exams stand postponed. Stay safe.",
  );
  const [audience, setAudience] = useState<Audience>("Entire School");
  const [cls, setCls] = useState("Class 10");
  const [sec, setSec] = useState("A");
  const [priority, setPriority] = useState<"Urgent" | "Important" | "Normal">("Urgent");
  const [push, setPush] = useState(true);

  const meta = audiences.find((a) => a.id === audience)!;
  const target =
    audience === "Class"
      ? cls
      : audience === "Section"
        ? `${cls} – ${sec}`
        : audience === "Entire School"
          ? "All classes & sections"
          : meta.hint;

  const publish = () => {
    if (!title.trim() || !body.trim()) return;
    onPublish({
      title: title.trim(),
      body: body.trim(),
      audience,
      target,
      priority,
      push,
      forRoles: meta.roles,
    });
    onClose();
  };

  return (
    <Modal
      title="Create Notice"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={publish} disabled={!title.trim() || !body.trim()}>
            <Icon name="mega" size={16} />
            {push ? "Publish & push notification" : "Publish notice"}
          </button>
        </>
      }
    >
      <div className="field">
        <label className="label">Audience — who should see this?</label>
        <div className="grid g-3" style={{ gap: 9 }}>
          {audiences.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`role-card ${audience === a.id ? "on" : ""}`}
              onClick={() => setAudience(a.id)}
              style={{ padding: "11px 8px" }}
            >
              <div className="em">{a.emoji}</div>
              <div className="nm">{a.id}</div>
              <div className="small muted" style={{ fontSize: 11 }}>{a.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {(audience === "Class" || audience === "Section") && (
        <div className="form-row">
          <div className="field">
            <label className="label">Class</label>
            <select className="select" value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {audience === "Section" && (
            <div className="field">
              <label className="label">Section</label>
              <select className="select" value={sec} onChange={(e) => setSec(e.target.value)}>
                {SECTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="field">
        <label className="label">Priority</label>
        <div className="seg">
          {(["Urgent", "Important", "Normal"] as const).map((p) => (
            <button key={p} className={priority === p ? "on" : ""} onClick={() => setPriority(p)}>
              {p === "Urgent" ? "🚨 " : p === "Important" ? "⚠️ " : "ℹ️ "}
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Notice title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School Closed Tomorrow…" />
      </div>

      <div className="field">
        <label className="label">Message</label>
        <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="flex" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <label className="check">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
          Also send a push notification to the selected audience
        </label>
        <span className="small muted">Target: <b>{target}</b></span>
      </div>

      <div className="demo-box" style={{ marginTop: 16 }}>
        <div className="t">Preview</div>
        <div className={`notice-card ${priority.toLowerCase()}`} style={{ marginTop: 10, boxShadow: "none" }}>
          <div className="flex"><div className="ttl grow">{title || "Notice title"}</div><Badge tone={statusTone(priority)}>{priority}</Badge></div>
          <p className="msg">{body || "Your message will appear here."}</p>
          <div className="foot">
            <span>📢 {audience}</span><span>·</span><span>{target}</span>
            {push && <><span>·</span><Badge tone="b-success">📲 Push</Badge></>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
