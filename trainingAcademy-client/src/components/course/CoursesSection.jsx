// import { useEffect, useState } from "react"
// import axios from "axios"
// import CourseCard from "./CourseCard"
// import "../../styles/CoursesSection.css"
// import { div, i } from "framer-motion/client"
// import { API_URL } from "../../data/service"
// function CoursesSection() {
//     const [courses, setCourses] = useState([])

//   const [expanded, setExpanded] = useState({})

//     useEffect(() => {

//         axios.get(`https://api.octosofttechnologies.in/api/courses`) 
//             .then(res => setCourses(res.data))

//     }, [])
//     const categories = [...new Set(courses.map(c => c.category))]
//       const toggleShow = (category) => {
//     setExpanded(prev => ({
//       ...prev,
//       [category]: !prev[category]
//     }))
//   }
//     return (
//         <div className="courses-section-container">
//             <section className="courses-section">
//             {categories.map((category) => {

//           const categoryCourses = courses.filter(
//             course => course.category === category
//           )

//           const visibleCourses = expanded[category]
//             ? categoryCourses
//             : categoryCourses.slice(0,4)

//           return (

//             <div key={category} className="category-block">

//               <h2 className="category-title">
//                 {category}
//               </h2>

//               <div className="courses-grid">

//                 {visibleCourses.map(course => (
//                   <CourseCard key={course._id} course={course}/>
//                 ))}

//               </div>

//               {categoryCourses.length > 4 && (

//                 <div className="show-more-wrapper">

//                   <button
//                     className="show-more-btn"
//                     onClick={() => toggleShow(category)}
//                   >

//                     {expanded[category]
//                       ? "Show Less"
//                       : `See More ${category} →`}

//                   </button>

//                 </div>

//               )}

//             </div>

//           )

//         })}
//         </section>
//         </div>
//     );
// }

// export default CoursesSection;
import { useEffect, useState } from "react"
import axios from "axios"
import CourseCard from "./CourseCard"
import "../../styles/CoursesSection.css"
import { API_URL } from "../../data/service"

function CoursesSection() {
    const [courses, setCourses] = useState([])
    const [expanded, setExpanded] = useState({})
    const [activeTab, setActiveTab] = useState(null)

    useEffect(() => {
        axios.get(`https://api.octosofttechnologies.in/api/courses`)
            .then(res => {
                setCourses(res.data)
                const firstCat = [...new Set(res.data.map(c => c.category))][0]
                setActiveTab(firstCat || null)
            })
    }, [])

    const categories = [...new Set(courses.map(c => c.category))]

    const toggleShow = (category) => {
        setExpanded(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    const categoryCourses = courses.filter(c => c.category === activeTab)
    const visibleCourses = expanded[activeTab]
        ? categoryCourses
        : categoryCourses.slice(0, 8)

    return (
        <div className="cs-wrap">
            <section className="cs-section">

                {/* HEADER */}
                <div className="cs-header">
                    <div className="cs-label">All courses</div>
                    <div className="cs-title">Browse &amp; Book</div>
                    <div className="cs-sub">
                        Nationally recognised training. Certificate issued same day. Same-week sessions available.
                    </div>
                </div>

                {/* TAB NAV */}
                <div className="cs-tabs-wrapper">
                    <div className="cs-tab-nav">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cs-tab-btn ${activeTab === cat ? "cs-tab-btn--active" : ""}`}
                                onClick={() => {
                                    setActiveTab(cat)
                                    setExpanded({})
                                }}
                            >
                                {cat}
                                <span className="cs-tab-count">
                                    {courses.filter(c => c.category === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* COURSE GRID */}
                    <div className="cs-panels-wrap">
                        {activeTab && (
                            <div className="cs-grid">
                                {visibleCourses.map(course => (
                                    <CourseCard key={course._id} course={course} />
                                ))}

                                {/* More card */}
                                
                            </div>
                        )}

                        {/* Show more / less */}
                        {categoryCourses.length > 8 && (
                            <div className="cs-show-more-wrap">
                                <button
                                    className="cs-show-more-btn"
                                    onClick={() => toggleShow(activeTab)}
                                >
                                    {expanded[activeTab]
                                        ? "Show Less"
                                        : `See More ${activeTab} →`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </section>
        </div>
    )
}

export default CoursesSection