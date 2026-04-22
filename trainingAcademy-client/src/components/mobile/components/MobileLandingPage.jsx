import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/MobileLandingPage.css";
import PublicNavbar from "../../PublicNavbar";
import PromoBar from "../../landingPage/PromoBar";
import Footer from "../../landingPage/Footer";
import { useNavigate } from "react-router-dom";
const API_BASE = "https://api.octosofttechnologies.in/api";

const TRUST_PILLS = [
  "⭐ 5.0 · 1,000+ reviews",
  "RTO #45234",
  "SafeWork NSW approved",
  "📍 Sefton NSW",
];

const REVIEWS = [
  { name: "Valerii R. · White Card", quote: "Very good place. Trainer was excellent, passed first go." },
  { name: "Jesus C. · Forklift", quote: "They provide excellent information and great trainers. Highly recommend." },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function isLow(slots) { return slots <= 3; }

// ─────────────────────────────────────────────────────────────────────────────

export default function MobileLandingPage({ courses = [] }) {
  const [slide, setSlide] = useState(0);
  const [sessionMap, setSessionMap] = useState({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showEnquire, setShowEnquire] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();



  // ── Active courses only ───────────────────────────────────────────────────
  const activeCourses = courses.filter((c) => c.status === "Active" && c.image);

  // ── Hero slides ───────────────────────────────────────────────────────────
  const heroSlides = activeCourses.slice(0, 5).map((c) => ({
    id: c._id,           // ✅ NEW: needed to look up sessionMap
    title: c.title,
    price: c.sellingPrice ? `$${c.sellingPrice}` : "Enquire",
    orig: c.originalPrice && c.originalPrice > c.sellingPrice
      ? `$${c.originalPrice}` : "",
    courseCode: c.courseCode || "",
    image: c.image,
    slug: c.slug,
    duration: c.duration || "",
    sellingPrice: c.sellingPrice,
    location: c.location || "Sefton",
  }));

  // ── Filter: only courses with sessions after fetch; all slides while loading ──
  const filteredHeroSlides = loadingSessions
    ? heroSlides
    : heroSlides.filter((hs) => sessionMap[hs.id] !== undefined);

  const total = filteredHeroSlides.length || 1;

  // reset showAll when slide changes
  const changeSlide = (dir) => {
    setShowAll(false);
    setSlide((s) => (s + dir + total) % total);
  };
  const goSlide = (i) => { setShowAll(false); setSlide(i); };

  useEffect(() => {
    timerRef.current = setInterval(() => changeSlide(1), 3500);
    return () => clearInterval(timerRef.current);
  }, [total]);

  // ── Fetch sessions for hero courses, store by courseId ───────────────────
  useEffect(() => {
    if (heroSlides.length === 0) return;

    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const results = await Promise.all(
          heroSlides.map((hs) =>
            axios
              .get(`${API_BASE}/schedules/course/${hs.id}`)
              .then((res) => ({ id: hs.id, data: res.data, courseInfo: hs }))
              .catch(() => ({ id: hs.id, data: [], courseInfo: hs }))
          )
        );

        const map = {};
        results.forEach(({ id, data, courseInfo }) => {
          const rows = [];
          data.forEach((sched) => {
            sched.sessions
              .filter((sess) => sess.status === "Active")
              .forEach((sess) => {
                rows.push({
                  id: sess._id,
                  scheduleId: sched._id,      // ← ADD
                  courseId: id,
                  date: sched.date,
                  location: sess.location || courseInfo.location || "Sefton",
                  duration: courseInfo.duration,
                  sellingPrice: courseInfo.sellingPrice,
                  availableSlots: sess.availableSlots,
                });
              });
          });
          rows.sort((a, b) => new Date(a.date) - new Date(b.date));
          // only store if has sessions
          if (rows.length > 0) map[id] = rows;
        });

        setSessionMap(map);
        setSlide(0);
        setShowAll(false);
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [courses]);

  // ── Sessions for current hero slide ──────────────────────────────────────
  const currentSlide = filteredHeroSlides[slide] ?? filteredHeroSlides[0];
  const currentCourseId = currentSlide?.id;
  const currentCourseName = currentSlide?.title || "";
  const allSessions = sessionMap[currentCourseId] || [];
  const SHOW_LIMIT = 3;
  const visibleSessions = showAll ? allSessions : allSessions.slice(0, SHOW_LIMIT);
  const hasMore = allSessions.length > SHOW_LIMIT;

  // ── Category cards ────────────────────────────────────────────────────────
  const categoryCards = [
    ...new Map(activeCourses.map((c) => [c.category, c])).values(),
  ].map((c) => ({
    category: c.category,
    image: c.image,
    count: activeCourses.filter((ac) => ac.category === c.category).length,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mlp-root">

      {/* ── Top Bar ── */}
      <div className="mlp-topbar">
        <span className="mlp-logo-text">Safety Training Academy</span>
        <a href="tel:1300976097" className="mlp-topbar-phone">☎ 1300 976097</a>
      </div>
      <PublicNavbar courses={courses} />

      {/* ── Hero Carousel ── */}
      <div className="mlp-carousel">
        {filteredHeroSlides.map((s, i) => (
          <div key={i} className={`mlp-slide ${i === slide ? "active" : ""}`}>
            <div className="mlp-slide-bg" style={{ backgroundImage: `url(${s.image})` }} />
            <div className="mlp-slide-overlay" />
            <div className="mlp-slide-content">
              {s.courseCode && <span className="mlp-slide-badge">{s.courseCode}</span>}
              <div className="mlp-slide-title">{s.title}</div>
              <span className="mlp-slide-price">{s.price}</span>
              {s.orig && <span className="mlp-slide-orig">{s.orig}</span>}
            </div>
          </div>
        ))}
        {/* ✅ CHANGED: prev/next use goSlide-aware changeSlide */}
        <button className="mlp-cbtn mlp-prev" onClick={() => changeSlide(-1)}>‹</button>
        <button className="mlp-cbtn mlp-next" onClick={() => changeSlide(1)}>›</button>
        <div className="mlp-dots">
          {filteredHeroSlides.map((_, i) => (
            <div key={i} className={`mlp-dot ${i === slide ? "active" : ""}`} onClick={() => goSlide(i)} />
          ))}
        </div>
      </div>

      {/* ── Trust Strip ── */}
      <div className="mlp-trust-strip">
        {TRUST_PILLS.map((p, i) => <div key={i} className="mlp-trust-pill">{p}</div>)}
      </div>

      {/* ── Announcement Bar ── */}
      <div className="announcement-bar">
        <p>🔥 SUNDAY CLASSES AVAILABLE • ENROLL NOW • LIMITED SEATS 🔥 &nbsp;&nbsp;&nbsp; NATIONALLY RECOGNIZED CERTIFICATES • GET CERTIFIED WITH CREDENTIALS THAT ARE RECOGNIZED ACROSS ALL STATES AND TERRITORIES</p>
      </div>

      {/* ── CTA Strip ── */}
      <div className="mlp-cta-strip">
        <button className="mlp-btn-book" onClick={() => navigate("/book-now")}>Book Now</button>
        <button className="mlp-btn-book" onClick={() => navigate("/voc")}>Book VOC</button>
      </div>

      {/* ── Sessions — HERO SLIDE LINKED ── */}
      <div className="mlp-divider" />
      <div className="mlp-section">
        <div className="mlp-section-label">Don't miss out</div>
        {/* ✅ NEW: title shows current course name */}
        <div className="mlp-section-title">
          Available sessions
          {currentCourseName && (
            <span className="mlp-session-course-tag">{currentCourseName}</span>
          )}
        </div>

        {loadingSessions ? (
          <div className="mlp-dates-card">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mlp-date-row mlp-skeleton-row">
                <div className="mlp-skeleton mlp-skeleton-dot" />
                <div className="mlp-date-info">
                  <div className="mlp-skeleton mlp-skeleton-title" />
                  <div className="mlp-skeleton mlp-skeleton-sub" />
                </div>
                <div className="mlp-skeleton mlp-skeleton-badge" />
              </div>
            ))}
          </div>
        ) : allSessions.length === 0 ? (
          <div className="mlp-no-sessions">No upcoming sessions for this course. Call us to book!</div>
        ) : (
          <>
            {/* ── Collapsed view: first 3 as list ── */}
            {!showAll && (
              <div className="mlp-dates-card">
                {allSessions.slice(0, SHOW_LIMIT).map((s) => {
                  const low = isLow(s.availableSlots);
                  const whenParts = [
                    formatDate(s.date),
                    s.location,
                    s.duration,
                    s.sellingPrice ? `$${s.sellingPrice}` : null,
                  ].filter(Boolean);
                  return (
                    <div key={s.id} className="mlp-date-row" onClick={() => navigate(`/book-now?courseId=${s.courseId}&scheduleId=${s.scheduleId}&sessionId=${s.id}`)} >
                      <div className={`mlp-date-dot ${low ? "amber" : ""}`} />
                      <div className="mlp-date-info">
                        <div className="mlp-date-course">{currentCourseName}</div>
                        <div className="mlp-date-when">{whenParts.join(" · ")}</div>
                      </div>
                      <div className="mlp-date-actions">
                        <button className="mlp-date-spots " onClick={() => { navigate("/book-now") }}>
                          Book now
                        </button>
                        <div className={`mlp-date-spots ${low ? "low" : ""}`}>
                          {s.availableSlots} {s.availableSlots === 1 ? "spot" : "spots"}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Expanded view: sessions grouped 7 per page, swipe between pages ── */}
            {showAll && (() => {
              const PAGE_SIZE = 7;
              const pages = [];
              for (let i = 0; i < allSessions.length; i += PAGE_SIZE) {
                pages.push(allSessions.slice(i, i + PAGE_SIZE));
              }
              return (
                <div className="mlp-session-swipe">
                  {pages.map((page, pageIdx) => (
                    <div key={pageIdx} className="mlp-session-page-card">
                      {page.map((s) => {
                        const low = isLow(s.availableSlots);
                        const whenParts = [
                          formatDate(s.date),
                          s.location,
                          s.duration,
                          s.sellingPrice ? `$${s.sellingPrice}` : null,
                        ].filter(Boolean);
                        return (
                          <div key={s.id} className="mlp-date-row">
                            <div className={`mlp-date-dot ${low ? "amber" : ""}`} />
                            <div className="mlp-date-info">
                              <div className="mlp-date-course">{currentCourseName}</div>
                              <div className="mlp-date-when">{whenParts.join(" · ")}</div>
                            </div>
                            <div className={`mlp-date-spots ${low ? "low" : ""}`}>
                              {s.availableSlots} {s.availableSlots === 1 ? "spot" : "spots"}
                            </div>
                          </div>
                        );
                      })}
                      {/* page indicator */}
                      <div className="mlp-page-indicator">
                        {pageIdx + 1} / {pages.length}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── See more / See less button ── */}
            {hasMore && (
              <button
                className="mlp-see-more-btn"
                onClick={() => {
                  const next = !showAll;
                  setShowAll(next);
                  if (next) {
                    // pause hero auto-play
                    clearInterval(timerRef.current);
                  } else {
                    // resume hero auto-play
                    timerRef.current = setInterval(() => changeSlide(1), 3500);
                  }
                }}
              >
                {showAll ? "▲ See less" : `▼ See all ${allSessions.length} sessions`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Category Cards ── */}
      <div className="mlp-divider" />
      <div className="mlp-section" id="courses">
        <div className="mlp-section-label">All courses</div>
        <div className="mlp-section-title">Browse & book</div>
        <div className="mlp-course-scroll">
          {categoryCards.map((cat) => (
            <div
              key={cat.category}
              className="mlp-cat-card"
              onClick={() => window.location.href = `/all-courses?category=${encodeURIComponent(cat.category)}`}
            >
              <div className="mlp-cat-img" style={{ backgroundImage: `url(${cat.image})` }}>
                <div className="mlp-cat-gradient" />
                <div className="mlp-cat-content">
                  <div className="mlp-cat-name">{cat.category}</div>
                  <div className="mlp-cat-count">
                    <div className="mlp-cat-count-dot" />
                    {cat.count} courses
                  </div>
                  <div className="mlp-cat-btn">View all →</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reviews & Stats ── */}
      <div className="mlp-divider" />
      <div className="mlp-section">
        <div className="mlp-section-label">Trusted by thousands</div>
        <div className="mlp-section-title">What students say</div>
        <div className="mlp-stats-row">
          <div className="mlp-stat"><div className="mlp-stat-num">1,000+</div><div className="mlp-stat-label">5-star reviews</div></div>
          <div className="mlp-stat"><div className="mlp-stat-num">{activeCourses.length || "15"}+</div><div className="mlp-stat-label">courses</div></div>
          <div className="mlp-stat"><div className="mlp-stat-num">2019</div><div className="mlp-stat-label">established</div></div>
        </div>
        <div className="mlp-reviews-summary">
          <div className="mlp-review-big">5.0</div>
          <div>
            <div className="mlp-stars">★★★★★</div>
            <div className="mlp-review-count">1,043 Google reviews</div>
            <div className="mlp-review-site">safetytrainingacademy.edu.au</div>
          </div>
        </div>
        <div className="mlp-review-scroll">
          {REVIEWS.map((r, i) => (
            <div key={i} className="mlp-review-card">
              <div className="mlp-review-header">
                <div className="mlp-review-name">{r.name}</div>
                <div className="mlp-stars" style={{ fontSize: 12 }}>★★★★★</div>
              </div>
              <div className="mlp-review-quote">"{r.quote}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Partner Brands — infinite marquee ── */}
      <div className="mlp-divider" />
      <div className="mlp-section">
        <div className="mlp-section-label">Trusted by students from</div>
        <div className="mlp-brands-track-wrap">
          <div className="mlp-brands-track">
            {/* duplicate for seamless loop */}
            {[...Array(2)].map((_, dupIdx) => (
              <div key={dupIdx} className="mlp-brands-row">
                {[
                  { name: "Accenture", bg: "#A100FF", color: "#fff", text: "Accenture" },
                  { name: "Deloitte", bg: "#86BC25", color: "#fff", text: "Deloitte." },
                  { name: "EY", bg: "#FFE600", color: "#2E2E38", text: "EY" },
                  { name: "Google Cloud", bg: "#4285F4", color: "#fff", text: "Google Cloud" },
                  { name: "Klaviyo", bg: "#222", color: "#fff", text: "Klaviyo" },
                  { name: "Oracle", bg: "#F80000", color: "#fff", text: "ORACLE" },
                  { name: "Atlassian", bg: "#0052CC", color: "#fff", text: "Atlassian" },
                  { name: "AWS", bg: "#FF9900", color: "#fff", text: "AWS" },
                ].map((brand, i) => (
                  <div key={i} className="mlp-brand-logo" style={{ background: brand.bg }}>
                    <span style={{ color: brand.color, fontWeight: 700, fontSize: 12, letterSpacing: "0.02em" }}>
                      {brand.text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Enquire Now button ── */}
      <div className="mlp-divider" />
      <div className="mlp-section">
        <button className="mlp-enquire-btn" onClick={() => setShowEnquire(true)}>
          Enquire Now
        </button>
      </div>

      {/* ── Enquire Modal (ContactEnrollment) ── */}
      {showEnquire && (
        <div className="mlp-modal-backdrop" onClick={() => setShowEnquire(false)}>
          <div className="mlp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mlp-modal-header">
              <span className="mlp-modal-title">Course Enquiry</span>
              <button className="mlp-modal-close" onClick={() => setShowEnquire(false)}>✕</button>
            </div>
            <div className="mlp-modal-body">
              <div className="mlp-form-row">
                <input className="mlp-input" type="text" placeholder="Name *" />
                <input className="mlp-input" type="tel" placeholder="Phone *" />
              </div>
              <input className="mlp-input mlp-input-full" type="email" placeholder="Email *" />
              <input className="mlp-input mlp-input-full" type="text" placeholder="Subject" />
              <textarea className="mlp-textarea" placeholder="Message" rows={4} />
              <button
                className="mlp-modal-send"
                onClick={() => setShowEnquire(false)}
              >
                SEND ✈
              </button>
              <div className="mlp-modal-divider" />
              <p className="mlp-modal-enrol-text">Ready to enrol? Use the buttons below:</p>
              <div className="mlp-modal-enrol-btns">
                <a href="/book-now" className="mlp-modal-enrol-btn">ENROL NOW</a>
                <a href="/voc" className="mlp-modal-voc-btn">VOC</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {/* ── Sticky Bottom Bar ── */}
      <div className="mlp-sticky">
        <button className="mlp-sticky-call" onClick={() => { navigate(`/book-now`) }}>Enroll Now</button>
        <a href="https://wa.me/611300976097" className="vac-sticky-wa"><span><i class="fa-brands fa-whatsapp"></i></span></a>      </div>

    </div>
  );
}