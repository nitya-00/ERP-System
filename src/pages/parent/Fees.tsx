import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { feeStructure, fmtDate, inr, type Payment } from "../../data/db";
import { Badge, Card, Empty, Icon, Modal, PageHead, Person, Stat, statusTone } from "../../components/ui";
import { useFamily } from "../../store/family";

export default function ParentFees() {
  const { payments, addPayment } = useApp();
  const kids = useFamily();
  const [kid, setKid] = useState(kids[0]?.id ?? "");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const child = kids.find((k) => k.id === kid) ?? kids[0];
  const mine = payments.filter((p) => p.studentId === child?.id);
  const paid = mine.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const due = mine.filter((p) => p.status !== "Paid").reduce((a, b) => a + b.amount, 0);
  const grp =
    child && (child.className.includes("10") || child.className.includes("9"))
      ? "Class 9 – 10"
      : "Class 1 – 5";
  const billed = feeStructure.find((f) => f.className === grp)?.total ?? 40000;
  const progress = Math.round((paid / (paid + due || 1)) * 100);

  return (
    <>
      <PageHead
        title="Fees"
        desc="Amount due, payment history and downloadable receipts."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Download statement
            </button>
            <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
              <Icon name="money" size={16} /> Pay now
            </button>
          </>
        }
      />

      {kids.length > 1 && (
        <div className="chipbar mb" style={{ marginBottom: 18 }}>
          {kids.map((k) => (
            <button key={k.id} className={`chip-pill ${kid === k.id ? "on" : ""}`} onClick={() => setKid(k.id)}>
              {k.name} · {k.className}
            </button>
          ))}
        </div>
      )}

      <div className="grid g-4">
        <Stat label="Total Due" value={inr(due)} icon="bell" tone={due ? "bg-danger" : "bg-success"} foot={due ? "Due by 30 Sep 2026" : "No pending dues"} trend={due ? "down" : "up"} />
        <Stat label="Paid This Session" value={inr(paid)} icon="wallet" tone="bg-success" foot={`${progress}% of billed amount`} />
        <Stat label="Annual Charges" value={inr(billed)} icon="file" tone="bg-info" foot={child?.className ?? ""} />
        <Stat label="Receipts" value={mine.filter((p) => p.status === "Paid").length} icon="print" tone="bg-primary" foot="Available to download" />
      </div>

      <div className="grid g-23 mt">
        <Card title="Payment History" sub={child ? `${child.name} · ${child.className} – ${child.section}` : ""} pad={false}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Receipt</th><th>Fee head</th><th>Date</th><th>Mode</th><th className="num">Amount</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {mine.map((p) => (
                  <tr key={p.id}>
                    <td className="strong">{p.receiptNo}</td>
                    <td>{p.head}</td>
                    <td className="nowrap">{fmtDate(p.date)}</td>
                    <td><Badge tone="b-gray" plain>{p.mode}</Badge></td>
                    <td className="num strong">{inr(p.amount)}</td>
                    <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                    <td className="num">
                      <button className="btn btn-outline btn-sm" onClick={() => setReceipt(p)}>Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mine.length === 0 && <Empty icon="🧾" title="No fee records yet" sub="Charges will appear here once generated." />}
          </div>
        </Card>

        <div className="grid" style={{ alignContent: "start" }}>
          <Card title="Fee breakdown" sub="Annual structure">
            <div className="kv"><span className="k">Tuition fee</span><span className="v">{inr(26000)}</span></div>
            <div className="kv"><span className="k">Transport</span><span className="v">{inr(10000)}</span></div>
            <div className="kv"><span className="k">Lab / Activity</span><span className="v">{inr(2000)}</span></div>
            <div className="kv"><span className="k">Examination</span><span className="v">{inr(2000)}</span></div>
            <div className="kv"><span className="k">Total</span><span className="v">{inr(40000)}</span></div>
            <div className="divider" />
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            <div className="hint">{progress}% paid · {inr(due)} remaining</div>
          </Card>

          <Card title="Pay securely">
            <div className="flex flex-wrap">
              <button className="btn btn-primary btn-block" onClick={() => setPayOpen(true)}>
                <Icon name="money" size={16} /> Pay {inr(due || 20000)}
              </button>
              <div className="hint">UPI · Cards · Net banking · Wallets</div>
            </div>
          </Card>
        </div>
      </div>

      {receipt && (
        <Modal
          title={`Receipt ${receipt.receiptNo}`}
          onClose={() => setReceipt(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setReceipt(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Icon name="print" size={15} /> Print / Save PDF
              </button>
            </>
          }
        >
          <div className="strong" style={{ fontSize: 17 }}>Sunrise Public School</div>
          <div className="small muted">Sector 21, Rohini, New Delhi — 110086</div>
          <div className="divider" />
          <div className="kv"><span className="k">Receipt no</span><span className="v">{receipt.receiptNo}</span></div>
          <div className="kv"><span className="k">Date</span><span className="v">{fmtDate(receipt.date)}</span></div>
          <div className="kv"><span className="k">Student</span><span className="v">{child?.name}</span></div>
          <div className="kv"><span className="k">Fee head</span><span className="v">{receipt.head}</span></div>
          <div className="kv"><span className="k">Mode</span><span className="v">{receipt.mode}</span></div>
          <div className="kv"><span className="k">Amount</span><span className="v" style={{ fontSize: 18 }}>{inr(receipt.amount)}</span></div>
          <div className="kv"><span className="k">Status</span><span className="v"><Badge tone={statusTone(receipt.status)}>{receipt.status}</Badge></span></div>
        </Modal>
      )}

      {payOpen && child && (
        <Modal
          title="Pay School Fees"
          onClose={() => setPayOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setPayOpen(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const p = mine.find((x) => x.status !== "Paid");
                  addPayment({
                    studentId: child.id,
                    amount: p?.amount ?? (due || 20000),
                    date: "2026-09-25",
                    mode: "UPI",
                    head: p?.head ?? "Tuition Fee — Term 2",
                    status: "Paid",
                  });
                  setPayOpen(false);
                }}
              >
                <Icon name="check" size={16} /> Confirm payment
              </button>
            </>
          }
        >
          <div className="flex" style={{ marginBottom: 14 }}>
            <Person name={child.name} sub={`${child.className} – ${child.section}`} lg />
            <div style={{ marginLeft: "auto" }}>
              <div className="small muted">Amount payable</div>
              <div className="strong" style={{ fontSize: 24 }}>{inr(due || 20000)}</div>
            </div>
          </div>
          <div className="field">
            <label className="label">Payment method</label>
            <div className="seg">
              <button className="on">UPI</button>
              <button>Card</button>
              <button>Net Banking</button>
              <button>Wallet</button>
            </div>
          </div>
          <div className="field">
            <label className="label">UPI ID</label>
            <input className="input" defaultValue="parent@okaxis" />
          </div>
          <div className="hint">
            A receipt will be generated instantly and added to your payment history.
          </div>
        </Modal>
      )}
    </>
  );
}
