import { useEffect, useState } from "react"
import axios from "axios"
import CourseCard from "./CourseCard"
import "../../styles/CoursesSection.css"
import { div, i } from "framer-motion/client"
import { API_URL } from "../../data/service"
function CoursesSection() {
    const [courses, setCourses] = useState([])

  const [expanded, setExpanded] = useState({})

    useEffect(() => {

        axios.get(`https://api.octosofttechnologies.in/api/courses`) 
            .then(res => setCourses(res.data))

    }, [])
    const categories = [...new Set(courses.map(c => c.category))]
      const toggleShow = (category) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }
    return (
        <div className="courses-section-container">
            <section className="courses-section">
            {categories.map((category) => {

          const categoryCourses = courses.filter(
            course => course.category === category
          )

          const visibleCourses = expanded[category]
            ? categoryCourses
            : categoryCourses.slice(0,4)

          return (

            <div key={category} className="category-block">

              <h2 className="category-title">
                {category}
              </h2>

              <div className="courses-grid">

                {visibleCourses.map(course => (
                  <CourseCard key={course._id} course={course}/>
                ))}

              </div>

              {categoryCourses.length > 4 && (

                <div className="show-more-wrapper">

                  <button
                    className="show-more-btn"
                    onClick={() => toggleShow(category)}
                  >

                    {expanded[category]
                      ? "Show Less"
                      : `See More ${category} →`}

                  </button>

                </div>

              )}

            </div>

          )

        })}
        </section>
        </div>
    );
}

export default CoursesSection;