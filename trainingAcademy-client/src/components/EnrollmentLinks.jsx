// EnrollmentLinks.jsx
import { useState } from "react";
import "../styles/EnrollmentLinks.css";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const INITIAL_LINKS = [
  {
    id: "d4998e50",
    name: "Company portal — Safety Training",
    course: "Any course",
    usage: 0,
    maxUses: null,
    expires: null,
    status: "Active",
    payLater: true,
    agent: false,
    description: "Permanent link for employees to enrol; fees billed to the company.",
    createdAt: "26/03/2026 03:49 pm",
    students: [],
  },
  {
    id: "0fe13702",
    name: "Agent Link",
    course: "Any course",
    usage: 5,
    maxUses: null,
    expires: null,
    status: "Active",
    payLater: true,
    agent: true,
    description: "Link for agents to enrol students.",
    createdAt: "20/03/2026 10:12 am",
    students: [
      { name: "John Smith",   email: "john@example.com",   date: "22/03/2026" },
      { name: "Sara Lee",     email: "sara@example.com",   date: "23/03/2026" },
      { name: "Mike Chen",    email: "mike@example.com",   date: "24/03/2026" },
      { name: "Priya Nair",   email: "priya@example.com",  date: "25/03/2026" },
      { name: "Tom Brown",    email: "tom@example.com",    date: "26/03/2026" },
    ],
  },
  {
    id: "9187ff32",
    name: "Company portal — ydmart",
    course: "Any course",
    usage: 0,
    maxUses: null,
    expires: null,
    status: "Active",
    payLater: true,
    agent: false,
    description: "YDMart staff portal link.",
    createdAt: "21/03/2026 09:00 am",
    students: [],
  },
  {
    id: "bc8b8d3c",
    name: "STA Form Payment",
    course: "Any course",
    usage: 2,
    maxUses: 1000,
    expires: "31/12/2026",
    status: "Active",
    payLater: false,
    agent: false,
    description: "Standard payment enrollment form.",
    createdAt: "01/01/2026 08:00 am",
    students: [
      { name: "Alice Wong",  email: "alice@example.com",  date: "10/03/2026" },
      { name: "Bob Kumar",   email: "bob@example.com",    date: "15/03/2026" },
    ],
  },
  {
    id: "b0176bbf",
    name: "STA Form PayLater",
    course: "Any course",
    usage: 63,
    maxUses: 1000,
    expires: "31/12/2026",
    status: "Active",
    payLater: true,
    agent: false,
    description: "Pay later enrollment form for STA.",
    createdAt: "01/01/2026 08:30 am",
    students: [],
  },
];

