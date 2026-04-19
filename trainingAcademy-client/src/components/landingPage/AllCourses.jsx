import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PublicNavbar from "../PublicNavbar";
import Footer from "./Footer";
import CourseCard from "../course/CourseCard";
import "../../styles/AllCourses.css";
import { API_URL } from "../../data/service";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // URL-ல இருந்து category param எடு
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category");

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

  // Category filter
  const filtered = selectedCategory
    ? courses.filter(c => c.category === selectedCategory)
    : courses;

  return (
    <section>
      <PublicNavbar />
      <div className="all-courses-wrapper">
        <div className="all-courses-header">
          <h2>{selectedCategory ? selectedCategory : "All Courses"}</h2>
          <p>{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        {loading ? (
          <div className="all-courses-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="course-card-skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-courses">No courses found.</div>
        ) : (
          <div className="all-courses-grid">
            {filtered.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}

export default AllCourses;