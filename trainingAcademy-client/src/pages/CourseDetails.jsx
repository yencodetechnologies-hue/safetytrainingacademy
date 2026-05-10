import { useParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import "../styles/CourseDetails.css"
import PublicNavbar from "../components/PublicNavbar"
import Footer from "../components/landingPage/Footer"
import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"
import { API_URL } from "../data/service"
import { useNavigate } from "react-router-dom"
import { cdnImage } from "../utils/cdnImage"
import BookingModal from "../components/course/BookingModal"

function chunkArray(arr, size) {
    if (!arr) return []
    const res = []
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
    return res
}

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

function CourseDetails() {
    const navigate = useNavigate()
    // Route is /course/:slug. We support a legacy fallback where the param
    // still ends with -<ObjectId> (LegacyCourseRedirect rewrites the URL,
    // but the redirect runs in an effect so the first render still has the
    // raw param — handle both shapes here).
    const { slug } = useParams()
    const legacyMatch = slug?.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
    const fetchSlug = legacyMatch ? slug.replace(`-${legacyMatch[1]}`, "") : slug
    const fallbackId = legacyMatch ? legacyMatch[1] : null

    const [course, setCourse] = useState(null)
    const [courses, setCourses] = useState([])
    const [sessions, setSessions] = useState([])
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [showAllSessions, setShowAllSessions] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedOptionId, setSelectedOptionId] = useState(null)
    const swipeRef = useRef(null)
    const isMobile = useIsMobile()

    useEffect(() => {
        if (!fetchSlug && !fallbackId) return
        // Primary: slug lookup. Falls back to id lookup only if a legacy
        // URL slipped past the redirect (e.g. server-rendered link cached
        // before the redirect mounted).
        const url = fetchSlug
            ? `${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`
            : `${API_URL}/api/courses/${fallbackId}`

        axios.get(url)
            .then(res => setCourse(res.data))
            .catch(err => {
                if (fetchSlug && fallbackId) {
                    // Slug missed but we still have the id — try once.
                    axios.get(`${API_URL}/api/courses/${fallbackId}`)
                        .then(r => setCourse(r.data))
                        .catch(e => console.error("Course fetch error:", e))
                } else {
                    console.error("Course fetch error:", err)
                }
            })

        axios.get(`${API_URL}/api/courses`)
            .then(res => setCourses(res.data))
            .catch(err => console.error("Courses fetch error:", err))
    }, [fetchSlug, fallbackId])

    useEffect(() => {
        if (!course?._id) return
        setLoadingSessions(true)
        axios.get(`${API_URL}/api/schedules/course/${course._id}`)
            .then(res => {
                const rows = []
                res.data.forEach(sched => {
                    sched.sessions
                        .filter(s => s.status === "Active")
                        .forEach(s => {
                            rows.push({
                                id: s._id,
                                scheduleId: sched._id,
                                date: sched.date,
                                startTime: s.startTime,
                                endTime: s.endTime,
                                location: s.location || course.location || "Sefton NSW",
                                availableSlots: s.availableSlots
                            })
                        })
                })
                rows.sort((a, b) => new Date(a.date) - new Date(b.date))
                setSessions(rows)
            })
            .catch(err => console.error("Session fetch error:", err))
            .finally(() => setLoadingSessions(false))
    }, [course?._id])

    if (isMobile) {
        return <ViewCourseDetailMobile course={course} />
    }

    if (!course) {
        return (
            <div className="cdp-loading">
                <PublicNavbar />
                <div className="cdp-loading-inner">Loading course...</div>
            </div>
        )
    }

    const originalPrice = course?.originalPrice || 0
    const sellingPrice = course?.sellingPrice || 0
    const savings = originalPrice - sellingPrice

    const isSlbl = !!course?.slblPrice
    const isExperience = !!course?.experienceBasedBooking && !isSlbl

    const relatedCourses = courses
        .filter(c => c._id !== course._id)
        .slice(0, 4)

    const openBooking = (type) => {
        // Direct navigation for specific earthmoving courses ONLY if a type is already chosen
        const directSlugs = [
            'conduct-civil-construction-excavator-operations',
            'conduct-articulated-haul-truck-operations',
            'conduct-civil-construction-skid-steer-loader-operations'
        ];

        if (type && directSlugs.includes(course.slug)) {
            navigate(`/book-now/course/${course.slug}?type=${type}`);
            return;
        }

        if (isExperience || isSlbl) {
            setSelectedOptionId(type || null)
            setShowModal(true)
        } else {
            navigate(`/book-now/course/${course.slug}`)
        }
    }

    // ── Hero price card ────────────────────────────────────────────────────
    const HeroPriceCard = () => (
        <div className="cdp-price-card">

            {/* SLBL */}
            {isSlbl && (
                <>
                    <div className="cdp-pc-label">Course Fee</div>
                    <div className="cdp-pc-slbl-row">
                        {course.slblStrikePrice && (
                            <span className="cdp-price-old">${course.slblStrikePrice}</span>
                        )}
                        <span className="cdp-price-now">${sellingPrice}</span>
                    </div>
                    {savings > 0 && (
                        <div className="cdp-save-badge">SAVE ${savings}!</div>
                    )}
                    <p className="cdp-price-note">All inclusive — no hidden fees</p>
                    <button
                        className="cdp-btn-book"
                        onClick={() => navigate(`/book-now/course/${course.slug}`)}
                    >
                        BOOK NOW — ${sellingPrice}
                    </button>
                </>
            )}

            {/* EXPERIENCE */}
            {isExperience && (
                <>
                    <div className="cdp-pc-label">Course Fee</div>
                    <div className="cdp-pc-exp-block">
                        <div className="cdp-pc-exp-label">With experience</div>
                        <div className="cdp-price-now">${course.withExperiencePrice}</div>
                    </div>
                    <div className="cdp-pc-divider" />
                    {/* <div className="cdp-pc-exp-block">
                        <div className="cdp-pc-exp-label">Without experience</div>
                        <div className="cdp-price-now">${course.withoutExperiencePrice}</div>
                    </div> */}
                    <p className="cdp-price-note">All inclusive — no hidden fees</p>
                    <button
                        className="cdp-btn-book cdp-btn-exp-with"
                        onClick={() => openBooking("with-experience")}
                    >
                        ${course.withExperiencePrice} &nbsp; Book With Experience
                    </button>
                    <button
                        className="cdp-btn-book cdp-btn-exp-without"
                        onClick={() => openBooking("without-experience")}
                    >
                        ${course.withoutExperiencePrice} &nbsp; Book Without Experience
                    </button>
                </>
            )}

            {/* STANDARD */}
            {!isSlbl && !isExperience && (
                <>
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
                    <button
                        className="cdp-btn-book"
                        onClick={() => navigate(`/book-now/course/${course.slug}`)}
                    >
                        Book Now — Pick a Date
                    </button>
                </>
            )}

            <button className="cdp-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}`)}>
                Already Trained? Book VOC
            </button>
            <ul className="cdp-trust-list">
                <li><span className="cdp-check">✓</span> Certificate issued same day</li>
                <li><span className="cdp-check">✓</span> Sunday sessions available</li>
                <li><span className="cdp-check">✓</span> SafeWork NSW approved RTO</li>
                <li><span className="cdp-check">✓</span> 1,000+ five-star Google reviews</li>
            </ul>
        </div>
    )

    // ── Sidebar price card ─────────────────────────────────────────────────
    const SidebarPriceCard = () => (
        <div className="cdp-sb-card">
            <div className="cdp-sb-title">Enrol in this course</div>

            {/* SLBL */}
            {isSlbl && (
                <>
                    <div className="cdp-sb-price-row">
                        <span className="cdp-sb-price">${sellingPrice}</span>
                        {course.slblStrikePrice && (
                            <span className="cdp-sb-orig">${course.slblStrikePrice}</span>
                        )}
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-main"
                        onClick={() => navigate(`/book-now/course/${course.slug}`)}
                    >
                        BOOK NOW — ${sellingPrice}
                    </button>
                </>
            )}

            {/* EXPERIENCE */}
            {isExperience && (
                <>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">With experience</span>
                        <span className="cdp-sb-price">${course.withExperiencePrice}</span>
                    </div>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">Without experience</span>
                        <span className="cdp-sb-price">${course.withoutExperiencePrice}</span>
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-exp-with"
                        onClick={() => openBooking("with-experience")}
                    >
                        ${course.withExperiencePrice} &nbsp; Book With Experience
                    </button>
                    <button
                        className="cdp-sb-btn-exp-without"
                        onClick={() => openBooking("without-experience")}
                    >
                        ${course.withoutExperiencePrice} &nbsp; Book Without Experience
                    </button>
                </>
            )}

            {/* STANDARD */}
            {!isSlbl && !isExperience && (
                <>
                    <div className="cdp-sb-price-row">
                        <span className="cdp-sb-price">${sellingPrice}</span>
                        {originalPrice > sellingPrice && (
                            <span className="cdp-sb-orig">${originalPrice}</span>
                        )}
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-main"
                        onClick={() => navigate(`/book-now/course/${course.slug}`)}
                    >
                        Book Now — Pick a Date
                    </button>
                </>
            )}

            <button className="cdp-sb-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}`)}>
                Already Trained? Book VOC
            </button>
            <a href="tel:1300976097" style={{ textDecoration: "none" }}>
                <button className="cdp-sb-btn-call">☎ Call 1300 976 097</button>
            </a>
            <ul className="cdp-sb-mini-list">
                <li><span>✓</span> Certificate same day</li>
                <li><span>✓</span> Sunday sessions available</li>
                <li><span>✓</span> No prior experience required</li>
                <li><span>✓</span> Nationally valid in all states</li>
            </ul>
        </div>
    )

    return (
        <div className="cdp">

            <PublicNavbar courses={courses} />

            {/* ── HERO ──
                 Real <img> behind the overlay so the LCP image is preloaded
                 with fetchpriority="high" instead of waiting for CSS to
                 resolve a background-image URL.
            */}
            <div className="cdp-hero">
                {course?.image && (
                    <img
                        className="cdp-hero-bg"
                        src={cdnImage(course.image, { w: 1600 })}
                        alt={course?.title || ""}
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                    />
                )}
                <div className="cdp-hero-inner">
                    <div className="cdp-hero-left">
                        <div className="cdp-tag">{course?.courseCode || course?.category}</div>
                        <h1 className="cdp-title">{course?.title}</h1>
                        <div className="cdp-code">
                            {course?.category} &nbsp;·&nbsp; Nationally Recognised Training
                        </div>
                        <p className="cdp-desc">
                            {Array.isArray(course?.description)
                                ? course.description[0]
                                : course?.description || ""}
                        </p>
                    </div>

                    <div className="cdp-hero-right">
                        <HeroPriceCard />
                    </div>
                </div>

                {/* ── QUICK FACTS BAR ── */}
                <div className="cdp-qfbar">
                    {[
                        { icon: "📅", val: course?.duration || "1 Day", label: "Course duration" },
                        { icon: "⏰", val: "8:30am – 4:30pm", label: "Class hours" },
                        { icon: "📍", val: course?.location || "Sefton NSW", label: "Training location" },
                        { icon: "🎓", val: "RTO #45234", label: "Accredited provider" },
                        { icon: "📜", val: "Same Day", label: "Certificate issued" },
                        { icon: "🗺", val: "All States", label: "Nationally recognised" },
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
            </div>

            {showModal && (
                <BookingModal
                    course={course}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedOptionId(null)
                    }}
                    initialSelection={selectedOptionId}
                />
            )}

            {/* ── MAIN LAYOUT ── */}
            <div className="cdp-main">

                <div className="cdp-content">

                    <div className="cdp-card">
                        <div className="cdp-card-title">Available dates &amp; locations</div>
                        {loadingSessions ? (
                            <div className="cdp-sessions-loading">Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                            <p className="cdp-no-sessions">No upcoming sessions available. Please contact us for private bookings.</p>
                        ) : (
                            <>
                                {!showAllSessions ? (
                                    <div className="cdp-sessions-list">
                                        {sessions.slice(0, 4).map((s, i) => {
                                            const d = new Date(s.date)
                                            const day = d.getDate()
                                            const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
                                            const weekday = d.toLocaleString("en-AU", { weekday: "long" })
                                            const isLow = s.availableSlots <= 3
                                            const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/·\s*$/g, "").trim()

                                            return (
                                                <div className="cdp-session-row" key={i}>
                                                    <div className="cdp-s-date">
                                                        <div className="cdp-s-day">{day}</div>
                                                        <div className="cdp-s-mon">{mon}</div>
                                                    </div>
                                                    <div className="cdp-s-info">
                                                        <div className="cdp-s-title">{weekday}</div>
                                                        <div className="cdp-s-meta">
                                                            {s.startTime} – {s.endTime}
                                                        </div>
                                                    </div>
                                                    <div className="cdp-s-meta-desktop">
                                                        {cleanLoc}
                                                    </div>
                                                    <div className={`cdp-s-spots ${isLow ? "cdp-s-spots--low" : ""}`}>
                                                        {s.availableSlots} left
                                                    </div>
                                                    <button
                                                        className="cdp-s-btn"
                                                        onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}`)}
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="cdp-sessions-expanded">
                                        {chunkArray(sessions, 7).map((page, pIdx) => (
                                            <div key={pIdx} className="cdp-expanded-page">
                                                {page.map((s, i) => {
                                                    const d = new Date(s.date)
                                                    const day = d.getDate()
                                                    const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
                                                    const weekday = d.toLocaleString("en-AU", { weekday: "long" })
                                                    const isLow = s.availableSlots <= 3
                                                    const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/·\s*$/g, "").trim()
                                                    const cleanTime = (s.startTime || "").replace(/Face to Face/gi, "").trim()

                                                    return (
                                                        <div className="cdp-session-row expanded" key={i}>
                                                            <div className="cdp-s-date">
                                                                <div className="cdp-s-day">{day}</div>
                                                                <div className="cdp-s-mon">{mon}</div>
                                                            </div>
                                                            <div className="cdp-s-info">
                                                                <div className="cdp-s-title">{weekday} — Full day</div>
                                                                <div className="cdp-s-meta">
                                                                    {cleanTime} – {s.endTime} &nbsp;·&nbsp; {cleanLoc}
                                                                </div>
                                                            </div>
                                                            <div className={`cdp-s-spots ${isLow ? "cdp-s-spots--low" : ""}`}>
                                                                {s.availableSlots} left
                                                            </div>
                                                            <button
                                                                className="cdp-s-btn"
                                                                onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}`)}
                                                            >
                                                                Book
                                                            </button>
                                                        </div>
                                                    )
                                                })}
                                                <div className="cdp-page-indicator">
                                                    {pIdx + 1} / {Math.ceil(sessions.length / 7)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {sessions.length > 4 && (
                                    <button
                                        className="cdp-see-all-btn"
                                        onClick={() => setShowAllSessions(!showAllSessions)}
                                    >
                                        {showAllSessions ? "See less" : `See all sessions`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

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

                    <div className="cdp-card">
                        <div className="cdp-card-title">Why choose STA</div>
                        <div className="cdp-trust-grid">
                            {[
                                { icon: "⭐", title: "1,000+ Five-Star Google Reviews" },
                                { icon: "🏛", title: "SafeWork NSW Approved Provider" },
                                { icon: "📜", title: "Certificate Issued Same Day" },
                                { icon: "📅", title: "Sunday Sessions Available" },
                                { icon: "💰", title: "All-Inclusive Pricing — No Hidden Fees" },
                                { icon: "📍", title: "Easy Location with Free Parking" },
                            ].map((b, i) => (
                                <div className="cdp-trust-badge" key={i}>
                                    <span className="cdp-tb-icon">{b.icon}</span>
                                    <span className="cdp-tb-title">{b.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

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
                                { name: "Valerii R.", course: "White Card · April 2024", text: "Very good place. Trainer was excellent and easy to understand. Passed first go. Highly recommend STA." },
                                { name: "Jesus C.", course: "White Card · March 2024", text: "They provide excellent information and the trainers are very knowledgeable. Great experience overall." },
                                { name: "Daniel M.", course: "White Card · February 2024", text: "Quick, professional and friendly staff. Got my card same day. Would definitely come back for my forklift ticket." },
                                { name: "Sarah K.", course: "White Card · January 2024", text: "Booked on Thursday, did the course on Saturday. Smooth process, great instructor, certificate ready by 4pm." },
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

                    <SidebarPriceCard />

                    {relatedCourses.length > 0 && (
                        <div className="cdp-sb-card">
                            <div className="cdp-sb-title">Related courses</div>
                            {relatedCourses.map((c, i) => (
                                <div
                                    className="cdp-related-course"
                                    key={i}
                                    onClick={() => window.location.href = `/course/${c.slug}`}
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

            {/* ── STICKY BOTTOM BAR ── */}
            <div className="cdp-sticky">
                <div className="cdp-sticky-info">
                    <div>
                        <div className="cdp-sticky-name">{course?.title}</div>
                        <div className="cdp-sticky-facts">
                            📅 {course?.duration} &nbsp;·&nbsp;
                            📍 {course?.location} &nbsp;·&nbsp;
                            🎓 RTO #45234
                        </div>
                    </div>
                    <div className="cdp-sticky-price">
                        {isSlbl
                            ? `From $${sellingPrice}`
                            : isExperience
                                ? `From $${course.withExperiencePrice}`
                                : `$${sellingPrice}`
                        }
                    </div>
                </div>
                <div className="cdp-sticky-btns">
                    <button
                        className="cdp-sticky-book"
                        onClick={() => openBooking()}
                    >
                        Book Now — Pick a Date
                    </button>
                    <a href="tel:1300976097" className="cdp-sticky-call">☎ 1300 976 097</a>
                </div>
            </div>

            <Footer courses={courses} />

        </div>
    )
}

export default CourseDetails