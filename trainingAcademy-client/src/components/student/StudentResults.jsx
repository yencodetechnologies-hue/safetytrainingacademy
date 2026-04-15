import { useState } from "react";
import "./StudentResults.css";

const mockResults = [
  {
    id: 1,
    course: "White Card : Prepare to Work Safely in the Construction Industry",
    code: "CPCCWHS1001",
    unit: "Prepare to Work Safely in the Construction Industry",
    type: "Theory",
    date: "2026-04-08",
    score: 92.31,
    status: "Competent",
    feedback: "Excellent performance. You demonstrated strong understanding of workplace safety procedures.",
    attempts: 1,
  },
  {
    id: 2,
    course: "Provide First Aid in an Education and Care Setting",
    code: "HLTAID012",
    unit: "Provide First Aid in an Education and Care Setting",
    type: "Practical",
    date: "2026-05-02",
    score: 78.5,
    status: "Competent",
    feedback: "Good practical skills shown. Review bandaging techniques for improvement.",
    attempts: 1,
  },
  {
    id: 3,
    course: "Conduct Articulated Haul Truck Operations",
    code: "RIIMPO321F",
    unit: "Conduct Articulated Haul Truck Operations",
    type: "Theory",
    date: "2026-04-15",
    score: 55,
    status: "Not Yet Competent",
    feedback: "Please review load capacity and safety checks. Retake available.",
    attempts: 2,
  },
];

const statusConfig = {
  "Competent": { color: "#16a34a", bg: "#dcfce7", label: "Competent" },
  "Not Yet Competent": { color: "#dc2626", bg: "#fee2e2", label: "Not Yet Competent" },
  "Pending": { color: "#ca8a04", bg: "#fef9c3", label: "Pending" },
};

function ScoreRing({ score }) {
  const r = 28, circ = 2 * Math.PI * r;
  const pct = Math.min(score, 100);
  const dashOffset = circ - (pct / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";
  return (
    <svg className="rr-ring" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform="rotate(-90 36 36)" />
      <text x="36" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{score}%</text>
    </svg>
  );
}

export default function StudentResults() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Competent", "Not Yet Competent"];
  const filtered = filter === "All" ? mockResults : mockResults.filter(r => r.status === filter);

  const avg = Math.round(mockResults.reduce((a, r) => a + r.score, 0) / mockResults.length);
  const competentCount = mockResults.filter(r => r.status === "Competent").length;

  return (
    <div className="rr-wrapper">
      <div className="rr-header">
        <h1 className="rr-title">My Results</h1>
        <p className="rr-subtitle">Track your exam results and academic performance</p>
      </div>

      {/* Summary cards */}
      <div className="rr-summary">
        <div className="rr-stat-card">
          <span className="rr-stat-icon">📊</span>
          <div>
            <p className="rr-stat-value">{avg}%</p>
            <p className="rr-stat-label">Average Score</p>
          </div>
        </div>
        <div className="rr-stat-card">
          <span className="rr-stat-icon">✅</span>
          <div>
            <p className="rr-stat-value">{competentCount}/{mockResults.length}</p>
            <p className="rr-stat-label">Units Competent</p>
          </div>
        </div>
        <div className="rr-stat-card">
          <span className="rr-stat-icon">🎯</span>
          <div>
            <p className="rr-stat-value">{mockResults.length}</p>
            <p className="rr-stat-label">Total Assessments</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="rr-filters">
        {filters.map(f => (
          <button key={f} className={`rr-filter-btn ${filter === f ? "rr-filter-btn--active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Results list */}
      <div className="rr-list">
        {filtered.length === 0 && (
          <div className="rr-empty">
            <span>📋</span>
            <p>No results found for this filter.</p>
          </div>
        )}
        {filtered.map(result => {
          const sc = statusConfig[result.status];
          const isOpen = expanded === result.id;
          return (
            <div key={result.id} className={`rr-card ${isOpen ? "rr-card--open" : ""}`}>
              <div className="rr-card-main" onClick={() => setExpanded(isOpen ? null : result.id)}>
                <ScoreRing score={result.score} />
                <div className="rr-card-info">
                  <h3 className="rr-card-unit">{result.unit}</h3>
                  <p className="rr-card-course">{result.course}</p>
                  <div className="rr-card-meta">
                    <span className="rr-meta-tag">{result.type}</span>
                    <span className="rr-meta-tag">📅 {result.date}</span>
                    <span className="rr-meta-tag">Attempt {result.attempts}</span>
                  </div>
                </div>
                <div className="rr-card-right">
                  <span className="rr-status-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                  <span className={`rr-chevron ${isOpen ? "rr-chevron--open" : ""}`}>›</span>
                </div>
              </div>
              {isOpen && (
                <div className="rr-card-detail">
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Unit Code</span>
                    <span className="rr-detail-val">{result.code}</span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Assessment Type</span>
                    <span className="rr-detail-val">{result.type}</span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Date</span>
                    <span className="rr-detail-val">{result.date}</span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Score</span>
                    <span className="rr-detail-val rr-detail-score">{result.score}%</span>
                  </div>
                  <div className="rr-feedback">
                    <span className="rr-detail-label">Feedback</span>
                    <p className="rr-feedback-text">{result.feedback}</p>
                  </div>
                  {result.status === "Not Yet Competent" && (
                    <button className="rr-retake-btn">📖 Schedule Retake</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}