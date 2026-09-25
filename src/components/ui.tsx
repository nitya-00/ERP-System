import { type ReactNode } from "react";
import { initials } from "../data/db";

/* ---------------- Icons (inline SVG set) ---------------- */
const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  users: "M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19M9 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-1.5a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  userPlus: "M15 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19M8.5 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 8v6M22 11h-6",
  cap: "M12 4 2 9l10 5 10-5-10-5ZM6 11.5V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5",
  wallet: "M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v1M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M21 8v6h-4a3 3 0 0 1 0-6h4Z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h4",
  mega: "M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM16 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12",
  bell: "M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a2 2 0 0 1-3.4 0",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z",
  check: "M9 11.5 11.5 14 20 5.5M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  calendar: "M7 3v3M17 3v3M4 8.5h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  edit: "M4 20h4L19 9a2.83 2.83 0 1 0-4-4L4 16v4ZM14.5 6.5l4 4",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  arrow: "M5 12h14M13 6l6 6-6 6",
  down: "M6 9l6 6 6-6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M4 6h16M4 12h16M4 18h16",
  star: "m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9L12 3Z",
  shield: "M12 3l8 3v6c0 4.5-3.2 8.4-8 9.5C7.2 20.4 4 16.5 4 12V6l8-3Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  print: "M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2M8 14h8v7H8v-7Z",
  download: "M12 3v12M7 11l5 5 5-5M4 21h16",
  eye: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
  mail: "M3 7.5 12 13l9-5.5M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  phone: "M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  money: "M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 9v.01M18 15v.01",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  close: "M18 6 6 18M6 6l12 12",
};

export function Icon({ name, size = 18 }: { name: keyof typeof paths | string; size?: number }) {
  const d = paths[name] ?? paths.home;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/* ---------------- Building blocks ---------------- */

export function PageHead({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {desc && <p className="desc">{desc}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  tone = "bg-primary",
  foot,
  trend,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: string;
  foot?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="stat">
      <div className="top">
        <div className={`chip ${tone}`}>
          <Icon name={icon} size={18} />
        </div>
        <span className="label">{label}</span>
      </div>
      <div className="value">{value}</div>
      {(foot || trend) && (
        <div className="foot">
          {trend && (
            <span className={trend === "up" ? "trend-up" : "trend-down"}>
              {trend === "up" ? "▲" : "▼"}
            </span>
          )}
          <span>{foot}</span>
        </div>
      )}
    </div>
  );
}

export function Card({
  title,
  sub,
  right,
  children,
  pad = true,
}: {
  title?: string;
  sub?: string;
  right?: ReactNode;
  children: ReactNode;
  pad?: boolean;
}) {
  return (
    <section className="card">
      {(title || right) && (
        <header className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          {right && <div className="right">{right}</div>}
        </header>
      )}
      <div className={pad ? "card-body" : undefined}>{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "b-gray",
  plain,
}: {
  children: ReactNode;
  tone?: string;
  plain?: boolean;
}) {
  return <span className={`badge ${tone} ${plain ? "plain" : ""}`}>{children}</span>;
}

export const statusTone = (s: string) =>
  ({
    Active: "b-success",
    Paid: "b-success",
    Approved: "b-success",
    Present: "b-success",
    Completed: "b-success",
    New: "b-info",
    Upcoming: "b-info",
    "Under Review": "b-warning",
    Pending: "b-warning",
    "In Progress": "b-warning",
    Late: "b-warning",
    "On Leave": "b-warning",
    Overdue: "b-danger",
    Rejected: "b-danger",
    Absent: "b-danger",
    Inactive: "b-gray",
    Urgent: "b-danger",
    Important: "b-warning",
    Normal: "b-primary",
  })[s] ?? "b-gray";

export function Avatar({ name, lg, sm }: { name: string; lg?: boolean; sm?: boolean }) {
  const n = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const cls = ((name.charCodeAt(0) + name.length) % 6) + 1;
  return (
    <span className={`avatar av-${cls} ${lg ? "lg" : ""} ${sm ? "sm" : ""}`}>{n}</span>
  );
}

export function Person({
  name,
  sub,
  lg,
}: {
  name: string;
  sub?: string;
  lg?: boolean;
}) {
  return (
    <div className="person">
      <Avatar name={name} lg={lg} />
      <div className="meta">
        <div className="nm">{name}</div>
        {sub && <div className="sb">{sub}</div>}
      </div>
    </div>
  );
}

export function Empty({
  icon = "📄",
  title,
  sub,
}: {
  icon?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="empty">
      <div className="ico">{icon}</div>
      <div className="t">{title}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Bars({
  data,
  tone,
  suffix = "",
}: {
  data: { m: string; v: number }[];
  tone?: "alt" | "warn";
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="bars">
      {data.map((d) => (
        <div className={`bar ${tone ?? ""}`} key={d.m} title={`${d.v}${suffix}`}>
          <i style={{ height: `${(d.v / max) * 100}%` }} />
          <span>{d.m}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  parts,
  size = 132,
}: {
  parts: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const stops = parts
    .map((p) => {
      const start = (acc / total) * 360;
      acc += p.value;
      const end = (acc / total) * 360;
      return `${p.color} ${start}deg ${end}deg`;
    })
    .join(", ");
  return (
    <div className="donut">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${stops})`,
          position: "relative",
          flex: `0 0 ${size}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: size * 0.22,
            background: "#fff",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: "-0.03em" }}>
              {total > 999 ? (total / 1000).toFixed(1) + "k" : total}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 650 }}>TOTAL</div>
          </div>
        </div>
      </div>
      <div className="legend">
        {parts.map((p) => (
          <div className="legend-row" key={p.label}>
            <span className="sw" style={{ background: p.color }} />
            <span>{p.label}</span>
            <span className="val">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressRow({ label, value, max, suffix = "%" }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, (value / (max ?? 100)) * 100));
  return (
    <div className="row">
      <div className="top">
        <span>{label}</span>
        <b>
          {value}
          {suffix}
        </b>
      </div>
      <div className="progress">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export { initials };
