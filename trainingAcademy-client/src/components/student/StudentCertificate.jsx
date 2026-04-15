import { useState } from "react";
import "./StudentCertificate.css";

const mockCerts = [
  {
    id: 1,
    title: "White Card",
    fullName: "Prepare to Work Safely in the Construction Industry",
    code: "CPCCWHS1001",
    issueDate: "2026-04-10",
    expiryDate: "2031-04-10",
    status: "Active",
    rto: "Safety Training Academy",
    rtoCode: "12345",
    studentName: "Sarmad Islam",
  },
  {
    id: 2,
    title: "Provide First Aid",
    fullName: "Provide First Aid in an Education and Care Setting",
    code: "HLTAID012",
    issueDate: "2026-05-05",
    expiryDate: "2029-05-05",
    status: "Active",
    rto: "Safety Training Academy",
    rtoCode: "12345",
    studentName: "Sarmad Islam",
  },
  {
    id: 3,
    title: "CPR Certificate",
    fullName: "Provide Cardiopulmonary Resuscitation",
    code: "HLTAID009",
    issueDate: "2024-03-15",
    expiryDate: "2025-03-15",
    status: "Expired",
    rto: "Safety Training Academy",
    rtoCode: "12345",
    studentName: "Sarmad Islam",
  },
];

const statusConfig = {
  Active:  { color: "#16a34a", bg: "#dcfce7" },
  Expired: { color: "#dc2626", bg: "#fee2e2" },
  Pending: { color: "#ca8a04", bg: "#fef9c3" },
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function StudentCertificate() {
  const [filter, setFilter] = useState("All");
  const [preview, setPreview] = useState(null);

  const filters = ["All", "Active", "Expired"];
  const filtered = filter === "All" ? mockCerts : mockCerts.filter(c => c.status === filter);

  const activeCerts = mockCerts.filter(c => c.status === "Active").length;
  const expiredCerts = mockCerts.filter(c => c.status === "Expired").length;
  const soonExpiring = mockCerts.filter(c => c.status === "Active" && daysUntil(c.expiryDate) < 180).length;

  return (
    <div className="cc-wrapper">
      <div className="cc-header">
        <h1 className="cc-title">My Certificates</h1>
        <p className="cc-subtitle">Manage your certifications and track expiry dates</p>
      </div>

      {/* Summary */}
      <div className="cc-summary">
        <div className="cc-stat">
          <span className="cc-stat-icon">🏅</span>
          <p className="cc-stat-val">{activeCerts}</p>
          <p className="cc-stat-label">Active</p>
        </div>
        <div className="cc-stat">
          <span className="cc-stat-icon">⚠️</span>
          <p className="cc-stat-val">{soonExpiring}</p>
          <p className="cc-stat-label">Expiring Soon</p>
        </div>
        <div className="cc-stat">
          <span className="cc-stat-icon">❌</span>
          <p className="cc-stat-val">{expiredCerts}</p>
          <p className="cc-stat-label">Expired</p>
        </div>
        <div className="cc-stat">
          <span className="cc-stat-icon">📜</span>
          <p className="cc-stat-val">{mockCerts.length}</p>
          <p className="cc-stat-label">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="cc-filters">
        {filters.map(f => (
          <button key={f} className={`cc-filter-btn ${filter === f ? "cc-filter-btn--active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Certs grid */}
      <div className="cc-grid">
        {filtered.map(cert => {
          const sc = statusConfig[cert.status];
          const days = daysUntil(cert.expiryDate);
          const expiringSoon = cert.status === "Active" && days < 180;
          return (
            <div key={cert.id} className={`cc-card ${cert.status === "Expired" ? "cc-card--expired" : ""}`}>
              {/* Card header strip */}
              <div className="cc-card-strip" style={{ background: `linear-gradient(135deg, ${sc.color}, ${sc.color}88)` }}>
                <span className="cc-card-icon">🏅</span>
                <span className="cc-card-status-badge">{cert.status}</span>
              </div>

              <div className="cc-card-body">
                <h3 className="cc-card-title">{cert.title}</h3>
                <p className="cc-card-full">{cert.fullName}</p>
                <p className="cc-card-code">{cert.code}</p>

                <div className="cc-card-dates">
                  <div className="cc-date-item">
                    <span className="cc-date-label">Issued</span>
                    <span className="cc-date-val">{cert.issueDate}</span>
                  </div>
                  <div className="cc-date-item">
                    <span className="cc-date-label">Expires</span>
                    <span className="cc-date-val" style={{ color: cert.status === "Expired" ? "#dc2626" : expiringSoon ? "#ca8a04" : undefined }}>
                      {cert.expiryDate}
                    </span>
                  </div>
                </div>

                {expiringSoon && (
                  <div className="cc-expiry-warn">
                    ⚠️ Expires in {days} days
                  </div>
                )}
                {cert.status === "Expired" && (
                  <div className="cc-expired-notice">
                    ❌ This certificate has expired
                  </div>
                )}

                <p className="cc-rto">{cert.rto} (RTO: {cert.rtoCode})</p>

                <div className="cc-card-actions">
                  <button className="cc-btn cc-btn--outline" onClick={() => setPreview(cert)}>👁 Preview</button>
                  <button className="cc-btn cc-btn--primary">⬇ Download</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="cc-modal-overlay" onClick={() => setPreview(null)}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <button className="cc-modal-close" onClick={() => setPreview(null)}>✕</button>
            <div className="cc-preview">
              <div className="cc-preview-header">
                <div className="cc-preview-logo">🏛 Safety Training Academy</div>
                <p className="cc-preview-rto">RTO Code: {preview.rtoCode}</p>
              </div>
              <div className="cc-preview-seal">🏅</div>
              <h2 className="cc-preview-cert-title">CERTIFICATE OF ATTAINMENT</h2>
              <p className="cc-preview-awarded">This is to certify that</p>
              <h3 className="cc-preview-name">{preview.studentName}</h3>
              <p className="cc-preview-awarded">has successfully completed</p>
              <h4 className="cc-preview-course">{preview.fullName}</h4>
              <p className="cc-preview-code">{preview.code}</p>
              <div className="cc-preview-dates">
                <span>Issue Date: {preview.issueDate}</span>
                <span>Expiry Date: {preview.expiryDate}</span>
              </div>
              <div className="cc-preview-footer">
                <div className="cc-preview-sig">
                  <div className="cc-preview-sig-line" />
                  <p>Authorised Signatory</p>
                </div>
              </div>
            </div>
            <button className="cc-btn cc-btn--primary cc-modal-dl">⬇ Download Certificate</button>
          </div>
        </div>
      )}
    </div>
  );
}
