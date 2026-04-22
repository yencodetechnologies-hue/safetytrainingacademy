import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/CourseCard.css"

function getBookingType(course) {
    if (course?.experienceBasedBooking)   return "experience"
    if (course?.slblPrice)                return "slbl"
    return "standard"
}

function getBookingOptions(course) {
    const type = getBookingType(course)

    if (type === "experience") {
        return [
            {
                id: "with-experience",
                label: "With Experience",
                price: course.withExperiencePrice,
                originalPrice: course.withExperienceOriginal,
                dur: course.duration || "1 day",
                description: "Already have experience in this field",
                isVoc: false,
            },
            {
                id: "without-experience",
                label: "Without Experience",
                price: course.withoutExperiencePrice,
                originalPrice: course.withoutExperienceOriginal,
                dur: course.duration || "1 day",
                description: "No prior experience needed",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC / RPL",
                price: course.sellingPrice,
                originalPrice: course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    if (type === "slbl") {
        return [
            {
                id: "slbl",
                label: "SL + BL",
                price: course.slblPrice,
                originalPrice: course.slblStrikePrice,
                dur: course.duration || "1 day",
                description: "Slewing & non-slewing combined",
                isVoc: false,
            },
            {
                id: "sl",
                label: "SL Only",
                price: course.sellingPrice,
                originalPrice: course.originalPrice,
                dur: course.duration || "1 day",
                description: "Slewing (SL) licence only",
                isVoc: false,
            },
            {
                id: "bl",
                label: "BL Only",
                price: course.sellingPrice,
                originalPrice: course.originalPrice,
                dur: course.duration || "1 day",
                description: "Non-slewing (BL) licence only",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC / RPL",
                price: course.sellingPrice,
                originalPrice: course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    return [
        {
            id: "standard",
            label: "Standard",
            price: course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: course.duration || "1 day",
            description: "Full course enrollment",
            isVoc: false,
        },
        {
            id: "voc",
            label: "VOC / RPL",
            price: course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: "Half day",
            description: "Recognition of prior learning",
            isVoc: true,
        },
    ]
}

// ── Booking Modal — box style options ─────────────────────────────────────────
function BookingModal({ course, onClose }) {
    const navigate = useNavigate()
    const options  = getBookingOptions(course)
    const [selected, setSelected] = useState(null)
    const [shake,    setShake]    = useState(false)
    const [showErr,  setShowErr]  = useState(false)

    const selectedOption = options.find(o => o.id === selected)

    const handleConfirm = () => {
        if (!selected) {
            setShowErr(true)
            setShake(true)
            setTimeout(() => setShake(false), 400)
            return
        }
        const base = `/book-now?courseId=${course._id}`
        const routes = {
            "with-experience":    `${base}&type=with-experience`,
            "without-experience": `${base}&type=without-experience`,
            "slbl":               `${base}&type=slbl`,
            "sl":                 `${base}&type=sl`,
            "bl":                 `${base}&type=bl`,
            "voc":                `${base}&type=voc`,
            "standard":           base,
        }
        onClose()
        navigate(routes[selected] || base)
    }

    return (
        <div className="cc-modal-overlay" onClick={onClose}>
            <div className="cc-modal" onClick={e => e.stopPropagation()}>

                <div className="cc-modal-header">
                    <div>
                        <div className="cc-modal-title">{course.title}</div>
                        <div className="cc-modal-sub">Select your booking option</div>
                    </div>
                    <button className="cc-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* RADIO STYLE OPTIONS */}
                <div className="cc-modal-options">
                    {options.map(opt => {
                        const saving = opt.originalPrice && opt.originalPrice > opt.price
                            ? opt.originalPrice - opt.price : null
                        return (
                            <div
                                key={opt.id}
                                className={`cc-modal-option ${selected === opt.id ? "cc-modal-option--active" : ""} ${showErr && !selected ? "cc-modal-option--error" : ""}`}
                                onClick={() => {
                                    setSelected(opt.id)
                                    setShowErr(false)
                                    setShake(false)
                                }}
                            >
                                <div className="cc-mo-left">
                                    <div className="cc-mo-radio">
                                        {selected === opt.id && <div className="cc-mo-radio-dot" />}
                                    </div>
                                    <div>
                                        <div className="cc-mo-label">{opt.label}</div>
                                        <div className="cc-mo-desc">{opt.description}</div>
                                    </div>
                                </div>
                                <div className="cc-mo-right">
                                    <div className="cc-mo-price">${opt.price}</div>
                                    {opt.originalPrice && opt.originalPrice > opt.price && (
                                        <div className="cc-mo-was">${opt.originalPrice}</div>
                                    )}
                                    {saving && (
                                        <div className="cc-mo-save">Save ${saving}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {showErr && !selected && (
                        <div className="cc-modal-err">
                            <i className="fa-solid fa-triangle-exclamation" />
                            Please select an option to continue
                        </div>
                    )}
                </div>

                <div className="cc-modal-footer">
                    <div className="cc-modal-total">
                        <span>Total</span>
                        <strong>{selectedOption ? `$${selectedOption.price}` : "—"}</strong>
                    </div>
                    <button className="cc-modal-confirm" onClick={handleConfirm}>
                        Book Now {selectedOption ? `— ${selectedOption.label}` : ""}
                        <i className="fa-regular fa-circle-right" />
                    </button>
                    <button className="cc-modal-cancel" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    )
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course }) {
    const navigate    = useNavigate()
    const [showModal, setShowModal] = useState(false)

    const options       = getBookingOptions(course)
    const sellingPrice  = course?.sellingPrice  || 0
    const originalPrice = course?.originalPrice || 0
    const savings       = originalPrice > sellingPrice ? originalPrice - sellingPrice : 0

    const displayPrice = course?.slblPrice
        ? course.slblPrice
        : course?.withExperiencePrice || sellingPrice

    const displayOriginal = course?.slblStrikePrice
        ? course.slblStrikePrice
        : course?.withExperienceOriginal || originalPrice

    return (
        <>
            <div className="course-card">

                {/* THUMB */}
                <div
                    className="course-thumb"
                    onClick={() => navigate(`/course/${course.slug}-${course._id}`)}
                >
                    {course.image ? (
                        <img src={course.image} alt={course.title} className="course-thumb-img" />
                    ) : (
                        <div className="course-thumb-placeholder">📋</div>
                    )}
                    <div className="course-thumb-overlay">View Details</div>
                    {course.duration && (
                        <span className="course-dur-badge">{course.duration}</span>
                    )}
                    <span className="course-cat-badge">{course.category}</span>
                </div>

                {/* BODY */}
                <div className="course-body">

                    {/* Price */}
                    <div className="course-price-row">
                        <div className="course-exp-prices">
                            <span className="course-price-main">${displayPrice}</span>
                            {displayOriginal && displayOriginal > displayPrice && (
                                <span className="course-price-old">${displayOriginal}</span>
                            )}
                            {savings > 0 && (
                                <span className="course-save-badge">Save ${savings}</span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        className="course-title"
                        onClick={() => navigate(`/course/${course.slug}-${course._id}`)}
                    >
                        {course.title}
                    </h3>

                    {/* Info */}
                    <div className="course-info-row">
                        <span className="course-info-item">
                            <i className="fa-regular fa-calendar-days" />
                            {course.duration}
                        </span>
                        <span className="course-info-item">
                            <i className="fa-solid fa-location-dot" />
                            {course.location}
                        </span>
                        <span className="course-info-item">
                            <i className="fa-solid fa-chalkboard-user" />
                            {course.deliveryMethod}
                        </span>
                    </div>

                    {/* ── DISPLAY OPTIONS — card-ல காட்டு, VOC மட்டும் direct navigate ── */}
                    <div className="cc-card-opts">
                        <div className="cc-card-opts-lbl">Select option</div>
                        <div className="cc-card-opt-boxes">
                            {options.map((opt, i) => (
                                <div
                                    key={i}
                                    className={`cc-card-opt-box ${opt.isVoc ? "cc-card-opt-box--voc" : "cc-card-opt-box--display"}`}
                                    onClick={opt.isVoc
                                        ? () => navigate(`/voc`) //`/book-now?courseId=${course._id}&type=voc`
                                        : undefined
                                    }
                                    title={opt.isVoc ? "Click to book VOC/RPL" : ""}
                                >
                                    <div className="cc-cob-label">{opt.label}</div>
                                    <div className="cc-cob-price">${opt.price}</div>
                                    <div className="cc-cob-dur">{opt.dur}</div>
                                    {opt.originalPrice && opt.originalPrice > opt.price && (
                                        <div className="cc-cob-was">${opt.originalPrice}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Book Now */}
                    <button
                        className="course-btn course-btn--primary"
                        onClick={() => setShowModal(true)}
                    >
                        Book Now
                        <i className="fa-regular fa-circle-right" />
                    </button>

                    {/* View Details */}
                    <button
                        className="course-btn course-btn--outline"
                        onClick={() => navigate(`/course/${course.slug}-${course._id}`)}
                    >
                        View Details
                        <i className="fa-solid fa-circle-info" />
                    </button>

                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <BookingModal
                    course={course}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    )
}

export default CourseCard