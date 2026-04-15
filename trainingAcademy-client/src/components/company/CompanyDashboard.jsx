import { useState,useEffect } from "react";
import "./CompanyDashboard.css";



function SummaryCards() {
  const cards = [
    {
      label: "Courses",
      title: "Browse courses",
      desc: "View available training courses in the Courses section",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2.5" />
          <path d="M2 9h20" />
        </svg>
      ),
    },
    {
      label: "Payments",
      title: "Training fees",
      desc: "Pay outstanding per-enrolment lines by card or bank; balances update when payments are applied",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      label: "Students Enrolled",
      title: "Enrolled students",
      desc: "View students enrolled under your company in the Student Enrolled section",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="cd-top-cards">
      {cards.map((card) => (
        <div key={card.label} className="cd-card">
          <div className="cd-card-header">
            <span className="cd-card-label">{card.label}</span>
            {card.icon}
          </div>
          <p className="cd-card-title">{card.title}</p>
          <p className="cd-card-desc">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

function EnrolmentLinkCard({ enrollLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(enrollLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="cd-enroll-card">
      <div className="cd-enroll-heading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        Employee enrolment link
      </div>

      <p className="cd-enroll-desc">
        Share this link with staff. They choose a course and session; training fees are billed to
        your company (no card payment on this link).
      </p>

      <div className="cd-enroll-url-box">{enrollLink}</div>

      <button className="cd-copy-btn" onClick={handleCopy}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

function QuickLinksCard({ username, email }) {
  return (
    <div className="cd-quick-card">
      <p className="cd-quick-title">Quick Links</p>
      <p className="cd-quick-desc">
        Use the sidebar to navigate to Courses, Payments, and Student Enrolled sections.
      </p>
      <div className="cd-quick-divider">
        You are logged in as {username} ({email}).
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CompanyDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setData(user);
  }, []);

  if (!data) return <p>Loading...</p>;

  const username = data.name;
  const email = data.email;

  const enrollLink = `http://localhost:5173/book-now/${data.id}`;

  return (
    <div className="cd-wrapper">
      <p className="cd-page-label">Company Dashboard</p>
      <p className="cd-page-subtitle">
        Welcome back, {username}! Here&apos;s an overview of your account.
      </p>

      <SummaryCards />
      <EnrolmentLinkCard enrollLink={enrollLink} />
      <QuickLinksCard username={username} email={email} />
    </div>
  );
}

