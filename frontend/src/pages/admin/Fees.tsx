import { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { feeStructure, fmtDate, inr, payments as seedPayments, schoolStats, todayISO, type Payment } from "../../data/db";
import { Badge, Card, Empty, Icon, Modal, Money, PageHead, Person, PrivacyProvider, PrivacyToggle, Stat, statusTone } from "../../components/ui";

const tabs = ["Overview", "Fee Structure", "Payments", "Pending"] as const;

export default function Fees() {
  const { payments, students: liveStudents, addPayment } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [q, setQ] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const collected = payments.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending").reduce((a, b) => a + b.amount, 0);
  const overdue = payments.filter((p) => p.status === "Overdue").reduce((a, b) => a + b.amount, 0);
  const rate = Math.round((collected / (collected + pending + overdue || 1)) * 100);

  const rows = useMemo(
    () =>
      payments.filter((p) => {
        const st = liveStudents.find((s) => s.id === p.studentId);
        const hit =
          q === "" ||
          (st?.name.toLowerCase().includes(q.toLowerCase()) ?? false) ||
          p.receiptNo.toLowerCase().includes(q.toLowerCase());
        if (tab === "Pending") return p.status !== "Paid" && hit;
        if (tab === "Payments") return hit;
        return true;
      }),
    [payments, liveStudents, q, tab],
  );

  const rcpt = payments.find((p) => p.id === receipt);

  return (
    <PrivacyProvider>
      <PageHead
        title="Fees"
        desc="Fee structure, collections, pending dues and downloadable receipts."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Download report
            </button>
            <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
              <Icon name="money" size={16} /> Record payment
            </button>
          </>
        }
      />

      <div className="grid g-4">
        <Stat label="Total Collected" value={inr(collected)} icon="wallet" tone="bg-success" foot={`${rate}% of billed amount`} trend="up" secret />
        <Stat label="Pending" value={inr(pending)} icon="clock" tone="bg-warning" foot={`${payments.filter((p) => p.status === "Pending").length} receipts due`} secret />
        <Stat label="Overdue" value={inr(overdue)} icon="bell" tone="bg-danger" foot={`${payments.filter((p) => p.status === "Overdue").length} students` } trend="down" secret />
        <Stat label="Receipts Issued" value={payments.length} icon="file" tone="bg-primary" foot="This session" />
      </div>

      <div className="card mt" style={{ padding: "14px 20px" }}>
        <div className="seg">
          {tabs.map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "Fee Structure" ? (
        <Card title="Fee Structure 2026 – 2027" sub="Annual charges per student, in ₹" pad={false}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class Group</th>
                  <th className="num">Tuition</th>
                  <th className="num">Transport</th>
                  <th className="num">Lab / Activity</th>
                  <th className="num">Examination</th>
                  <th className="num">Total / Year</th>
                  <th className="num">Term-1 (50%)</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((f) => (
                  <tr key={f.className}>
                    <td className="strong">{f.className}</td>
                    <td className="num">{inr(f.tuition)}</td>
                    <td className="num">{inr(f.transport)}</td>
                    <td className="num">{inr(f.lab)}</td>
                    <td className="num">{inr(f.exam)}</td>
                    <td className="num strong">{inr(f.total)}</td>
                    <td className="num">{inr(Math.round(f.total / 2))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card
          title={tab === "Pending" ? "Pending & Overdue Dues" : "Payment Ledger"}
          sub={`${rows.length} records`}
          pad={false}
          right={
            <div className="search" style={{ width: 220 }}>
              <Icon name="search" size={15} />
              <input placeholder="Search receipt / student…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Student</th>
                  <th>Fee head</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                  <th className="num">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const st = liveStudents.find((s) => s.id === p.studentId);
                  return (
                    <tr key={p.id}>
                      <td className="strong">{p.receiptNo}</td>
                      <td>{st ? <Person name={st.name} sub={`${st.className} – ${st.section}`} /> : p.studentId}</td>
                      <td>{p.head}</td>
                      <td className="nowrap">{fmtDate(p.date)}</td>
                      <td><Badge tone="b-gray" plain>{p.mode}</Badge></td>
                      <td className="num strong">{inr(p.amount)}</td>
                      <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                      <td className="num">
                        <button className="btn btn-outline btn-sm" onClick={() => setReceipt(p.id)}>
                          <Icon name="eye" size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <Empty icon="🧾" title="No payment records" sub="Nothing matches this view yet." />}
          </div>
        </Card>
      )}

      <div className="grid g-3 mt">
        <Card title="Collection by mode" right={<PrivacyToggle label={false} />}>
          <div className="hbar">
            {["UPI", "Card", "Cash", "Bank Transfer"].map((m) => {
              const v = seedPayments.filter((p) => p.mode === m && p.status === "Paid").reduce((a, b) => a + b.amount, 0);
              return (
                <div className="row" key={m}>
                  <div className="top"><span>{m}</span><b><Money n={v} /></b></div>
                  <div className="progress"><i style={{ width: `${Math.min(100, (v / 120000) * 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Class-wise dues" right={<PrivacyToggle label={false} />}>
          <div className="hbar">
            {["Eighth", "Seventh", "Sixth", "Fifth", "Fourth"].map((c, i) => {
              const amt = [48000, 36000, 27500, 18000, 12500][i];
              return (
                <div className="row" key={c}>
                  <div className="top"><span>{c}</span><b><Money n={amt} /></b></div>
                  <div className="progress"><i style={{ width: `${(amt / 50000) * 100}%`, background: "var(--warning)" }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Quick actions">
          <div className="flex flex-wrap">
            <button className="btn btn-outline btn-block" onClick={() => setPayOpen(true)}>
              <Icon name="plus" size={15} /> Record a payment
            </button>
            <button className="btn btn-outline btn-block" onClick={() => window.print()}>
              <Icon name="download" size={15} /> Export ledger (CSV)
            </button>
            <button className="btn btn-outline btn-block" onClick={() => setTab("Pending")}>
              <Icon name="bell" size={15} /> Send dues reminders
            </button>
            <button className="btn btn-soft btn-block" onClick={() => setTab("Fee Structure")}>
              <Icon name="edit" size={15} /> Edit fee structure
            </button>
          </div>
          <div className="hint" style={{ marginTop: 12 }}>
            Reminders are pushed to the parent portal and to registered mobile numbers.
          </div>
        </Card>
      </div>

      {rcpt && <ReceiptModal p={rcpt} onClose={() => setReceipt(null)} />}
      {payOpen && <RecordPayment onClose={() => setPayOpen(false)} onDone={addPayment} />}
    </PrivacyProvider>
  );
}

function ReceiptModal({ p, onClose }: { p: Payment; onClose: () => void }) {
  const { students: live } = useApp();
  const st = live.find((s) => s.id === p.studentId);
  return (
    <Modal
      title={`Receipt ${p.receiptNo}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Icon name="print" size={15} /> Print / Save PDF
          </button>
        </>
      }
    >
      <div className="flex" style={{ justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div className="strong" style={{ fontSize: 17 }}>{schoolStats.name}</div>
          <div className="small muted">Sector 21, Rohini, New Delhi — 110086</div>
        </div>
        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
      </div>
      <div className="divider" />
      <div className="kv"><span className="k">Receipt no</span><span className="v">{p.receiptNo}</span></div>
      <div className="kv"><span className="k">Date</span><span className="v">{fmtDate(p.date)}</span></div>
      <div className="kv"><span className="k">Student</span><span className="v">{st?.name ?? p.studentId}</span></div>
      <div className="kv"><span className="k">Class</span><span className="v">{st ? `${st.className} – ${st.section}` : "—"}</span></div>
      <div className="kv"><span className="k">Admission no</span><span className="v">{st?.admNo ?? "—"}</span></div>
      <div className="kv"><span className="k">Fee head</span><span className="v">{p.head}</span></div>
      <div className="kv"><span className="k">Mode</span><span className="v">{p.mode}</span></div>
      <div className="kv"><span className="k">Amount paid</span><span className="v" style={{ fontSize: 18 }}>{inr(p.amount)}</span></div>
      <div className="hint" style={{ marginTop: 14 }}>
        This is a computer-generated receipt and does not require a signature.
      </div>
    </Modal>
  );
}

function RecordPayment({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (p: { studentId: string; amount: number; date: string; mode: "Cash" | "UPI" | "Card" | "Bank Transfer"; head: string; status: "Paid" | "Pending" | "Overdue" }) => void;
}) {
  const { students: live } = useApp();
  const [studentId, setStudentId] = useState(live[0]?.id ?? "");
  const [amount, setAmount] = useState("20000");
  const [mode, setMode] = useState<"Cash" | "UPI" | "Card" | "Bank Transfer">("UPI");
  const [head, setHead] = useState("Tuition Fee — Term 2");

  return (
    <Modal
      title="Record Payment"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onDone({
                studentId,
                amount: Number(amount) || 0,
                date: todayISO(),
                mode,
                head,
                status: "Paid",
              });
              onClose();
            }}
          >
            <Icon name="check" size={16} /> Save & generate receipt
          </button>
        </>
      }
    >
      <div className="field">
        <label className="label">Student</label>
        <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {live.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.className} ({s.admNo})
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label">Amount (₹)</label>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Payment mode</label>
          <select className="select" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option>UPI</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Bank Transfer</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Fee head</label>
        <select className="select" value={head} onChange={(e) => setHead(e.target.value)}>
          <option>Tuition Fee — Term 2</option>
          <option>Tuition Fee — Term 1</option>
          <option>Transport Fee</option>
          <option>Annual Charges</option>
          <option>Examination Fee</option>
        </select>
      </div>
      <div className="hint">Payment date is set to today. A receipt number is generated automatically.</div>
    </Modal>
  );
}
