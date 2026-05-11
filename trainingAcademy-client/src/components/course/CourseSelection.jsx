import { useEffect, useRef, useState } from "react"
import axios from "axios"
import "../../styles/CourseSelection.css"
import { API_URL } from "../../data/service"

// ─── Pricing variants ────────────────────────────────────────────────────────
// A "variant" = a sub-option of a course shown in the dropdown. For
// experience-based courses we offer With Experience / Without Experience; for
// SL+BL courses we offer Single License / Both Licenses. Standard courses have
// a single, unnamed variant.
//
// Each variant carries its own price so the dropdown can display it inline
// and so the caller can persist the selected variant on the course object
// (as `__variant`) — `getCoursePrice` then prefers the variant over the URL
// `?type=` fallback.
const getCourseVariants = (course) => {
    if (!course) return []
    const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard")

    if (pt === "experience") {
        return [
            { variant: "with-experience",    label: "With Experience",    price: Number(course.withExperiencePrice || 0) },
            { variant: "without-experience", label: "Without Experience", price: Number(course.withoutExperiencePrice || 0) },
        ]
    }
    if (pt === "slbl") {
        return [
            { variant: "sl",   label: "Single License",   price: Number(course.slSinglePrice || 0) },
            { variant: "slbl", label: "Both Licenses (SL + BL)", price: Number(course.slblPrice || 0) },
        ]
    }
    return [{ variant: null, label: null, price: Number(course.sellingPrice || 0) }]
}

const variantKey = (courseId, variant) => variant ? `${courseId}|${variant}` : String(courseId)

