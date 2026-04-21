import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PublicNavbar from "../../PublicNavbar";
import "../styles/ViewCourseDetailMobile.css";

const API_BASE = "https://api.octosofttechnologies.in/api";

// ── Mock data fallbacks (used when API fields are empty) ─────────────────────
const MOCK_ABOUT =
  "This nationally recognised course meets the requirements for working safely on construction sites across all Australian states and territories. Delivered face to face by experienced trainers with same-week enrolment available, including Sundays.";

const MOCK_OUTCOMES = [
  "Understand WHS legislative requirements for construction",
  "Identify and report common construction site hazards",
  "Apply basic risk control measures on site",
  "Correctly select, fit and use PPE equipment",

];

const MOCK_REQUIREMENTS = [
  "Minimum age 14 years",
  "100 points of original ID on the day",
  "Unique Student Identifier (USI) — free to get online",
  "Basic understanding of spoken and written English",

];

const STATIC_REVIEWS = [
  { name: "Valerii R.", text: "Very good place. Trainer was excellent and easy to understand. Passed first go. Highly recommend STA." },
  { name: "Jesus C.",   text: "They provide excellent information and the trainers are very knowledgeable. Great experience overall." },
  { name: "Maria T.",   text: "Fantastic training facility. Staff were helpful and the course was well structured. Got my card same day!" },
  { name: "Ahmed K.",   text: "Best training centre in Sydney. Friendly staff, clean facility and great trainers. 10/10." },
];

const TRUST_BADGES = [
  { icon: "⭐", text: "1,000+ five-star Google reviews" },
  { icon: "🏛", text: "SafeWork NSW approved RTO" },
  { icon: "📜", text: "Certificate same day" },
  { icon: "📅", text: "Sunday sessions available" },
];


// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { day: "numeric" });
}
function formatMon(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase();
}
function formatWeekday(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { weekday: "long" });
}
function isLow(slots) { return slots <= 3; }
function isSunday(dateStr) {
  return new Date(dateStr).getDay() === 0;
}

