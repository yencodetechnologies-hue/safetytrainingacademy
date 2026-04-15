import { useState } from "react";
import "./StudentsEnrolled.css";


/* ── Dummy Data ── */
const DUMMY_STUDENTS = [
  {
    id: 1,
    name: "Test company login 2",
    email: "yojanprabhu@yahoo.com",
    phone: "9176393260",
    course: "Licence to Operate a Forklift Truck",
    amount: "$400.00",
    payment: "Pending",
    llnd: "Completed",
    form: "Submitted",
    training: "Active",
    trainingNote: "Not marked complete",
    enrolled: "21/03/2026, 11:15:41 am",
  },
  {
    id: 2,
    name: "test",
    email: "ramram13052001@gmail.com",
    phone: "+918124063967",
    course: "Underground Service Locating Ticket",
    amount: "$240.00",
    payment: "Pending",
    llnd: "Completed",
    form: "Submitted",
    training: "Active",
    trainingNote: "Not marked complete",
    enrolled: "21/03/2026, 10:25:10 am",
  },
];

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

/* ── Enrolments Table ── */
function EnrolmentsTable({ students }) {
  return (
    <div className="se-table-wrap">
      <table className="se-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>LLND</th>
            <th>Form</th>
            <th>Training</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>
                <p className="se-student-name">{s.name}</p>
                <p className="se-student-meta">
                  {s.email}
                  <br />
                  {s.phone}
                </p>
              </td>
              <td>{s.course}</td>
              <td>{s.amount}</td>
              <td>
                <span className="se-badge">{s.payment}</span>
              </td>
              <td>
                <span className="se-badge">{s.llnd}</span>
              </td>
              <td>
                <span className="se-badge">{s.form}</span>
              </td>
              <td>
                <div className="se-training-cell">
                  <span className="se-badge" style={{ width: "fit-content" }}>
                    {s.training}
                  </span>
                  <span className="se-training-sub">{s.trainingNote}</span>
                </div>
              </td>
              <td style={{ whiteSpace: "nowrap" }}>{s.enrolled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pay Outstanding Table ── */
function PayOutstandingCard({ payments }) {
  const [selected, setSelected] = useState([]);

  const outstanding = payments.filter((p) => p.payment === "pending" && p.balance > 0);
  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const selectAll = () => setSelected(outstanding.map((p) => p.id));
  const clear = () => setSelected([]);

  return (
    <div className="se-pay-card">
      <div className="se-pay-top">
        <div className="se-pay-info">
          <div className="se-pay-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Pay outstanding training fees
          </div>
          <p className="se-pay-desc">
            Same list as the Payments tab. Tick lines with a balance, Pay selected, then card or
            bank. Use Refresh after a payment if totals do not update. Bank transfer is marked paid
            after we verify your receipt in admin.
          </p>
        </div>

        <div className="se-pay-actions">
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
          <button className="py-btn-primary" disabled={selected.length === 0}>
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
              <tr key={row.id} className={row.payment === "paid" ? "py-row-paid" : ""}>
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
export default function StudentsEnrolled({
  students = DUMMY_STUDENTS,
  payments = DUMMY_PAYMENTS,
}) {
  return (
    <div className="se-wrapper">
      <p className="se-page-label">Students enrolled</p>
      <p className="se-page-subtitle">
        Staff progress (LLND, enrolment form, training). Each pay-later enrolment appears in Pay
        outstanding training fees below (one line per course) so you can select and use Pay selected
        / card or bank transfer.
      </p>

      {/* Enrolments card */}
      <div className="se-card">
        <div className="se-card-heading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          Enrolments
        </div>
        <p className="se-card-desc">
          Company-scoped students and courses (portal and bulk-order links).
        </p>
        <EnrolmentsTable students={students} />
      </div>

      {/* Pay outstanding card */}
      {/* <PayOutstandingCard payments={payments} /> */}
    </div>
  );
}