function CourseDropdown({ groupedCourses, value, onChange, placeholder = "Select Course", getCoursePrice, enrollmentType }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const allCourses = Object.values(groupedCourses).flat()
    const selected = allCourses.find(c => c._id === value?.courseId)
    const variantLabel = value?.variant
        ? ` (${(getCourseVariants(selected).find(v => v.variant === value.variant) || {}).label || ""})`
        : ""
    const isAgent = String(enrollmentType || "").toLowerCase() === "agent" || enrollmentType === "Agent"
    const label = selected
        ? `${selected.courseCode} - ${selected.title}${variantLabel}${isAgent ? "" : ` - $${getCoursePrice(selected)}`}`
        : placeholder

    return (
        <div className="cs-dropdown" ref={ref}>
            <div
                className={`cs-dropdown__trigger ${open ? "cs-dropdown__trigger--open" : ""}`}
                onClick={() => setOpen(p => !p)}
            >
                <span className={selected ? "cs-dropdown__value" : "cs-dropdown__placeholder"}>{label}</span>
                <span className="cs-dropdown__arrow">{open ? "▲" : "▼"}</span>
            </div>
            {open && (
                <div className="cs-dropdown__menu">
                    {Object.entries(groupedCourses).map(([category, catCourses]) => (
                        <div key={category}>
                            <div className="cs-dropdown__group-label">{category}</div>
                            {catCourses.flatMap(course => {
                                const variants = getCourseVariants(course)
                                return variants.map(v => {
                                    const k = variantKey(course._id, v.variant)
                                    const isSel = value?.courseId === course._id && (value?.variant || null) === (v.variant || null)
                                    const optionLabel = v.label
                                        ? `${course.courseCode} - ${course.title} (${v.label})${isAgent ? "" : ` - $${v.price}`}`
                                        : `${course.courseCode} - ${course.title}${isAgent ? "" : ` - $${v.price}`}`
                                    return (
                                        <div
                                            key={k}
                                            className={`cs-dropdown__option ${isSel ? "cs-dropdown__option--selected" : ""}`}
                                            onClick={() => { onChange(course._id, v.variant); setOpen(false) }}
                                        >
                                            {optionLabel}
                                        </div>
                                    )
                                })
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ✅ Add Course Button — click to open inline dropdown, select to close
function AddCourseButton({ groupedCourses, onAdd, enrollmentType }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const isAgent = String(enrollmentType || "").toLowerCase() === "agent" || enrollmentType === "Agent"
    const handleSelect = (courseId, variant) => {
        onAdd(courseId, variant)
        setOpen(false)
    }

    return (
        <div className="form-group" ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                className="add-course-btn"
                onClick={() => setOpen(p => !p)}
            >
                {open ? "✕ Cancel" : "+ Add Course"}
            </button>

            {open && (
                <div className="cs-dropdown__menu add-course-dropdown">
                    {Object.entries(groupedCourses).map(([category, catCourses]) => (
                        <div key={category}>
                            <div className="cs-dropdown__group-label">{category}</div>
                            {catCourses.flatMap(course => {
                                const variants = getCourseVariants(course)
                                return variants.map(v => {
                                    const k = variantKey(course._id, v.variant)
                                    const optionLabel = v.label
                                        ? `${course.courseCode} - ${course.title} (${v.label})${isAgent ? "" : ` - $${v.price}`}`
                                        : `${course.courseCode} - ${course.title}${isAgent ? "" : ` - $${v.price}`}`
                                    return (
                                        <div
                                            key={k}
                                            className="cs-dropdown__option"
                                            onClick={() => handleSelect(course._id, v.variant)}
                                        >
                                            {optionLabel}
                                        </div>
                                    )
                                })
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ✅ Calendar Date Picker Component
function CalendarDatePicker({ groupedSlots, selectedSession, onSelectSession }) {
    const [calOpen, setCalOpen] = useState(false)
    const [currentYear, setCurrentYear] = useState(() => {
        const dates = Object.keys(groupedSlots)
        if (dates.length > 0) return new Date(dates[0]).getFullYear()
        return new Date().getFullYear()
    })
    const [currentMonth, setCurrentMonth] = useState(() => {
        const dates = Object.keys(groupedSlots)
        if (dates.length > 0) return new Date(dates[0]).getMonth()
        return new Date().getMonth()
    })
    const [selectedDate, setSelectedDate] = useState(null)
    const calRef = useRef(null)

    const availableDateKeys = Object.keys(groupedSlots)

    useEffect(() => {
        const handler = (e) => {
            if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])
    
    // Sync local selectedDate with the session date passed from parent
    useEffect(() => {
        if (selectedSession?.date) {
            setSelectedDate(selectedSession.date)
        }
    }, [selectedSession?.date])

    // ✅ Reset when groupedSlots changes (different course selected)
    useEffect(() => {
        setSelectedDate(null)
        if (availableDateKeys.length > 0) {
            const d = new Date(availableDateKeys[0])
            setCurrentYear(d.getFullYear())
            setCurrentMonth(d.getMonth())
        }
    }, [JSON.stringify(availableDateKeys)])

    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const calDays = []
    for (let i = 0; i < firstDay; i++) calDays.push(null)
    for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

    const formatKey = (d) => {
        const date = new Date(currentYear, currentMonth, d)
        return date.toISOString().split("T")[0]
    }

    const pickDate = (key) => {
        setSelectedDate(key)
        setCalOpen(false)
    }

    const sessionsForDate = selectedDate ? (groupedSlots[selectedDate] || []) : []
    const allSessions = sessionsForDate.flatMap(slot =>
        slot.sessions.map(session => ({ ...session, date: slot.date, slotDate: slot.date }))
    )

    return (
        <div>
            {/* ✅ Select Date Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div ref={calRef} style={{ position: "relative" }}>
                    {calOpen && (
                        <div className="cs-cal-popup">
                            <div className="cs-cal-header">
                                <button className="cs-cal-nav" onClick={prevMonth} type="button">‹</button>
                                <span className="cs-cal-month">{monthNames[currentMonth]} {currentYear}</span>
                                <button className="cs-cal-nav" onClick={nextMonth} type="button">›</button>
                            </div>
                            <div className="cs-cal-grid">
                                {dayNames.map(d => (
                                    <div key={d} className="cs-cal-dayname">{d}</div>
                                ))}
                                {calDays.map((d, i) => {
                                    if (!d) return <div key={`e-${i}`} />
                                    const key = formatKey(d)
                                    const avail = availableDateKeys.includes(key)
                                    const isSel = selectedDate === key
                                    return (
                                        <div
                                            key={key}
                                            className={`cs-cal-day ${avail ? "cs-cal-day--avail" : ""} ${isSel ? "cs-cal-day--selected" : ""}`}
                                            onClick={() => avail && pickDate(key)}
                                        >
                                            {d}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {selectedDate && (
                    <button
                        className="cs-cal-clear"
                        onClick={() => setSelectedDate(null)}
                        type="button"
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* ✅ Date Chip Scroll — no date selected: all dates, selected: only selected */}
            <div className="cs-date-scroll">
                {(selectedDate ? [selectedDate] : availableDateKeys).map(key => {
                    const d = new Date(key)
                    const slots = groupedSlots[key] || []
                    const totalSessions = slots.reduce((s, slot) => s + slot.sessions.length, 0)
                    return (
                        <div
                            key={key}
                            className={`cs-date-chip ${selectedDate === key ? "cs-date-chip--active" : ""}`}
                            onClick={() => setSelectedDate(selectedDate === key ? null : key)}
                        >
                            <div className="cs-date-chip__day">
                                {d.toLocaleDateString("en-AU", { weekday: "short" })}
                            </div>
                            <div className="cs-date-chip__date">
                                {d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                            </div>
                            <div className="cs-date-chip__slots">
                                {totalSessions} session{totalSessions !== 1 ? "s" : ""}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ✅ Sessions for selected date */}
            {selectedDate && allSessions.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                        Sessions on {new Date(selectedDate).toLocaleDateString("en-AU", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric"
                        })}
                    </p>
                    <div className="slots-grid">
                        {allSessions.map((session, idx) => {
                            const isFull = (session.availableSlots ?? session.maxCapacity) === 0
                            const isActive = selectedSession?._id === session._id
                            return (
                                <div
                                    key={idx}
                                    className={`slot-card ${isActive ? "active" : ""} ${isFull ? "slot-card--full" : ""}`}
                                    onClick={() => !isFull && onSelectSession({ ...session, date: selectedDate })}
                                    style={isFull ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <div className="slot-time">🕒 {session.startTime} - {session.endTime}</div>
                                    <p className="spots">
                                        {isFull ? "Full" : `${session.availableSlots ?? session.maxCapacity} slots`}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// Redundant: local groupCoursesByCategory moved inside CourseSelection for access to categoryList

function CourseSelection({
    enrollmentType,
    setEnrollmentType,
    selectedSession,
    setSelectedSession,
    selectedCourse,
    setSelectedCourse,
    hideEnrollmentType,
    selectedCourses,
    setSelectedCourses,
    isCompanyEnroll,
}) {

    const [courses, setCourses] = useState([])
    const [activeCourseIds, setActiveCourseIds] = useState(null)
    const [slots, setSlots] = useState([])
    const [courseSlots, setCourseSlots] = useState({})
    const [collapsedCourses, setCollapsedCourses] = useState({})
    const [categoryList, setCategoryList] = useState([]) // ✅ Store categories for ordering
    const processedUrlSession = useRef(false)

    const params = new URLSearchParams(window.location.search)
    const bookingType    = params.get("type")
    const paramCourseId  = params.get("courseId")
    const paramSessionId = params.get("sessionId")

    const isCompany = enrollmentType === "company"
    const useMultiCourseFlow = isCompany && !isCompanyEnroll

    // Resolution order:
    //   1. course.__variant (the user's explicit pick from the new variant dropdown)
    //   2. URL ?type=… (legacy deep-link behaviour)
    //   3. Default (without-experience / single-license / sellingPrice)
    const getCoursePrice = (course) => {
        if (!course) return 0
        const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard")
        const v  = course.__variant || null

        if (pt === "slbl") {
            if (v === "slbl" || (v == null && bookingType === "slbl")) return course.slblPrice || 0
            return course.slSinglePrice || 0
        }
        if (pt === "experience") {
            if (v === "with-experience"    || (v == null && bookingType === "with-experience"))    return course.withExperiencePrice || 0
            if (v === "without-experience" || (v == null && bookingType === "without-experience")) return course.withoutExperiencePrice || 0
            return course.withoutExperiencePrice || course.withExperiencePrice || 0
        }
        return course.sellingPrice || 0
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories first for ordering
                const catRes = await axios.get(`${API_URL}/api/categories`)
                setCategoryList(catRes.data.filter(c => c.active !== false))

                const res = await axios.get(`${API_URL}/api/courses`)
                const fetchedCourses = res.data
                setCourses(fetchedCourses)

                // Fetch active course IDs separately — don't let it break the courses list
                try {
                    const idsRes = await axios.get(`${API_URL}/api/schedules/active-course-ids`)
                    setActiveCourseIds(idsRes.data?.length > 0 ? idsRes.data : null)
                } catch {
                    setActiveCourseIds(null) // fallback: show all courses
                }

                if (paramCourseId) {
                    const selected = fetchedCourses.find(c => c._id === paramCourseId)
                    if (selected) {
                        setSelectedCourse(selected)
                        const slotRes = await axios.get(`${API_URL}/api/schedules/course/${paramCourseId}`)
                        const fetchedSlots = slotRes.data
                        setSlots(fetchedSlots)

                        if (paramSessionId) {
                            let matched = null
                            fetchedSlots.forEach(slot => {
                                slot.sessions?.forEach(session => {
                                    if (String(session._id) === String(paramSessionId)) {
                                        matched = { ...session, date: slot.date }
                                    }
                                })
                            })
                            if (matched) {
                                // Pre-select the date only; the user must pick a timing
                                setSelectedSession({ date: matched.date })
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!useMultiCourseFlow && selectedCourse?._id && slots.length === 0) {
            axios.get(`${API_URL}/api/schedules/course/${selectedCourse._id}`)
                .then(res => setSlots(res.data))
                .catch(err => console.log(err))
        }
    }, [selectedCourse])

    // ✅ Handle paramSessionId independent of paramCourseId (works with slugs)
    useEffect(() => {
        if (paramSessionId && slots.length > 0 && !processedUrlSession.current) {
            let matched = null
            slots.forEach(slot => {
                slot.sessions?.forEach(session => {
                    if (String(session._id) === String(paramSessionId)) {
                        matched = { ...session, date: slot.date }
                    }
                })
            })
            if (matched) {
                // Pre-select the date only; the user must pick a timing
                setSelectedSession({ date: matched.date })
                processedUrlSession.current = true
            }
        }
    }, [slots, paramSessionId])

    const handleCourseChange = async (courseId, variant = null) => {
        if (!courseId) { setSelectedCourse(null); setSlots([]); return }
        const selected = courses.find(c => c._id === courseId)
        if (!selected) return
        // Persist the variant (with-experience / without-experience / sl / slbl)
        // alongside the course object so price math downstream stays consistent.
        setSelectedCourse({ ...selected, __variant: variant })
        setSelectedSession(null)
        try {
            const res = await axios.get(`${API_URL}/api/schedules/course/${courseId}`)
            setSlots(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    // ✅ groupedSlots — date-wise
    const groupedSlots = slots.reduce((acc, slot) => {
        const date = slot.date
        if (!acc[date]) acc[date] = []
        acc[date].push(slot)
        return acc
    }, {})

    const handleCompanyCourseAdd = async (courseId, variant = null) => {
        if (!courseId) return
        const selected = courses.find(c => c._id === courseId)
        if (!selected) return

        try {
            const res = await axios.get(`${API_URL}/api/schedules/course/${courseId}`)
            setCourseSlots(prev => ({ ...prev, [courseId]: res.data }))
        } catch (err) {
            console.log(err)
        }

        const uid = `${courseId}_${variant || "default"}_${Date.now()}`
        setSelectedCourses(prev => [...(prev || []), {
            course: { ...selected, __variant: variant },
            session: null,
            quantity: 1,
            uid,
        }])
    }

    const handleRemoveCourse = (uid) => {
        setSelectedCourses(prev => prev.filter(sc => sc.uid !== uid))
        setCollapsedCourses(prev => {
            const copy = { ...prev }
            delete copy[uid]
            return copy
        })
    }

    const handleQuantityChange = (uid, qty) => {
        setSelectedCourses(prev => prev.map(sc =>
            sc.uid === uid ? { ...sc, quantity: Math.max(1, Number(qty)) } : sc
        ))
    }

    const handleSessionSelect = (uid, session) => {
        const current = selectedCourses.find(sc => sc.uid === uid)
        if (current?.session?._id === session._id) {
            alert("This session is already selected!")
            return
        }

        const courseId = current?.course._id
        const alreadyTaken = selectedCourses.some(sc =>
            sc.uid !== uid &&
            sc.course._id === courseId &&
            sc.session?._id === session._id
        )

        if (alreadyTaken) {
            alert("This session is already selected for another entry of the same course!")
            return
        }

        setSelectedCourses(prev => prev.map(sc =>
            sc.uid === uid ? { ...sc, session } : sc
        ))
        setCollapsedCourses(prev => ({ ...prev, [uid]: true }))
    }

    const companyTotal = selectedCourses?.reduce((sum, sc) => {
        return sum + (getCoursePrice(sc.course) * sc.quantity)
    }, 0) || 0

    const getCompanyGroupedSlots = (courseId) => {
        const raw = courseSlots[courseId] || []
        return raw.reduce((acc, slot) => {
            const date = slot.date
            if (!acc[date]) acc[date] = []
            acc[date].push(slot)
            return acc
        }, {})
    }

    const filteredCourses = courses

    const groupCoursesByCategory = (courses, categories) => {
        const grouped = {}
        const usedCourseIds = new Set()
        
        // 1. Process categories from the ordered list (respects Admin reorder)
        if (categories && categories.length > 0) {
            categories.forEach(cat => {
                const catName = cat.name
                const catCourses = courses.filter(c => (c.category?.name || c.category) === catName)
                if (catCourses.length > 0) {
                    // Sort courses within category by sortOrder
                    grouped[catName] = catCourses.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    catCourses.forEach(c => usedCourseIds.add(c._id))
                }
            })
        }
        
        // 2. Process any remaining courses (categories not in list, or no category)
        const remainingCourses = courses.filter(c => !usedCourseIds.has(c._id))
        if (remainingCourses.length > 0) {
            remainingCourses.forEach(course => {
                const cat = course.category?.name || course.category || "Other"
                if (!grouped[cat]) grouped[cat] = []
                grouped[cat].push(course)
            })
            // Sort courses in these remaining groups
            Object.keys(grouped).forEach(cat => {
                if (!categories.some(c => c.name === cat)) {
                    grouped[cat].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                }
            })
        }
        
        return grouped
    }

    const groupedCourses = groupCoursesByCategory(filteredCourses, categoryList)

    // Helper for cart / order-summary rows: append a friendly variant suffix
    // ("With Experience", "Both Licenses", …) to the course title so users can
    // distinguish two cart entries of the same course at a glance.
    const titleWithVariant = (course) => {
        if (!course?.__variant) return course?.title || ""
        const v = getCourseVariants(course).find(x => x.variant === course.__variant)
        return v?.label ? `${course.title} (${v.label})` : course.title
    }

    return (
        <>
            {!hideEnrollmentType && (
                <div className="form-group">
                    <label className="form-label">
                        Enrolment Type <span className="form-required">*</span>
                    </label>
                    <div className="enrol-type-grid">
                        <div
                            className={`enrol-type-card ${enrollmentType === "individual" ? "enrol-type-card--active" : ""}`}
                            onClick={() => setEnrollmentType("individual")}
                        >
                            <span className="enrol-type-icon">👤</span>
                            <div>
                                <div className="enrol-type-label">Individual</div>
                                <div className="enrol-type-sub">Personal enrolment</div>
                            </div>
                        </div>
                        <div
                            className={`enrol-type-card ${enrollmentType === "company" ? "enrol-type-card--active" : ""}`}
                            onClick={() => setEnrollmentType("company")}
                        >
                            <span className="enrol-type-icon">🏢</span>
                            <div>
                                <div className="enrol-type-label">Company</div>
                                <div className="enrol-type-sub">Group / corporate booking</div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="type" value={enrollmentType} />
                </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* ✅ SIMPLE FLOW — Individual OR Hero-bar Company    */}
            {/* ─────────────────────────────────────────────────── */}
            {!useMultiCourseFlow && (
                <>
                    <div className="form-group">
                        <label>{isCompany ? "Add Courses" : "Select Course"}</label>
                        <CourseDropdown
                            groupedCourses={groupedCourses}
                            value={selectedCourse?._id ? { courseId: selectedCourse._id, variant: selectedCourse.__variant || null } : null}
                            onChange={handleCourseChange}
                            placeholder="Select Course"
                            getCoursePrice={getCoursePrice}
                            enrollmentType={enrollmentType}
                        />
                    </div>

                    {selectedCourse && Object.keys(groupedSlots).length > 0 && (
                        <>
                            <p className="slot-title" style={{ marginBottom: 8 }}>
                                Select date for <strong>{selectedCourse.title}</strong>
                            </p>
                            <CalendarDatePicker
                                groupedSlots={groupedSlots}
                                selectedSession={selectedSession}
                                onSelectSession={setSelectedSession}
                            />
                        </>
                    )}
                </>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* ✅ MULTI-COURSE FLOW — Dashboard link Company only */}
            {/* ─────────────────────────────────────────────────── */}
            {useMultiCourseFlow && (
                <>
                    {selectedCourses?.length > 0 && (
                        <div className="company-order-summary">
                            <div className="company-order-title">🧾 Order Summary</div>
                            {selectedCourses.map(sc => (
                                <div key={sc.uid} className="company-order-row">
                                    <span className="company-order-name">{titleWithVariant(sc.course)}</span>
                                    <span className="company-order-detail">
                                        {sc.session
                                            ? `${new Date(sc.session.date).toLocaleDateString("en-AU", {
                                                day: "numeric", month: "short"
                                            })} · ${sc.session.startTime} - ${sc.session.endTime}`
                                            : <span className="company-order-nodate">⚠ Date not selected</span>
                                        }
                                    </span>
                                    <span className="company-order-price">
                                        ${getCoursePrice(sc.course)} × {sc.quantity} = ${getCoursePrice(sc.course) * sc.quantity}
                                    </span>
                                </div>
                            ))}
                            <div className="company-order-total">
                                Total: <strong>${companyTotal}</strong>
                            </div>
                        </div>
                    )}

                    {/* ✅ CHANGED: Always-visible dropdown → Button-triggered dropdown */}
                    <AddCourseButton
                        groupedCourses={groupedCourses}
                        onAdd={handleCompanyCourseAdd}
                        getCoursePrice={getCoursePrice}
                        enrollmentType={enrollmentType}
                    />

                    {selectedCourses?.map(sc => (
                        <div key={sc.uid} className="company-cart-item">
                            <div className="company-cart-row">
                                <div className="company-cart-info">
                                    <span className="company-cart-name">{titleWithVariant(sc.course)}</span>
                                    <span className="company-cart-price">${getCoursePrice(sc.course)} per person</span>
                                </div>
                                <div className="company-cart-controls">
                                    <label style={{ fontSize: "12px", color: "#888" }}>Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={sc.quantity}
                                        className="company-qty-input"
                                        onChange={(e) => handleQuantityChange(sc.uid, e.target.value)}
                                    />
                                    <span className="company-cart-subtotal">
                                        = ${getCoursePrice(sc.course) * sc.quantity}
                                    </span>
                                    <button
                                        className="company-cart-remove"
                                        onClick={() => handleRemoveCourse(sc.uid)}
                                    >✕</button>
                                </div>
                            </div>

                            {collapsedCourses[sc.uid] ? (
                                <div
                                    className="company-slot-reopen"
                                    onClick={() => setCollapsedCourses(prev => ({
                                        ...prev, [sc.uid]: false
                                    }))}
                                >
                                    ✓ {new Date(sc.session.date).toLocaleDateString("en-AU", {
                                        day: "numeric", month: "short"
                                    })} · {sc.session.startTime} - {sc.session.endTime}
                                    <span>Change date</span>
                                </div>
                            ) : (
                                <div className="company-slot-section">
                                    <p className="company-slot-label">
                                        Select date for <strong>{titleWithVariant(sc.course)}</strong>
                                    </p>
                                    <CalendarDatePicker
                                        groupedSlots={getCompanyGroupedSlots(sc.course._id)}
                                        selectedSession={sc.session}
                                        onSelectSession={(session) => handleSessionSelect(sc.uid, session)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </>
    )
}

export default CourseSelection