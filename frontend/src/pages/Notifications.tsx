import { useMemo, useState } from "react";
import { useApp } from "../store/AppContext";
import { relTime } from "../data/db";
import { Badge, Card, Empty, Icon, PageHead, Stat } from "../components/ui";

const kinds = [
  { id: "All", emoji: "📋", label: "All" },
  { id: "alert", emoji: "🚨", label: "Alerts" },
  { id: "reminder", emoji: "⏰", label: "Reminders" },
  { id: "info", emoji: "ℹ️", label: "Info" },
  { id: "success", emoji: "✅", label: "Updates" },
] as const;

const tone: Record<string, string> = {
  alert: "b-danger",
  reminder: "b-warning",
  info: "b-info",
  success: "b-success",
};

const emoji: Record<string, string> = {
  alert: "🚨",
  reminder: "⏰",
  info: "ℹ️",
  success: "✅",
};

export default function Notifications({ title }: { title: string }) {
  const { notifications, toggleNotifRead, markAllNotifsRead, role } = useApp();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("All");

  const rows = useMemo(
    () => notifications.filter((n) => kind === "All" || n.kind === kind),
    [notifications, kind],
  );
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHead
        title={title}
        desc="Important and urgent announcements pushed to your portal."
        actions={
          <button className="btn btn-outline" onClick={markAllNotifsRead} disabled={unread === 0}>
            <Icon name="check" size={16} /> Mark all as read
          </button>
        }
      />

      <div className="grid g-3">
        <Stat label="Unread" value={unread} icon="bell" tone="bg-danger" foot="Needs your attention" />
        <Stat label="Total Notifications" value={notifications.length} icon="mega" tone="bg-primary" foot={`For ${role}`} />
        <Stat label="Urgent Alerts" value={notifications.filter((n) => n.kind === "alert").length} icon="shield" tone="bg-warning" foot="School closure & safety" />
      </div>

      <div className="mt flex flex-wrap" style={{ gap: 8 }}>
        {kinds.map((k) => (
          <button key={k.id} className={`chip-pill ${kind === k.id ? "on" : ""}`} onClick={() => setKind(k.id)}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>

      <div className="mt"><Card title="Notification Centre" sub={`${rows.length} items`} pad={false}>
        <div style={{ padding: "6px 20px" }}>
          {rows.map((n) => (
            <div className="list-item" key={n.id}>
              {!n.read && <span className="unread-dot" />}
              {n.read && <span style={{ width: 9, flex: "0 0 9px" }} />}
              <div style={{ fontSize: 19 }}>{emoji[n.kind] ?? "ℹ️"}</div>
              <div className="body">
                <div className="ttl">{n.title}</div>
                <div className="txt">{n.body}</div>
                <div className="when">
                  <Badge tone={tone[n.kind]}>{n.kind}</Badge>
                  <span>{relTime(n.date)}</span>
                  {!n.read && <span style={{ color: "var(--primary)", fontWeight: 700 }}>• New</span>}
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => toggleNotifRead(n.id)}
                title={n.read ? "Mark unread" : "Mark read"}
              >
                {n.read ? "Mark unread" : "Mark read"}
              </button>
            </div>
          ))}
          {rows.length === 0 && <Empty icon="🔕" title="All caught up" sub="No notifications in this category." />}
        </div>
      </Card></div>
    </>
  );
}