// chunk array into groups of n
function chunkArray(arr, n) {
  const pages = [];
  for (let i = 0; i < arr.length; i += n) pages.push(arr.slice(i, i + n));
  return pages;
}
function SectionSlider({ sections }) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setPage(p => (p + 1) % sections.length),
      2000
    );
    return () => clearInterval(t);
  }, [sections.length]);

  return (
    <div className="cdm-section">
      <div className="cdm-section-title">{sections[page].heading}</div>
      <div className="slide-wrap">
        <div
          className="slide-track"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {sections.map((s, i) => (
            <div key={i} className="slide-page">
              <ul className="cdm-checklist">
                {s.points.map((pt, j) => (
                  <li key={j}>
                    <span className="cdm-check">✓</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="cdm-dot-row">
        {sections.map((_, i) => (
          <div
            key={i}
            className={`cdm-dot ${i === page ? "active" : ""}`}
            onClick={() => setPage(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ViewCourseDetailMobile({ course }) {
  const navigate = useNavigate();
  const [sessions, setSessions]       = useState([]);
  const [loadingSessions, setLoading] = useState(true);
  const [showAll, setShowAll]         = useState(false);
  const PAGE_SIZE                     = 7;
  const SHOW_DEFAULT                  = 3;
  const reviewRef = useRef(null);

  // ── Fetch sessions ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!course?._id) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/schedules/course/${course._id}`)
      .then((res) => {
        const rows = [];
        res.data.forEach((sched) => {
          sched.sessions
            .filter((s) => s.status === "Active")
            .forEach((s) => {
              rows.push({
                id:             s._id,
                date:           sched.date,
                startTime:      s.startTime,
                endTime:        s.endTime,
                location:       s.location || course.location || "Sefton NSW",
                availableSlots: s.availableSlots,
              });
            });
        });
        rows.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSessions(rows);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [course?._id]);

  if (!course) return null;

  // ── Price display ─────────────────────────────────────────────────────────
  const price  = course.sellingPrice ? `$${course.sellingPrice}` : "Enquire";
  const orig   = course.originalPrice && course.originalPrice > course.sellingPrice
    ? `$${course.originalPrice}` : null;
  const saving = orig
    ? `Save $${course.originalPrice - course.sellingPrice}` : null;

  // ── Content arrays — use API data if available, else mock fallback ──────────
  const outcomePoints    = (course.outcomePoints    || []).filter(Boolean);
  const requirements     = (course.requirements     || []).filter(Boolean);
  const rawOverview      = (course.trainingOverview || []).filter(Boolean).join(" ");
  const rawDescription   = (course.description      || []).filter(Boolean).join(" ");

  const aboutText     = rawOverview || rawDescription || MOCK_ABOUT;
  const outcomeList   = outcomePoints.length  > 0 ? outcomePoints  : MOCK_OUTCOMES;
  const requireList   = requirements.length   > 0 ? requirements   : MOCK_REQUIREMENTS;

  // ── Chunk into groups of 4 for swipe ─────────────────────────────────────
  const outcomePages  = chunkArray(outcomeList, 4);
  const reqPages      = chunkArray(requireList, 4);

  // ── Session display ───────────────────────────────────────────────────────
  const sessionPages = chunkArray(sessions, PAGE_SIZE);

  return (
    <div className="cdm-root">

      {/* ── Top Bar ── */}
      <div className="cdm-topbar">
        <button className="cdm-back-btn" onClick={() => navigate(-1)}>‹</button>
        <span className="cdm-topbar-title">Course details</span>
        <a href="tel:1300976097" className="cdm-topbar-phone">☎ Call</a>
      </div>

      <PublicNavbar courses={[]} />

      {/* ── Hero Image — code + title BOTTOM overlay (Option A style) ── */}
      <div className="cdm-hero-img" style={{
        backgroundImage: course.image ? `url(${course.image})` : undefined
      }}>
        <div className="cdm-hero-overlay" />
        <div className="cdm-hero-content">
          {course.courseCode && (
            <div className="cdm-hero-code">{course.courseCode}</div>
          )}
          <div className="cdm-hero-title">{course.title}</div>
          <div className="cdm-hero-price-num">{price}</div>
        </div>
        <div className="cdm-hero-price ">
          
          <button className="cdm-hero-btn">Book VOC</button>
        </div>
      </div>

      {/* ── Quick Facts ── */}
      <div className="cdm-quick-facts">
        <div className="cdm-fact">
          <div className="cdm-fact-icon">📅</div>
          <div className="cdm-fact-val">{course.duration || "—"}</div>
          <div className="cdm-fact-label">Duration</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">📍</div>
          <div className="cdm-fact-val">{course.location || "Sefton"}</div>
          <div className="cdm-fact-label">Location</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">🎓</div>
          <div className="cdm-fact-val">RTO #45234</div>
          <div className="cdm-fact-label">Accredited</div>
        </div>
      </div>

      {/* ── About — para only, no section title ── */}
      {/* <div className="cdm-section">
        <p className="cdm-desc-text">{aboutText}</p>
      </div> */}

      {/* ── What You Will Learn ── */}
  

      {/* ── Price Section ── */}
      <div className="cdm-price-section">
        <div className="cdm-price-main">
          <div className="cdm-price-big">{price}</div>
          <div>
            {saving && <span className="cdm-price-save">{saving}</span>}
            <div className="cdm-price-note">All inclusive — no hidden fees</div>
            <div className="cdm-price-note">SafeWork NSW card fee included</div>
          </div>
        </div>
        <button
          className="cdm-book-now-big"
          onClick={() => {
            const el = document.getElementById("cdm-dates");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Book Now — Pick your date below
        </button>
      </div>

      {/* ── Available Dates — default 3, see more → 7-per-page swipe ── */}
      <div className="cdm-section" id="cdm-dates">
        <div className="cdm-section-title">Available dates</div>
        {loadingSessions ? (
          <div className="cdm-sessions-loading">
            {[1,2,3].map(i => <div key={i} className="cdm-skeleton-slot" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="cdm-no-sessions">
            No upcoming sessions. Call us to book a private session.
          </div>
        ) : (
          <>
            {/* Collapsed: first 3 as list */}
            {!showAll && (
              <div className="cdm-dates-list">
                {sessions.slice(0, SHOW_DEFAULT).map((s) => {
                  const low    = isLow(s.availableSlots);
                  const sunday = isSunday(s.date);
                  return (
                    <div key={s.id} className="cdm-date-slot">
                      <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
                        <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
                        <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
                      </div>
                      <div className="cdm-date-info">
                        <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
                        <div className="cdm-date-time">
                          {s.startTime && s.endTime
                            ? `${s.startTime} – ${s.endTime} · ${s.location}`
                            : s.location}
                        </div>
                      </div>
                      <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
                        {s.availableSlots} {s.availableSlots === 1 ? "spot" : "spots"}
                      </div>
                      <button
                        className="cdm-book-slot-btn"
                        onClick={() => navigate(`/enroll?course=${course._id}&session=${s.id}`)}
                      >
                        Book
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Expanded: 7-per-page swipe */}
            {showAll && (
              <div className="cdm-session-swipe">
                {sessionPages.map((page, pageIdx) => (
                  <div key={pageIdx} className="cdm-session-page-card">
                    {page.map((s) => {
                      const low    = isLow(s.availableSlots);
                      const sunday = isSunday(s.date);
                      return (
                        <div key={s.id} className="cdm-date-slot">
                          <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
                            <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
                            <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
                          </div>
                          <div className="cdm-date-info">
                            <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
                            <div className="cdm-date-time">
                              {s.startTime && s.endTime
                                ? `${s.startTime} – ${s.endTime} · ${s.location}`
                                : s.location}
                            </div>
                          </div>
                          <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
                            {s.availableSlots} {s.availableSlots === 1 ? "spot" : "spots"}
                          </div>
                          <button
                            className="cdm-book-slot-btn"
                            onClick={() => navigate(`/enroll?course=${course._id}&session=${s.id}`)}
                          >
                            Book
                          </button>
                        </div>
                      );
                    })}
                    <div className="cdm-page-indicator">
                      {pageIdx + 1} / {sessionPages.length}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* See more / See less */}
            {sessions.length > SHOW_DEFAULT && (
              <button
                className="cdm-see-more-btn"
                onClick={() => setShowAll(v => !v)}
              >
                {showAll
                  ? " See less"
                  : ` See all sessions`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Why Choose STA ── */}
      <div className="cdm-section">
        <div className="cdm-section-title">Why choose STA</div>
        <div className="cdm-trust-row">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="cdm-trust-badge">
              <span className="cdm-trust-icon">{b.icon}</span>
              <span className="cdm-trust-text">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

          <div className="cdm-section">

              <SectionSlider
                  sections={[
                      { heading: "What you will learn", points: outcomeList },
                      { heading: "Entry requirements", points: requireList },
                  ]}
              />
          </div>

      {/* ── Student Reviews — horizontal swipe ── */}
      <div className="cdm-section">
        <div className="cdm-section-title">Student reviews</div>
        <div className="cdm-review-scroll" ref={reviewRef}>
          {STATIC_REVIEWS.map((r, i) => (
            <div key={i} className="cdm-review-card">
              <div className="cdm-review-header">
                <div className="cdm-review-name">{r.name}</div>
                <div className="cdm-review-stars">★★★★★</div>
              </div>
              <div className="cdm-review-text">"{r.text}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="cdm-sticky">
        <button
          className="cdm-sticky-book"
          onClick={() => {
            const el = document.getElementById("cdm-dates");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Book Now — {price}
        </button>
        <a href="tel:1300976097" className="cdm-sticky-call">📞</a>
      </div>

    </div>
  );
}