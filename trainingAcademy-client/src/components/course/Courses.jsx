import "../../styles/Courses.css";
import CreateCourseModal from "../course/CreateCourseModal";
import { useState, useEffect } from "react";
import axios from "axios";
import ScheduleModal from "../ScheduleModal";
import { useLocation } from "react-router-dom"
import ManageCategories from "../course/ManageCategories";
import ReorderCourseModal from "./ReorderCourseModal"; 

function Courses() {

    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editCourse, setEditCourse] = useState(null);
    const [search, setSearch] = useState("");
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showManageCategories, setShowManageCategories] = useState(false);
    const [showReorderCourses, setShowReorderCourses] = useState(false); // ← NEW
    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const pubsearch = query.get("search")
    const categoryFromURL = query.get("category")

    useEffect(() => {
        fetchCourses();
    }, []);
 
    const fetchCourses = async () => {
        try {
            const res = await axios.get("https://api.octosofttechnologies.in
/api/courses");
            setCourses(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
  if (categoryFromURL) {
    const el = document.getElementById(categoryFromURL)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }
}, [categoryFromURL])

    const pubfilteredCourses = courses.filter(c =>
  c.title.toLowerCase().includes(search?.toLowerCase() || "")
)

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this course?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`https://api.octosofttechnologies.in
/api/courses/${id}`);
            fetchCourses();
        } catch (err) {
            console.log(err);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(search.toLowerCase()) ||
        course.category?.toLowerCase().includes(search.toLowerCase())
    );

    const categories = [...new Set(filteredCourses.map(course => course.category))];

    return (
        <section>

            {/* ===== HEADER ===== */}
            <div className="courses-container">
                <div>
                    <h1>Course Management</h1>
                    <p>Create and manage courses with detailed information</p>
                </div>
                <div className="course-management-div">
                   
                    <p onClick={() => setShowManageCategories(true)}>
                        <i className="fa-solid fa-tag"></i>Manage Categories
                    </p>
                    <p onClick={() => setShowReorderCourses(true)}> {/* ← NEW onClick */}
                        ☰ Reorder Courses
                    </p>
                    <p onClick={() => setShowModal(true)}>
                        + Create New Course
                    </p>
                </div>
            </div>

            {/* ===== SEARCH & FILTER ===== */}
            <div className="courses-search-wrapper">
                <h3>Search &amp; Filter</h3>
                <p>Find courses by name or course code</p>
                <div className="courses-search-row">
                    <div className="courses-search">
                        <input
                            type="text"
                            placeholder="Search courses by name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="status-select">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <button className="search-btn">
                        <i className="fa-solid fa-magnifying-glass"></i> Search
                    </button>
                </div>
            </div>

            {/* ===== COURSE LIST ===== */}
            <div className="courses-div">
                {categories.map((cat, index) => {
                    const categoryCourses = filteredCourses.filter(
                        course => course.category === cat
                    );

                    return (
                        <div key={index}>
                            <p className="courses-heading" id={cat}>
                                {cat}
                            </p>

                            <div className="courses-list">
                                {categoryCourses.map((course) => (
                                    <div key={course._id} className="course-details">

                                        {/* LEFT CONTENT */}
                                        <div className="course-left">
                                            <div className="course-top-row">
                                                <span className="drag-handle">⠿</span>
                                                <p className="course-catagory-btn">
                                                    {course.courseCode}
                                                </p>
                                                {course.combo && (
                                                    <p className={`combo-badge ${course.combo === "Premium" ? "premium-badge" : "standard-badge"}`}>
                                                        {course.combo}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="course-title">{course.title}</p>

                                            <div className="course-info">
                                                <p>{course.category}</p>
                                                <span>•</span>
                                                <p>{course.duration}</p>
                                                <span>•</span>
                                                {course.experienceBasedBooking ? (
                                                    <>
                                                        <p className="discount-price" style={{ color: "green" }}>
                                                            ${course.withExperiencePrice}
                                                            <span style={{ fontSize: "11px", color: "#888" }}>(w/ exp)</span>
                                                        </p>
                                                        <p className="discount-price" style={{ color: "red" }}>
                                                            ${course.withoutExperiencePrice}
                                                            <span style={{ fontSize: "11px", color: "#888" }}>(w/o exp)</span>
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="original-price">${course.originalPrice}</p>
                                                        <p className="discount-price">${course.sellingPrice}</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="course-bottom">
                                                <p className="enrolled-students">
                                                    {course.studentsEnrolled} students enrolled
                                                </p>
                                            </div>
                                        </div>

                                        {/* RIGHT: STATUS + ACTIONS */}
                                        <div className="course-status">
                                            <span className="status-badge">active</span>

                                            <div className="course-actions">
                                                <button
                                                    className="calendar-btn"
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setOpenSchedule(true);
                                                    }}
                                                >
                                                   <i className="fa-regular fa-calendar"></i>
                                                </button>

                                                <button
                                                    className="edit-btn"
                                                    onClick={() => setEditCourse(course)}
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(course._id)}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===== MODALS ===== */}
            {(showModal || editCourse) && (
                <CreateCourseModal
                    close={() => {
                        setShowModal(false);
                        setEditCourse(null);
                    }}
                    categories={categories}
                    refreshCourses={fetchCourses}
                    editCourse={editCourse}
                />
            )}

            {openSchedule && (
                <ScheduleModal
                    course={selectedCourse}
                    close={() => setOpenSchedule(false)}
                />
            )}

            <ManageCategories
                isOpen={showManageCategories}
                onClose={() => setShowManageCategories(false)}
            />

            {/* ← NEW: Reorder Courses Modal */}
            <ReorderCourseModal
                isOpen={showReorderCourses}
                onClose={() => setShowReorderCourses(false)}
                courses={courses}
                refreshCourses={fetchCourses}
            />

        </section>
    );
}

export default Courses;