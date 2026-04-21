import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import "../styles/CourseDetails.css"
import PublicNavbar from "../components/PublicNavbar"
import Footer from "../components/landingPage/Footer"
import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"

// ── Mobile hook (outside component — React rules of hooks) ────────────────────
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= breakpoint
    )
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [breakpoint])
    return isMobile
}
// ─────────────────────────────────────────────────────────────────────────────

function CourseDetails() {
    const { id } = useParams()
    const courseId = id?.split("-").pop()

    const [course, setCourse]   = useState(null)   // ✅ was missing
    const [courses, setCourses] = useState([])
    const isMobile = useIsMobile()                  // ✅ at top level

    useEffect(() => {
        if (!courseId) return
        axios.get(`https://api.octosofttechnologies.in/api/courses/${courseId}`)
            .then(res => setCourse(res.data))
            .catch(err => console.error("Course fetch error:", err))

        axios.get(`https://api.octosofttechnologies.in/api/courses`)
            .then(res => setCourses(res.data))
            .catch(err => console.error("Courses fetch error:", err))
    }, [courseId])

    // ── Mobile view ──────────────────────────────────────────────────────────
    if (isMobile) {
        return <ViewCourseDetailMobile course={course} />
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (!course) {
        return (
            <div className="cdp-loading">
                <PublicNavbar />
                <div className="cdp-loading-inner">Loading course...</div>
            </div>
        )
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const originalPrice = course?.originalPrice || 0
    const sellingPrice  = course?.sellingPrice  || 0
    const savings       = originalPrice - sellingPrice

    const relatedCourses = courses
        .filter(c => c._id !== course._id)
        .slice(0, 4)

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="cdp">

            <PublicNavbar courses={courses} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <div
                className="cdp-hero"
                style={course?.image ? { backgroundImage: `url(${course.image})` } : {}}
            >
                {/* LEFT */}
                <div className="cdp-hero-left">
                    <div className="cdp-tag">{course?.courseCode || course?.category}</div>
                    <h1 className="cdp-title">{course?.title}</h1>
                    <div className="cdp-code">
                        {course?.category} &nbsp;·&nbsp; Nationally Recognised Training
                    </div>
                    <div className="cdp-facts">
                        <div className="cdp-fact">
                            <span>📅</span>
                            <span><strong>{course?.duration || "1 day"}</strong> duration</span>
                        </div>
                        <div className="cdp-fact">
                            <span>📍</span>
                            <span><strong>{course?.location || "Sefton"}</strong> NSW 2162</span>
                        </div>
                        <div className="cdp-fact">
                            <span>🎓</span>
                            <span><strong>RTO #45234</strong> accredited</span>
                        </div>
                        <div className="cdp-fact">
                            <span>📜</span>
                            <span>Certificate <strong>same day</strong></span>
                        </div>
                    </div>
                    <p className="cdp-desc">
                        {Array.isArray(course?.description)
                            ? course.description[0]
                            : course?.description || ""}
                    </p>
                </div>

                {/* RIGHT — Price card */}
                <div className="cdp-hero-right">
                    <div className="cdp-price-card">
                        <div className="cdp-price-row">
                            <span className="cdp-price-now">${sellingPrice}</span>
                            {originalPrice > sellingPrice && (
                                <span className="cdp-price-old">${originalPrice}</span>
                            )}
                            {savings > 0 && (
                                <span className="cdp-save-badge">Save ${savings}</span>
                            )}
                        </div>
                        <p className="cdp-price-note">
                            All inclusive — no hidden fees · SafeWork NSW card fee included
                        </p>
                        <button className="cdp-btn-book">Book Now — Pick a Date</button>
                        <button className="cdp-btn-voc">Already Trained? Book VOC</button>
                        <ul className="cdp-trust-list">
                            <li><span className="cdp-check">✓</span> Certificate issued same day</li>
                            <li><span className="cdp-check">✓</span> Sunday sessions available</li>
                            <li><span className="cdp-check">✓</span> SafeWork NSW approved RTO</li>
                            <li><span className="cdp-check">✓</span> 1,000+ five-star Google reviews</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── QUICK FACTS BAR ───────────────────────────────────────────── */}
            <div className="cdp-qfbar">
                {[
                    { icon: "📅", val: course?.duration || "1 Day",          label: "Course duration" },
                    { icon: "⏰", val: "8:30am – 4:30pm",                    label: "Class hours" },
                    { icon: "📍", val: course?.location || "Sefton NSW",      label: "Training location" },
                    { icon: "🎓", val: "RTO #45234",                          label: "Accredited provider" },
                    { icon: "📜", val: "Same Day",                            label: "Certificate issued" },
                    { icon: "🗺", val: "All States",                          label: "Nationally recognised" },
                ].map((item, i) => (
                    <div className="cdp-qf-item" key={i}>
                        <div className="cdp-qf-icon">{item.icon}</div>
                        <div>
                            <div className="cdp-qf-val">{item.val}</div>
                            <div className="cdp-qf-label">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
            <div className="cdp-main">

                {/* LEFT CONTENT */}
                <div className="cdp-content">

                    {/* About */}
                    <div className="cdp-card">
                        <div className="cdp-card-title">
                            About this course
                            {course?.courseCode && (
                                <span className="cdp-card-code">{course.courseCode}</span>
                            )}
                        </div>
                        <div className="cdp-card-body">
                            {Array.isArray(course?.trainingOverview) && course.trainingOverview.filter(Boolean).length > 0
                                ? course.trainingOverview.filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
                                : <p>This nationally recognised qualification is issued by a SafeWork NSW approved Registered Training Organisation and is valid in all Australian states and territories.</p>
                            }
                        </div>
                    </div>

                    {/* What you will learn */}
                    {Array.isArray(course?.outcomePoints) && course.outcomePoints.filter(Boolean).length > 0 && (
                        <div className="cdp-card">
                            <div className="cdp-card-title">What you will learn</div>
                            <ul className="cdp-checklist">
                                {course.outcomePoints.filter(Boolean).map((item, i) => (
                                    <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Entry requirements */}
                    {Array.isArray(course?.requirements) && course.requirements.filter(Boolean).length > 0 && (
                        <div className="cdp-card">
                            <div className="cdp-card-title">Entry requirements</div>
                            <ul className="cdp-checklist">
                                {course.requirements.filter(Boolean).map((item, i) => (
                                    <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fees & Charges */}
                    {Array.isArray(course?.feesCharges) && course.feesCharges.filter(Boolean).length > 0 && (
                        <div className="cdp-card">
                            <div className="cdp-card-title">Fees &amp; Charges</div>
                            <ul className="cdp-checklist">
                                {course.feesCharges.filter(Boolean).map((item, i) => (
                                    <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Why STA */}
                    <div className="cdp-card">
                        <div className="cdp-card-title">Why choose Safety Training Academy</div>
                        <div className="cdp-trust-grid">
                            {[
                                { icon: "⭐", title: "1,000+ Five-Star Reviews",      sub: "Highest rated RTO in Western Sydney" },
                                { icon: "🏛", title: "SafeWork NSW Approved",          sub: "RTO #45234 — nationally recognised" },
                                { icon: "📜", title: "Certificate Same Day",           sub: "Walk out ready to work on site" },
                                { icon: "📅", title: "Sunday Sessions Available",      sub: "Flexible for shift workers and weekdays" },
                                { icon: "💰", title: "All-Inclusive Pricing",          sub: "SafeWork card fee included — no surprises" },
                                { icon: "📍", title: "Easy Location — Free Parking",   sub: "Sefton NSW, close to M4 & M7" },
                            ].map((b, i) => (
                                <div className="cdp-trust-badge" key={i}>
                                    <span className="cdp-tb-icon">{b.icon}</span>
                                    <div>
                                        <div className="cdp-tb-title">{b.title}</div>
                                        <div className="cdp-tb-sub">{b.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="cdp-card">
                        <div className="cdp-card-title">What students say</div>
                        <div className="cdp-rating-bar">
                            <div className="cdp-rating-num">5.0</div>
                            <div>
                                <div className="cdp-stars">★★★★★</div>
                                <div className="cdp-rating-count">1,043 Google reviews</div>
                                <div className="cdp-rating-site">safetytrainingacademy.edu.au</div>
                            </div>
                        </div>
                        <div className="cdp-review-grid">
                            {[
                                { name: "Valerii R.",  course: "White Card · April 2024",    text: "Very good place. Trainer was excellent and easy to understand. Passed first go. Highly recommend STA." },
                                { name: "Jesus C.",    course: "White Card · March 2024",    text: "They provide excellent information and the trainers are very knowledgeable. Great experience overall." },
                                { name: "Daniel M.",   course: "White Card · February 2024", text: "Quick, professional and friendly staff. Got my card same day. Would definitely come back for my forklift ticket." },
                                { name: "Sarah K.",    course: "White Card · January 2024",  text: "Booked on Thursday, did the course on Saturday. Smooth process, great instructor, certificate ready by 4pm." },
                            ].map((r, i) => (
                                <div className="cdp-review-card" key={i}>
                                    <div className="cdp-rc-name">{r.name}</div>
                                    <div className="cdp-rc-course">{r.course}</div>
                                    <div className="cdp-stars" style={{ fontSize: "13px", marginBottom: "6px" }}>★★★★★</div>
                                    <div className="cdp-rc-text">"{r.text}"</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* SIDEBAR */}
                <div className="cdp-sidebar">

                    {/* Price Card */}
                    <div className="cdp-sb-card">
                        <div className="cdp-sb-title">Enrol in this course</div>
                        <div className="cdp-sb-price-row">
                            <span className="cdp-sb-price">${sellingPrice}</span>
                            {originalPrice > sellingPrice && (
                                <span className="cdp-sb-orig">${originalPrice}</span>
                            )}
                        </div>
                        <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                        <button className="cdp-sb-btn-main">Book Now — Pick a Date</button>
                        <button className="cdp-sb-btn-voc">Already Trained? Book VOC</button>
                        <button className="cdp-sb-btn-call">☎ Call 1300 976 097</button>
                        <ul className="cdp-sb-mini-list">
                            <li><span>✓</span> Certificate same day</li>
                            <li><span>✓</span> Sunday sessions available</li>
                            <li><span>✓</span> No prior experience required</li>
                            <li><span>✓</span> Nationally valid in all states</li>
                        </ul>
                    </div>

                    {/* Related Courses */}
                    {relatedCourses.length > 0 && (
                        <div className="cdp-sb-card">
                            <div className="cdp-sb-title">Related courses</div>
                            {relatedCourses.map((c, i) => (
                                <div
                                    className="cdp-related-course"
                                    key={i}
                                    onClick={() => window.location.href = `/course/${c.slug}-${c._id}`}
                                >
                                    <div className="cdp-src-icon">📋</div>
                                    <div>
                                        <div className="cdp-src-name">{c.title}</div>
                                        <div className="cdp-src-price">From ${c.sellingPrice}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Need Help */}
                    <div className="cdp-sb-card cdp-sb-card--dark">
                        <div className="cdp-sb-title cdp-sb-title--light">Need help?</div>
                        <p className="cdp-sb-help-text">
                            Our team can answer questions about course suitability, dates, and group bookings.
                        </p>
                        <a href="tel:1300976097" className="cdp-sb-btn-cyan">☎ 1300 976 097</a>
                        <a href="mailto:info@safetytrainingacademy.edu.au" className="cdp-sb-btn-ghost">✉ Email us</a>
                        <div className="cdp-sb-email">info@safetytrainingacademy.edu.au</div>
                    </div>

                </div>
            </div>

            {/* ── STICKY BOTTOM BAR ─────────────────────────────────────────── */}
            <div className="cdp-sticky">
                <div className="cdp-sticky-info">
                    <div>
                        <div className="cdp-sticky-name">
                            {course?.title}
                        </div>
                        <div className="cdp-sticky-facts">
                            📅 {course?.duration} &nbsp;·&nbsp;
                            📍 {course?.location} &nbsp;·&nbsp;
                            🎓 RTO #45234
                        </div>
                    </div>
                    <div className="cdp-sticky-price">${sellingPrice}</div>
                </div>
                <div className="cdp-sticky-btns">
                    <button className="cdp-sticky-book">Book Now — Pick a Date</button>
                    <a href="tel:1300976097" className="cdp-sticky-call">☎ 1300 976 097</a>
                </div>
            </div>

            <Footer courses={courses} />

        </div>
    )
}

export default CourseDetails