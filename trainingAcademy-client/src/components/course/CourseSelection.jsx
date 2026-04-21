import { useEffect, useState } from "react"
import axios from "axios"
import "../../styles/CourseSelection.css"
import { API_URL } from "../../data/service"

function CourseSelection({
    enrollmentType,
    setEnrollmentType,
    selectedSession,
    setSelectedSession,
    selectedCourse,
    setSelectedCourse,
    hideEnrollmentType
}) {

    const [courses, setCourses] = useState([])
    const [slots, setSlots] = useState([])
    const [visibleDates, setVisibleDates] = useState(3)
    const [visibleSessions, setVisibleSessions] = useState({})

    // ✅ type query param எடுக்கிறோம்
    const params = new URLSearchParams(window.location.search)
    const bookingType = params.get("type")

    // ✅ price display function
    const getCoursePrice = (course) => {
        if (course.experienceBasedBooking) {
            if (bookingType === "with-experience") return course.withExperiencePrice
            if (bookingType === "without-experience") return course.withoutExperiencePrice
        }
        return course.sellingPrice
    }

    const getVisibleSessions = (date) => visibleSessions[date] || 3

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`https://api.octosofttechnologies.in/api/courses`)
                const fetchedCourses = res.data
                setCourses(fetchedCourses)

                const params = new URLSearchParams(window.location.search)
                const courseId = params.get("courseId")

                if (courseId) {
                    const selected = fetchedCourses.find(c => c._id === courseId)
                    if (selected) {
                        setSelectedCourse(selected)

                        const slotRes = await axios.get(
                            `https://api.octosofttechnologies.in/api/schedules/course/${courseId}`
                        )
                        setSlots(slotRes.data)
                    }
                }

            } catch (err) {
                console.log(err)
            }
        }
        fetchCourses()
    }, [])

    const groupedSlots = slots.reduce((acc, slot) => {
        const date = slot.date
        if (!acc[date]) acc[date] = []
        acc[date].push(slot)
        return acc
    }, {})

    const handleCourseChange = async (e) => {
        const courseId = e.target.value
        const selected = courses.find(c => c._id === courseId)
        setSelectedCourse(selected)

        try {
            const res = await axios.get(
                `https://api.octosofttechnologies.in/api/schedules/course/${courseId}`
            )
            setSlots(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (selectedCourse?._id && slots.length === 0) {
            axios.get(
                `https://api.octosofttechnologies.in/api/schedules/course/${selectedCourse._id}`
            )
                .then(res => setSlots(res.data))
                .catch(err => console.log(err))
        }
    }, [selectedCourse])
    return (

        <>

            {/* Enrollment Type */}
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

                    {/* Hidden inputs for form compatibility */}
                    <input type="hidden" name="type" value={enrollmentType} />



                </div>)}

            {/* Course Select */}
            <div className="form-group">

                <label>
                    {enrollmentType === "individual"
                        ? "Select Course"
                        : "Add Courses"}
                </label>

                <select
                    className="course-select"
                    onChange={handleCourseChange}
                    value={selectedCourse?._id || ""}
                >

                    <option value="">Select Course</option>

                    {courses.map(course => (
                        <option key={course._id} value={course._id}>
                            {/* ✅ getCoursePrice use பண்றோம் */}
                            {course.courseCode} - {course.title} - ${getCoursePrice(course)}
                        </option>
                    ))}

                </select>

            </div>

            {/* Slots */}
            <h3 className="slot-title">Select a date</h3>

            <div className="slots">

                {Object.entries(groupedSlots)
                    .slice(0, visibleDates)
                    .map(([date, slots]) => (

                        <div className="date-section" key={date}>

                            <h3 className="slot-date-title">
                                {new Date(date).toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                })}
                            </h3>

                            <div className="slots-grid">

                                {slots.map(slot =>
                                    slot.sessions
                                        .slice(0, getVisibleSessions(date))
                                        .map((session, index) => (

                                            <div
                                                key={index}
                                                className={`slot-card ${selectedSession?._id === session._id ? "active" : ""}`} onClick={() => {
                                                    setSelectedSession({
                                                        ...session,
                                                        date: slot.date
                                                    });
                                                }}
                                            >

                                                <div className="slot-time">
                                                    🕒 {session.startTime} - {session.endTime}
                                                </div>

                                                <p className="spots">
                                                    {session.maxCapacity} slots
                                                </p>

                                            </div>

                                        ))
                                )}

                            </div>

                            {slots[0]?.sessions.length > 3 && (
                                <button
                                    className="show-more-btn-cs"
                                    onClick={() => {
                                        setVisibleSessions(prev => ({
                                            ...prev,
                                            [date]: getVisibleSessions(date) >= slots[0].sessions.length
                                                ? 3
                                                : getVisibleSessions(date) + 3
                                        }))
                                    }}
                                >
                                    {getVisibleSessions(date) >= slots[0].sessions.length
                                        ? "Show Less "
                                        : "Show More "}
                                </button>
                            )}

                        </div>

                    ))}

            </div>

            {Object.keys(groupedSlots).length > 3 && (
                <button
                    className="show-more-btn-cs"
                    onClick={() => {
                        setVisibleDates(prev =>
                            prev >= Object.keys(groupedSlots).length
                                ? 3
                                : prev + 3
                        )
                    }}
                >
                    {visibleDates >= Object.keys(groupedSlots).length
                        ? "Show Less "
                        : "Show More "}
                </button>
            )}

        </>

    )

}

export default CourseSelection