// ── Simple QR placeholder (SVG grid) ─────────────────────────────────────────
function QRPlaceholder({ value }) {
  // deterministic-ish pattern from string hash
  const hash = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 21;
  const size = 168;
  const cell = size / cells;
  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const edge =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);
      const on = edge
        ? ((r === 0 || r === 6 || c === 0 || c === 6) && (r < 7 && c < 7)) ||
          ((r === 0 || r === 6 || c === cells - 1 || c === cells - 7) && (r < 7 && c >= cells - 7)) ||
          ((r === cells - 7 || r === cells - 1 || c === 0 || c === 6) && (r >= cells - 7 && c < 7)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4 && r < 7 && c < 7) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3 && r < 7) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4)
        : ((hash * (r * cells + c + 1)) % 7) > 3;
      if (on) {
        rects.push(
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 0.5} height={cell - 0.5} fill="#000" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {rects}
    </svg>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="el-toast">
      <span className="check">✓</span>
      {message}
    </div>
  );
}

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    payLater: false,
    agent: false,
    course: "",
    maxUses: "",
    expires: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const id = Math.random().toString(16).slice(2, 10);
    onCreate({
      id,
      name: form.name,
      course: form.course || "Any course",
      usage: 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expires: form.expires || null,
      status: "Active",
      payLater: form.payLater,
      agent: form.agent,
      description: form.description,
      createdAt: new Date().toLocaleDateString("en-AU") + " " + new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
      students: [],
    });
    onClose();
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>Create Enrollment Link</h3>
            <p>Generate a new enrollment link with optional QR code</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <div className="el-field">
            <label>Link Name <span className="req">*</span></label>
            <input
              className="el-input"
              placeholder="e.g., January 2025 Batch"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="el-field">
            <label>Description</label>
            <textarea
              className="el-textarea"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="el-toggles">
            <label className="el-toggle-item">
              <input
                type="checkbox"
                checked={form.payLater}
                onChange={(e) => set("payLater", e.target.checked)}
              />
              🕐 Pay Later
            </label>
            <label className="el-toggle-item">
              <input
                type="checkbox"
                checked={form.agent}
                onChange={(e) => set("agent", e.target.checked)}
              />
              👤 Agent
            </label>
          </div>
          <p className="el-toggle-hint">
            Pay Later: complete enrollment without payment (name, email, mobile, LLN, enrollment form).
            Agent: course list shows course names only—no prices in the dropdown.
          </p>
          <div className="el-field">
            <label>Pre-select Course (Optional)</label>
            <select className="el-select" value={form.course} onChange={(e) => set("course", e.target.value)}>
              <option value="">Any course</option>
              <option value="Safety Training">Safety Training</option>
              <option value="Fire Warden">Fire Warden</option>
              <option value="First Aid">First Aid</option>
            </select>
          </div>
          <div className="el-row-2">
            <div className="el-field">
              <label>Max Uses</label>
              <input
                className="el-input"
                placeholder="Unlimited"
                type="number"
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
              />
            </div>
            <div className="el-field">
              <label>Expires At</label>
              <input
                className="el-input"
                type="date"
                value={form.expires}
                onChange={(e) => set("expires", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="el-btn-primary" onClick={handleCreate}>+ Create Link</button>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ link, onClose }) {
  const url = `https://safetytrainingacademy.edu.au/enroll/${link.id}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>{link.name}</h3>
            <p>Enrollment link details and QR code</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <div className="el-qr-wrap">
            <div className="el-qr-box">
              <QRPlaceholder value={link.id} />
            </div>
          </div>
          <div className="el-url-block">
            <div className="el-url-label">Enrollment URL</div>
            <div className="el-url-row">
              <div className="el-url-text">{url}</div>
              <button className="el-icon-btn" title="Copy" onClick={handleCopy}>
                {copied ? "✓" : "⧉"}
              </button>
              <button className="el-icon-btn" title="Open" onClick={() => window.open(url, "_blank")}>↗</button>
            </div>
            <div className="el-url-created">Created at: {link.createdAt}</div>
          </div>
          <div className="el-info-grid">
            <div className="el-info-item">
              <label>Unique Code:</label>
              <span style={{ fontFamily: "monospace" }}>{link.id}</span>
            </div>
            <div className="el-info-item">
              <label>Status:</label>
              <span><span className={`el-badge ${link.status === "Active" ? "active" : "inactive"}`}>{link.status}</span></span>
            </div>
            <div className="el-info-item">
              <label>Usage:</label>
              <span>{link.usage}{link.maxUses ? `/${link.maxUses}` : " (unlimited)"}</span>
            </div>
            <div className="el-info-item">
              <label>Expires:</label>
              <span>{link.expires || "N/A"}</span>
            </div>
          </div>
          {link.description && (
            <div className="el-field" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description:</label>
              <p style={{ fontSize: 13.5, color: "var(--gray-700)", marginTop: 4, lineHeight: 1.5 }}>{link.description}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {link.payLater && <span className="el-badge pay-later">Pay Later</span>}
            {link.agent    && <span className="el-badge agent">Agent</span>}
          </div>
          <div className="el-enrolled-head">
            👥 Enrolled Students ({link.students.length})
          </div>
          {link.students.length === 0 ? (
            <div className="el-empty-students">
              <div className="el-empty-icon">👥</div>
              No one has enrolled via this link yet
            </div>
          ) : (
            <table className="el-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {link.students.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.email}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Close</button>
          <button className="el-btn-dark">⬇ Download QR</button>
        </div>
      </div>
    </div>
  );
}

// ── Students Modal ────────────────────────────────────────────────────────────
function StudentsModal({ link, onClose }) {
  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal el-students-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>👥 Students – {link.name}</h3>
            <p>{link.students.length} student(s) registered via this link</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          {link.students.length === 0 ? (
            <div className="el-empty-students">
              <div className="el-empty-icon">👥</div>
              No students have joined via this link yet.
            </div>
          ) : (
            <table className="el-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {link.students.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.email}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ link, onClose, onSave }) {
  const [expires, setExpires] = useState(link.expires || "");
  const [maxUses, setMaxUses] = useState(link.maxUses ? String(link.maxUses) : "");

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3><span className="el-edit-icon">✏️</span> Edit Link: {link.name}</h3>
            <p>Update the expiry date or max uses. A new unique URL and QR code will be generated.</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <div className="el-field">
            <label>Expiry Date</label>
            <input
              className="el-input"
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            />
            <p style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 4 }}>Leave blank for no expiry.</p>
          </div>
          <div className="el-field">
            <label>Max Uses</label>
            <input
              className="el-input"
              type="number"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="el-btn-primary"
            onClick={() => {
              onSave(link.id, {
                expires: expires || null,
                maxUses: maxUses ? parseInt(maxUses) : null,
              });
              onClose();
            }}
          >
            ✏️ Save & Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ link, onClose, onDelete }) {
  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <h3>Delete Enrollment Link</h3>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <p style={{ fontSize: 13.5, color: "var(--gray-600)", lineHeight: 1.6 }}>
            Are you sure you want to delete this enrollment link? This action cannot be undone.
          </p>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="el-btn-danger" onClick={() => { onDelete(link.id); onClose(); }}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EnrollmentLinks() {
  const [links, setLinks]         = useState(INITIAL_LINKS);
  const [modal, setModal]         = useState(null); // null | { type, link? }
  const [toast, setToast]         = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openModal = (type, link = null) => setModal({ type, link });
  const closeModal = () => setModal(null);

  // ── Handlers ──
  const handleCreate = (newLink) => {
    setLinks((prev) => [...prev, newLink]);
    showToast("Enrollment link created successfully");
  };

  const handleDelete = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("Enrollment link deleted");
  };

  const handleToggleStatus = (id) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" } : l
      )
    );
    showToast("Link status updated");
  };

  const handleEdit = (id, updates) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    showToast("Link updated successfully");
  };

  const handleCopyUrl = (id) => {
    const url = `safetytrainingacademy.edu.au/enroll/${id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast("URL copied to clipboard");
  };

  // ── Stats ──
  const totalLinks  = links.length;
  const activeLinks = links.filter((l) => l.status === "Active").length;
  const totalUsage  = links.reduce((sum, l) => sum + l.usage, 0);

  const usageDisplay = (link) => {
    if (link.maxUses) return `${link.usage} / ${link.maxUses}`;
    return String(link.usage);
  };

  return (
    <div className="el-page">
      {/* Header */}
      <div className="el-header">
        <div className="el-header-text">
          <h1>Enrollment Links</h1>
          <p>Generate and manage enrollment links with QR codes for bulk student enrollment.</p>
        </div>
        <button className="el-btn-primary" onClick={() => openModal("create")}>
          + Create New Link
        </button>
      </div>

      {/* Stats */}
      <div className="el-stats">
        <div className="el-stat-card">
          <div>
            <div className="label">Total Links</div>
            <div className="value">{totalLinks}</div>
          </div>
          <div className="el-stat-icon purple">🔗</div>
        </div>
        <div className="el-stat-card">
          <div>
            <div className="label">Active Links</div>
            <div className="value" style={{ color: "var(--green)" }}>{activeLinks}</div>
          </div>
          <div className="el-stat-icon green">✅</div>
        </div>
        <div className="el-stat-card">
          <div>
            <div className="label">Total Usage</div>
            <div className="value">{totalUsage}</div>
          </div>
          <div className="el-stat-icon blue">👥</div>
        </div>
      </div>

      {/* Table */}
      <div className="el-table-card">
        <div className="el-table-header">
          <h2>Enrollment Links ({totalLinks})</h2>
          <p>Manage your enrollment links and QR codes.</p>
        </div>
        <table className="el-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id}>
                <td>
                  <div className="el-link-name">{link.name}</div>
                  <div className="el-link-code">{link.id}</div>
                </td>
                <td><span className="el-course-text">{link.course}</span></td>
                <td>{usageDisplay(link)}</td>
                <td>{link.expires || "N/A"}</td>
                <td>
                  <span className={`el-badge ${link.status === "Active" ? "active" : "inactive"}`}>
                    {link.status}
                  </span>
                  {link.payLater && <span className="el-badge pay-later">Pay Later</span>}
                  {link.agent    && <span className="el-badge agent">Agent</span>}
                </td>
                <td>
                  <div className="el-actions">
                    {/* View */}
                    <button className="el-icon-btn" title="View" onClick={() => openModal("view", link)}>👁</button>
                    {/* Students */}
                    <button className="el-icon-btn purple-icon" title="Students" onClick={() => openModal("students", link)}>👥</button>
                    {/* Copy URL */}
                    <button className="el-icon-btn" title="Copy URL" onClick={() => handleCopyUrl(link.id)}>⧉</button>
                    {/* Download QR */}
                    <button className="el-icon-btn" title="Download QR">⬇</button>
                    {/* Edit */}
                    <button className="el-icon-btn" title="Edit" onClick={() => openModal("edit", link)}>✏️</button>
                    {/* Toggle status */}
                    <button
                      className={`el-icon-btn ${link.status === "Active" ? "red" : "purple-icon"}`}
                      title={link.status === "Active" ? "Deactivate" : "Activate"}
                      onClick={() => handleToggleStatus(link.id)}
                    >
                      {link.status === "Active" ? "⊗" : "✓"}
                    </button>
                    {/* Delete */}
                    <button className="el-icon-btn red" title="Delete" onClick={() => openModal("delete", link)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal?.type === "create"   && <CreateModal onClose={closeModal} onCreate={handleCreate} />}
      {modal?.type === "view"     && <ViewModal link={modal.link} onClose={closeModal} />}
      {modal?.type === "students" && <StudentsModal link={modal.link} onClose={closeModal} />}
      {modal?.type === "edit"     && <EditModal link={modal.link} onClose={closeModal} onSave={handleEdit} />}
      {modal?.type === "delete"   && <DeleteModal link={modal.link} onClose={closeModal} onDelete={handleDelete} />}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  );
}