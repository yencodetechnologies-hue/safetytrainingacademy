import { useState, useEffect } from "react";
import "../styles/EnrollmentForms.css";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

function StatusBadge({ status }) {
  const map = {
    Approved: { className: "badge badge-approved", icon: "✓" },
    Pending: { className: "badge badge-pending", icon: "⏱" },
    Rejected: { className: "badge badge-rejected", icon: "✕" },
  };
  const { className, icon } = map[status] || {};
  return (
    <span className={className}>
      <span className="badge-icon">{icon}</span> {status}
    </span>
  );
}

/* ── MODAL ── */
function EnrollmentModal({ form, onClose, onStatusChange }) {
  const [activeTab, setActiveTab] = useState("Applicant");
  const [updating, setUpdating] = useState(false);
  const tabs = ["Applicant", "USI", "Education", "Additional", "Declaration"];

  if (!form) return null;

  const p = form.raw?.personalDetails || {};
  const enr = form.raw?.enrollment || {};
  const usi = form.raw?.usiDetails || {};
  const edu = form.raw?.educationDetails || {};
  const add = form.raw?.additionalInfo || {};
  const decl = form.raw?.declaration || {};
  const addr = p.residentialAddress || {};
  const emergency = p.emergencyContact || {};

  const reviewedDate = form.raw?.updatedAt
    ? new Date(form.raw.updatedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const statusConfig = {
    Approved: { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a", icon: "✓" },
    Pending:  { bg: "#fffbeb", border: "#fde68a", color: "#d97706", icon: "⏱" },
    Rejected: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", icon: "✕" },
  };
  const sc = statusConfig[form.status] || statusConfig.Pending;

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await axios.patch(
        `http://72.61.236.154:8000/api/enrollment-form/${form.id}/status`,
        { status }
      );
      onStatusChange(form.id, status);
      onClose();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Enrollment Form Details</h2>
            <p className="modal-subtitle">Review the student's enrollment form submission</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Status Bar */}
        <div className="modal-status-bar" style={{ background: sc.bg, borderColor: sc.border }}>
          <div className="modal-status-left">
            <span className="modal-status-icon" style={{ color: sc.color }}>
              {sc.icon === "✓" ? (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke={sc.color} strokeWidth="2"/>
                  <path d="M6 10l3 3 5-5" stroke={sc.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : sc.icon}
            </span>
            <div>
              <p className="modal-status-text" style={{ color: sc.color }}>Status: {form.status}</p>
              <p className="modal-status-date">Reviewed on {reviewedDate}</p>
            </div>
          </div>
          <div className="modal-status-actions">
            <button
              className="modal-action-btn"
              onClick={() => window.open(`/api/enrollment-form/${form.id}/pdf`, "_blank")}
            >
              <i className="fa-regular fa-file"></i> View PDF
            </button>
            <button
              className="modal-action-btn"
              onClick={() => window.open(`/print.html?id=${form.id}`, "_blank")}
            >
              <i className="fa-solid fa-print"></i> Print
            </button>

            {/* ✅ Approve Button */}
            {form.status !== "Approved" && (
              <button
                className="modal-action-btn modal-action-approve"
                onClick={() => handleStatus("Approved")}
                disabled={updating}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {updating ? "..." : "Approve"}
              </button>
            )}

            {/* ✅ Reject Button */}
            {form.status !== "Rejected" && (
              <button
                className="modal-action-btn modal-action-reject"
                onClick={() => handleStatus("Rejected")}
                disabled={updating}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {updating ? "..." : "Reject"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`modal-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="modal-body">

          {/* ── APPLICANT TAB ── */}
          {activeTab === "Applicant" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Personal Details</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Title</span>
                    <span className="field-value">{p.title || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Full Name</span>
                    <span className="field-value">{`${p.givenName || ""} ${p.surname || ""}`.trim() || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Preferred Name</span>
                    <span className="field-value">{p.preferredName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Date of Birth</span>
                    <span className="field-value">{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Gender</span>
                    <span className="field-value">{p.gender || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Email</span>
                    <span className="field-value">{p.email || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Mobile</span>
                    <span className="field-value">{p.mobilePhone || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Home Phone</span>
                    <span className="field-value">{p.homePhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Residential Address</h4>
                <p className="field-value">
                  {[addr.unit, addr.street, addr.suburb, addr.state, addr.postcode]
                    .filter(Boolean).join(", ") || "N/A"}
                </p>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Emergency Contact</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Name</span>
                    <span className="field-value">{emergency.name || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Relationship</span>
                    <span className="field-value">{emergency.relationship || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Phone</span>
                    <span className="field-value">{emergency.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">
                  <i className="fa-regular fa-user" style={{ marginRight: 6 }}></i>
                  Photo and ID Card
                </h4>
                {form.raw?.primaryPhotoId && (
                  <div className="modal-photo-block">
                    <div className="modal-photo-label-row">
                      <span className="field-label">Primary Photo ID</span>
                      <a href={form.raw.primaryPhotoId} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <img src={form.raw.primaryPhotoId} alt="Primary ID" className="modal-photo-img" />
                  </div>
                )}
                {form.raw?.secondaryPhotoId && (
                  <div className="modal-photo-block">
                    <div className="modal-photo-label-row">
                      <span className="field-label">Photo</span>
                      <a href={form.raw.secondaryPhotoId} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <img src={form.raw.secondaryPhotoId} alt="Secondary ID" className="modal-photo-img" />
                  </div>
                )}
                {!form.raw?.primaryPhotoId && !form.raw?.secondaryPhotoId && (
                  <p className="field-value">No</p>
                )}
              </div>
            </div>
          )}

          {/* ── USI TAB ── */}
          {activeTab === "USI" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">USI Details</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">USI</span>
                    <span className="field-value">{usi.usiNumber || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Apply through STA</span>
                    <span className="field-value">{usi.applyThroughSTA ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">USI Access Permission</span>
                    <span className="field-value">{usi.accessPermission ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Town/City of Birth</span>
                    <span className="field-value">{usi.townOfBirth || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EDUCATION TAB ── */}
          {activeTab === "Education" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Prior Education</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">School Level</span>
                    <span className="field-value">{edu.schoolLevel || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Year Completed</span>
                    <span className="field-value">{edu.yearCompleted || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">School Name</span>
                    <span className="field-value">{edu.schoolName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">School Location</span>
                    <span className="field-value">{edu.schoolLocation || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <h4 className="modal-section-title">Employment</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Employment Status</span>
                    <span className="field-value">{edu.employmentStatus || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Employer</span>
                    <span className="field-value">{edu.employer || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Training Reason</span>
                    <span className="field-value">{edu.trainingReason || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADDITIONAL TAB ── */}
          {activeTab === "Additional" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Additional Information</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Country of Birth</span>
                    <span className="field-value">{add.countryOfBirth || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Speaks Other Language</span>
                    <span className="field-value">{add.speaksOtherLanguage ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Indigenous Status</span>
                    <span className="field-value">{add.indigenousStatus || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Has Disability</span>
                    <span className="field-value">{add.hasDisability ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DECLARATION TAB ── */}
          {activeTab === "Declaration" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Declaration & Signature</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Privacy Notice Accepted</span>
                    <span className="field-value">{decl.privacyAccepted ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Terms Accepted</span>
                    <span className="field-value">{decl.termsAccepted ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Declaration Name</span>
                    <span className="field-value">{decl.declarationName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Declaration Date</span>
                    <span className="field-value">
                      {decl.declarationDate
                        ? new Date(decl.declarationDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                {decl.signature && (
                  <div className="modal-field" style={{ marginTop: 16 }}>
                    <span className="field-label">Signature</span>
                    <div className="modal-signature-box">
                      <img src={decl.signature} alt="Signature" className="modal-signature-img" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
function EnrollmentForms() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchParams] = useSearchParams();

  const filtered = data.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || row.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalSubmitted = data.length;
  const pending = data.filter((r) => r.status === "Pending").length;
  const approved = data.filter((r) => r.status === "Approved").length;
  const rejected = data.filter((r) => r.status === "Rejected").length;

  const fetchForms = async () => {
    try {
      const res = await axios.get("http://72.61.236.154:8000/api/enrollment-form");
      const formatted = res.data.map((item) => ({
        id: item._id,
        date: new Date(item.createdAt).toLocaleDateString(),
        name: `${item.personalDetails?.givenName || ""} ${item.personalDetails?.surname || ""}`.trim(),
        email: item.personalDetails?.email,
        phone: item.personalDetails?.mobilePhone,
        course: item.enrollment?.units?.join(", ") || "N/A",
        bookingDate: item.enrollment?.preferredStartDate
          ? new Date(item.enrollment.preferredStartDate).toLocaleDateString()
          : "N/A",
        type: "Individual",
        status: item.status,
        enrollments: item.enrollment?.units?.length || 1,
        raw: item,
      }));
      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // ✅ Auto-open modal from URL params (redirect from Students page)
  useEffect(() => {
    const email = searchParams.get("studentEmail");
    const openModal = searchParams.get("openModal");
    if (!email || !openModal || data.length === 0) return;
    const record = data.find(
      (r) => r.email?.toLowerCase() === email.toLowerCase()
    );
    if (record) setSelectedForm(record);
  }, [data, searchParams]);

  // ✅ Update status in UI after Approve/Reject
  const handleStatusChange = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handlePrint = (id) => {
    window.open(`/print.html?id=${id}`, "_blank");
  };

  return (
    <div className="ef-container">
      <div className="ef-header">
        <h2 className="ef-title">Student Enrollment Forms</h2>
        <p className="ef-subtitle">Review and manage student enrollment form submissions</p>
      </div>

      {/* Stat Cards */}
      <div className="ef-stats">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Submitted</p>
            <p className="stat-value purple-enrl">{totalSubmitted}</p>
          </div>
          <div className="stat-icon purple-bg">📋</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Pending Review</p>
            <p className="stat-value yellow">{pending}</p>
          </div>
          <div className="stat-icon yellow-bg">⏱</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Approved</p>
            <p className="stat-value green-enrl">{approved}</p>
          </div>
          <div className="stat-icon green-bg">✓</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Rejected</p>
            <p className="stat-value red">{rejected}</p>
          </div>
          <div className="stat-icon red-bg">✕</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ef-filters">
        <div className="search-wrapper">
          <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            className="ef-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          className="ef-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>All Status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="ef-table-section">
        <div className="ef-table-header">
          <div>
            <h3 className="ef-table-title">Enrollment Forms ({filtered.length})</h3>
            <p className="ef-table-sub">Review submitted enrollment forms</p>
          </div>
        </div>

        <div className="ef-table-wrapper">
          <table className="ef-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Course booking date</th>
                <th>Individual/Company</th>
                <th>Status</th>
                <th>Enrollments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <div className="name-cell">
                      <span className="avatar"><i className="fa-regular fa-user"></i></span>
                      {row.name}
                    </div>
                  </td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.course}</td>
                  <td>{row.bookingDate}</td>
                  <td>{row.type}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <span className="enrollments-badge">{row.enrollments} course</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        title="View"
                        onClick={() => setSelectedForm(row)}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button className="action-btn icon-btn" title="Document">
                        <i className="fa-regular fa-file"></i>
                      </button>
                      <button
                        className="action-btn icon-btn"
                        onClick={() => handlePrint(row.id)}
                        title="Print"
                      >
                        <i className="fa-solid fa-print"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="no-results">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ef-pagination">
          <span className="pagination-info">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal with onStatusChange */}
      {selectedForm && (
        <EnrollmentModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export default EnrollmentForms;