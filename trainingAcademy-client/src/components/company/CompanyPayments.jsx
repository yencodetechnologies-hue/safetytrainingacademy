import { useState } from "react";
import "./CompanyPayments.css";

/* ── Dummy Data ── */
const DUMMY_PAYMENTS = [
  {
    id: 1,
    date: "2026-03-26",
    student: "— (0 lines)",
    course: "—",
    payment: "pending",
    total: 450.0,
    paid: 0.0,
    balance: 450.0,
  },
  {
    id: 2,
    date: "2026-03-21",
    student: "Test company login 2",
    course: "Licence to Operate a Forklift Truck",
    payment: "paid",
    total: 400.0,
    paid: 400.0,
    balance: 0.0,
  },
  {
    id: 3,
    date: "2026-03-21",
    student: "test",
    course: "Identify, locate and protect underground services",
    payment: "pending",
    total: 460.0,
    paid: 0.0,
    balance: 460.0,
  },
];

function fmt(n) {
  return `$${n.toFixed(2)}`;
}

/* ── PaymentsTable sub-component (reused in StudentsEnrolled too) ── */
export function PaymentsTable({ payments = DUMMY_PAYMENTS }) {
  const [selected, setSelected] = useState([]);

  const outstanding = payments.filter((p) => p.payment === "pending" && p.balance > 0);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll = () => setSelected(outstanding.map((p) => p.id));
  const clear = () => setSelected([]);

  return (
    <div className="py-card">
      {/* Card Top */}
      <div className="py-card-top">
        <div className="py-card-info">
          <div className="py-card-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Pay training fees
          </div>
          <p className="py-card-desc">
            Each pay-later company enrolment appears as a line here. Balance reflects payments
            already applied. Card settles immediately; bank transfer updates after we verify your
            receipt in admin.
          </p>
        </div>

        <div className="py-card-actions">
          <button className="py-btn-icon" title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button className="py-btn-outline" onClick={selectAll}>
            Select all outstanding
          </button>
          <button className="py-btn-outline" onClick={clear}>
            Clear
          </button>
          <button
            className="py-btn-primary"
            disabled={selected.length === 0}
          >
            Pay selected
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="py-table-wrap">
        <table className="py-table">
          <thead>
            <tr>
              <th className="py-col-check"></th>
              <th>Date (Sydney)</th>
              <th>Student</th>
              <th>Course</th>
              <th>Payment</th>
              <th className="right">Total</th>
              <th className="right">Paid</th>
              <th className="right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr
                key={row.id}
                className={row.payment === "paid" ? "py-row-paid" : ""}
              >
                <td className="py-col-check">
                  {row.payment === "paid" ? (
                    <span style={{ color: "#d1d5db", fontSize: 16 }}>—</span>
                  ) : (
                    <input
                      type="checkbox"
                      className="py-checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                  )}
                </td>
                <td>{row.date}</td>
                <td>{row.student}</td>
                <td>{row.course}</td>
                <td>
                  <span
                    className={`py-badge ${
                      row.payment === "paid" ? "py-badge-paid" : "py-badge-pending"
                    }`}
                  >
                    {row.payment === "paid" ? "Paid" : "Pending payment"}
                  </span>
                </td>
                <td className="right">{fmt(row.total)}</td>
                <td className="right">{fmt(row.paid)}</td>
                <td className={`right ${row.balance > 0 ? "py-balance-bold" : ""}`}>
                  {fmt(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CompanyPayments({ payments = DUMMY_PAYMENTS }) {
  return (
    <div className="py-wrapper">
      <p className="py-page-label">Payments</p>
      <p className="py-page-subtitle">
        Lines match pay-later enrolments from your portal or bulk-order links (one fee per course).
        Tick what you want to pay; the amount is always the full remaining balance on each selected
        line. After you pay by card, totals and the Payment column update straight away—use Refresh
        if you need the latest from the server.
      </p>

      <PaymentsTable payments={payments} />
    </div>
  );
}

/*
  ── Usage ──

  // Default dummy data:
  <Payments />

  // Real API data:
  <Payments payments={apiData} />
*/