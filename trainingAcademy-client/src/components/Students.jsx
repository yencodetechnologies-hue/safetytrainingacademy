import { useState, useEffect } from "react";
import "../styles/Student.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/service";


const ITEMS_PER_PAGE = 10;
const API_BASE = `https://api.octosofttechnologies.in/api`;

// ─── Badge Components ───────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isCompleted = status === "Completed";
  return (
    <span className={`status-badge ${isCompleted ? "badge-completed" : "badge-not-completed"}`}>
      <span className="badge-icon">{isCompleted ? "✓" : "⊘"}</span>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function PaymentBadge({ status }) {
  return (
    <span className={`payment-badge ${status === "Paid" ? "payment-paid" : "payment-unpaid"}`}>
      {status}
    </span>
  );
}

function ActiveBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span className={`active-badge ${isActive ? "badge-active" : "badge-inactive"}`}>
      {status}
    </span>
  );
}

// ─── View Modal ──────────────────────────────────────────────────────────────

function ViewModal({ student, onClose }) {
  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Student details: {student.name}</h2>
            <p className="modal-subtitle">
              Profile, courses purchased, payment dates and history for {student.email}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-profile-card">
          <div className="modal-avatar">
            <span>{student.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="modal-profile-info">
            <h3 className="modal-name">{student.name}</h3>
            {student.nickname && <p className="modal-nick">({student.nickname})</p>}
            <p className="modal-email-line">✉ {student.email}</p>
            <p className="modal-phone-line">📞 {student.phone}</p>
            <div className="modal-badges">
              <ActiveBadge status={student.status} />
              <span className={`status-badge ${student.llndStatus === "Completed" ? "badge-completed" : "badge-not-completed"}`}>
                LLND: {student.llndStatus}
              </span>
              <span className={`status-badge ${student.enrollmentForm === "Completed" ? "badge-completed" : "badge-not-completed"}`}>
                Form: {student.enrollmentForm}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h4 className="modal-section-title">📘 Course</h4>
          <div className="modal-detail-row"><span>Course</span><span>{student.course || "—"}</span></div>
          <div className="modal-detail-row"><span>Type</span><span>{student.type || "—"}</span></div>
          <div className="modal-detail-row"><span>Booking Date</span><span>{student.courseBookingDate || "—"}</span></div>
          <div className="modal-detail-row"><span>Register Date</span><span>{student.registerDate || "—"}</span></div>
          <div className="modal-detail-row"><span>Last Login</span><span>{student.lastLogin || "Never"}</span></div>
        </div>

        <div className="modal-section">
          <h4 className="modal-section-title">💲 Payment Summary</h4>
          <div className="modal-detail-row">
            <span>Payment Status</span>
            <PaymentBadge status={student.paymentStatus} />
          </div>
          <div className="modal-detail-row">
            <span>Payment Method</span>
            <PaymentBadge status={student.paymentMethod} />
          </div>
          <div className="modal-detail-row">
            <span>Transaction ID</span>
            <PaymentBadge status={student.transactionId} />
          </div>
          <div className="modal-detail-row">
            <span>Transaction URL</span>
            <a href={student.slipUrl} target="_blank" rel="noopener noreferrer">View Transaction</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student?.name || "",
    nickname: student?.nickname || "",
    email: student?.email || "",
    phone: student?.phone || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(`${API_BASE}/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update student");

      const updated = await res.json();
      onSave(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Student</h2>
            <p className="modal-subtitle">Update student information</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">
          <label className="modal-label">Full Name</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input
              className="modal-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <label className="modal-label">Preferred Name (Optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input
              className="modal-input"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Johnny"
            />
          </div>

          <label className="modal-label">Email</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">✉</span>
            <input
              className="modal-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          <label className="modal-label">Phone Number</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">📞</span>
            <input
              className="modal-input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+61..."
            />
          </div>

          <label className="modal-label">New Password (optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">🔒</span>
            <input
              className="modal-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="modal-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Update Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ student, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(student.flowId);
    setDeleting(false);
  };

  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Student Account?</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-delete-body">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p className="modal-delete-warning">This will remove the student and all related records. This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="modal-delete-confirm-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add student");
      const newStudent = await res.json();
      onSave(newStudent);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add New Student</h2>
            <p className="modal-subtitle">Create a new student account</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">
          <label className="modal-label">Full Name *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input className="modal-input" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
          </div>

          <label className="modal-label">Preferred Name (Optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input className="modal-input" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Johnny" />
          </div>

          <label className="modal-label">Email *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">✉</span>
            <input className="modal-input" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
          </div>

          <label className="modal-label">Phone Number</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">📞</span>
            <input className="modal-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+61..." />
          </div>

          <label className="modal-label">Password *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">🔒</span>
            <input className="modal-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set a password" />
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE}/students`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // ── Filter & Paginate ──────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── CRUD Handlers ──────────────────────────────────────────────────────────
const fetchStudents = async () => {
  try {
    const res = await fetch(`${API_BASE}/students`);
    const data = await res.json();
    setStudents(data);
  } catch (err) {
    console.error(err);
  }
};
  // Edit: update student in list after save
  const handleEditSave = (updated) => {
    setStudents((prev) =>
      prev.map((s) => (s.flowId === updated.flowId ? { ...s, ...updated } : s)  )
    );
    setEditStudent(null);
    fetchStudents();
  };

  // Deactivate / Activate toggle
const handleToggleStatus = async (student) => {
  const newStatus = student.status === "Active" ? "Inactive" : "Active";

  try {
    const res = await fetch(`${API_BASE}/students/${student.flowId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    const updated = await res.json();

    setStudents((prev) =>
      prev.map((s) =>
        s.flowId === student.flowId
          ? { ...s, status: updated.status } // ⚡ no fallback needed
          : s
      )
    );
    fetchStudents();

  } catch (err) {
    alert("Error: " + err.message);
  }
};

  // Delete
  const handleDeleteConfirm = async (flowId) => {
    try {
      const res = await fetch(`${API_BASE}/students/${flowId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      setStudents((prev) => prev.filter((s) => s.flowId !== flowId));
      setDeleteStudent(null);
      fetchStudents();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Add new student
  const handleAddSave = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    setShowAddModal(false);
  };

  
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sm-page">
      {/* Section Header */}
      <div className="sm-section-header">
        <div className="sm-page-header">
          <h1 className="sm-page-title">Student Management</h1>
          <p className="sm-page-subtitle">Manage all registered students</p>
        </div>
        <button className="sm-add-btn" onClick={() => setShowAddModal(true)}>
          <span className="sm-add-btn-icon">+</span> Add New Student
        </button>
      </div>

      {/* Search & Filter */}
      <div className="sm-card sm-search-card">
        <h3 className="sm-card-title">Search &amp; Filter</h3>
        <p className="sm-card-subtitle">Find students by name, email, or status</p>
        <div className="sm-search-row">
          <div className="sm-search-input-wrap">
            <span className="sm-search-icon">🔍</span>
            <input
              className="sm-search-input"
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
            />
          </div>
          <select
            className="sm-status-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="sm-search-btn" onClick={() => setCurrentPage(1)}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sm-card sm-table-card">
        <div className="sm-table-header">
          <h3 className="sm-card-title">Student Accounts ({filtered.length})</h3>
          <p className="sm-card-subtitle">Manage all student registrations and access</p>
        </div>

        {loading && <p className="sm-loading">Loading students...</p>}
        {error && <p className="sm-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="sm-table-scroll">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Register date</th>
                  <th>Name</th>
                  <th>Individual/Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Course schedule date</th>
                  <th>LLND Status</th>
                  <th>Enrollment Form</th>
                  <th>Payment Method</th>
                  <th>Payment status</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((s) => (
                    <tr key={s.flowId}>
                      <td>
                        <div className="sm-date">{s.registerDate}</div>
                        <div className="sm-time">{s.registerTime}</div>
                      </td>
                      <td>
                        <div className="sm-student-cell">
                          <div className="sm-avatar">
                            <span className="sm-avatar-icon">🎓</span>
                          </div>
                          <div>
                            <div className="sm-student-name">{s.name}</div>
                            {s.nickname && (
                              <div className="sm-student-nick">({s.nickname})</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{s.type}</td>
                      <td className="sm-email">{s.email}</td>
                      <td>{s.phone}</td>
                      <td className="sm-course">
                        <div style={{ fontWeight: 500 }}>{s.courseTitle || "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>{s.courseCategory || ""}</div>
                      </td>
                      <td>{s.courseBookingDate}</td>
                      <td>
                        <div className="sm-status-cell">
                          <StatusBadge status={s.llndStatus} />
                          <button
                            className="sm-icon-btn"
                            title="View LLND"
                            onClick={() => navigate(`/admin/llnd-results?studentId=${s.flowId}&openModal=true`)}
                          >
                            👁
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="sm-status-cell">
                          <StatusBadge status={s.enrollmentForm} />
                          <button
                            className="sm-icon-btn"
                            title="View Enrollment "
                            onClick={() => navigate(`/admin/enrollment-forms?studentEmail=${s.email}&openModal=true`)}
                          >
                            👁
                          </button>
                        </div>
                      </td>
                       <td>
                        <PaymentBadge status={s.paymentMethod} />
                      </td>
                      <td>
                        <PaymentBadge status={s.paymentStatus} />
                      </td>
                      <td>
                        <ActiveBadge status={s.status} />
                      </td>
                      <td>{s.lastLogin || "Never"}</td>
                      <td>
                        <div className="sm-actions">
                          {/* View */}
                          <button
                            className="sm-icon-btn"
                            title="View"
                            onClick={() => setViewStudent(s)}
                          >
                            👁
                          </button>

                          {/* Edit */}
                          <button
                            className="sm-icon-btn"
                            title="Edit"
                            onClick={() => setEditStudent(s)}
                          >
                            ✏️
                          </button>

                          {/* Deactivate / Activate */}
                          <button
                            className={s.status === "Active" ? "sm-deactivate-btn" : "sm-activate-btn"}
                            onClick={() => handleToggleStatus(s)}
                          >
                            {s.status === "Active" ? "Deactivate" : "Activate"}
                          </button>

                          {/* Delete */}
                          <button
                            className="sm-icon-btn sm-delete-btn"
                            title="Delete"
                            onClick={() => setDeleteStudent(s)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div className="sm-pagination">
            <span className="sm-pagination-info">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length} results
            </span>
            <div className="sm-pagination-controls">
              <button
                className="sm-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="sm-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="sm-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewStudent && (
        <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />
      )}
      {editStudent && (
        <EditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteStudent && (
        <DeleteModal
          student={deleteStudent}
          onClose={() => setDeleteStudent(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSave}
        />
      )}
    </div>
  );
}