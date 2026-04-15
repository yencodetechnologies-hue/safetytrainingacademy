import { useState } from "react"
import "./VocStep2.css"

const PRICE = 150

const AVAILABLE_COURSES = [
    "Conduct Telescopic materials handler operations",
    "Operate an order picking forklift truck",
    "Operate a counterbalance forklift",
    "Operate a reach forklift",
    "Conduct slinging and rigging",
    "Dogging",
    "Basic rigging",
    "Intermediate rigging",
    "Operate elevated work platform",
]

// Generate dates from today for next 60 days (weekdays only)
function generateDates() {
    const dates = []
    const now = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (let i = 0; i < 90; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() + i)
        const day = d.getDay()
        if (day !== 0) { // exclude Sunday
            dates.push(`${days[day]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`)
        }
    }
    return dates
}

const DATE_OPTIONS = generateDates()

function VocStep2({ courses, setCourses, onNext, onBack }) {

    const [selected, setSelected] = useState("")
    const [openDate, setOpenDate] = useState(null) // index of open date dropdown

    const total = courses.length * PRICE

    const addCourse = () => {
        if (!selected) return
        setCourses(prev => [...prev, { name: selected, date: "" }])
        setSelected("")
    }

    const removeCourse = (i) => {
        setCourses(prev => prev.filter((_, idx) => idx !== i))
    }

    const setDate = (i, date) => {
        setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, date } : c))
        setOpenDate(null)
    }

    const handleNext = () => {
        if (courses.length === 0) {
            alert("Please add at least one course.")
            return
        }
        for (const c of courses) {
            if (!c.date) {
                alert(`Please select a date for: ${c.name}`)
                return
            }
        }
        onNext()
    }

    return (
        <div className="v2-wrap">

            {/* Dark header */}
            <div className="v2-header">
                <h2 className="v2-header-title">Course Selection</h2>
                <p className="v2-header-sub">
                    Select the courses you wish to renew — <span className="v2-price-highlight">${PRICE} per course</span>
                </p>
            </div>

            {/* Body */}
            <div className="v2-body">

                {/* Course picker */}
                <label className="v2-label">CHOOSE A COURSE</label>
                <div className="v2-select-wrap">
                    <select
                        className="v2-select"
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                    >
                        <option value="">Select a course to add...</option>
                        {AVAILABLE_COURSES.map(c => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                    <span className="v2-chevron">▾</span>
                </div>

                <button className="v2-add-btn" onClick={addCourse}>
                    + &nbsp; Add Course
                </button>

                {/* Course list */}
                {courses.length === 0 ? (
                    <div className="v2-empty-box">
                        <span className="v2-empty-icon">📅</span>
                        <p className="v2-empty-text">No courses selected yet</p>
                        <p className="v2-empty-hint">Add courses from the dropdown above</p>
                    </div>
                ) : (
                    <div className="v2-course-list">
                        {courses.map((c, i) => (
                            <div key={i} className="v2-course-card">
                                <div className="v2-course-top">
                                    <div className="v2-course-info">
                                        <span className="v2-course-check">✔</span>
                                        <div>
                                            <p className="v2-course-name">{c.name}</p>
                                            <p className="v2-course-price">${PRICE}.00</p>
                                        </div>
                                    </div>
                                    <button className="v2-delete-btn" onClick={() => removeCourse(i)}>🗑</button>
                                </div>

                                {/* Date picker */}
                                <div className="v2-date-section">
                                    <label className="v2-date-label">SELECT COURSE DATE *</label>
                                    <div className="v2-date-select-wrap">
                                        <div
                                            className="v2-date-trigger"
                                            onClick={() => setOpenDate(openDate === i ? null : i)}
                                        >
                                            <span className={c.date ? "v2-date-value" : "v2-date-placeholder"}>
                                                {c.date || "Choose an available date..."}
                                            </span>
                                            <span className="v2-chevron">▾</span>
                                        </div>

                                        {openDate === i && (
                                            <div className="v2-date-dropdown">
                                                {DATE_OPTIONS.map(d => (
                                                    <div
                                                        key={d}
                                                        className={`v2-date-option ${c.date === d ? "v2-date-selected" : ""}`}
                                                        onClick={() => setDate(i, d)}
                                                    >
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {!c.date && (
                                        <p className="v2-date-warning">⚠ Please select a date to continue</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="v2-footer">
                    <div className="v2-total">
                        <p className="v2-total-label">TOTAL ({courses.length} COURSE{courses.length !== 1 ? "S" : ""})</p>
                        <p className="v2-total-amount">${total.toFixed(2)}</p>
                    </div>
                    <div className="v2-footer-btns">
                        <button className="v2-back-btn" onClick={onBack}>‹ &nbsp; BACK</button>
                        <button className="v2-next-btn" onClick={handleNext}>
                            CONTINUE TO PAYMENT &nbsp; ›
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default VocStep2