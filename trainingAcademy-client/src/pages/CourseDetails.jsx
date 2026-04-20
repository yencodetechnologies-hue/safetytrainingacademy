import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import "../styles/CourseDetails.css"
import TopNav from "../components/landingPage/TopNav"
import TrustBar from "../components/landingPage/TrustBar"
import PublicNavbar from "../components/PublicNavbar"
import CourseDetailsHero from "../components/course/CourseDetailHero"
import ViewDetailsLeft from "../components/ViewDetailsLeft"
import ViewDetailsRight from "../components/ViewDetailsRight"
import Footer from "../components/landingPage/Footer"
import { API_URL } from "../data/service"
import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"

// ── Mobile detection hook ─────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}
// ─────────────────────────────────────────────────────────────────────────────

function CourseDetails() {

    const { id } = useParams()
    const courseId = id.split("-").pop()
    const [course, setCourse] = useState(null)
    const [courses, setCourses] = useState([])
    const isMobile = useIsMobile()

    useEffect(() => {

        axios.get(`https://api.octosofttechnologies.in/api/courses/${courseId}`)
            .then(res => {
                setCourse(res.data)
            })

        axios.get(`https://api.octosofttechnologies.in/api/courses`)
            .then(res => {
                setCourses(res.data)
            })

    }, [courseId])

    if (!course) return <p>Loading...</p>

    // ── Mobile view ───────────────────────────────────────────────────────────
    if (isMobile) {
        return <ViewCourseDetailMobile course={course} />
    }

    // ── Desktop view (original — untouched) ──────────────────────────────────
    return (

        <div className="course-details-public">

            <TopNav />
            <PublicNavbar courses={courses}/>
            <CourseDetailsHero course={course} />  
            <div className="course-details-content">
               <ViewDetailsLeft course={course} />
               <ViewDetailsRight course={course} />
            </div>
            <Footer/>

        </div>

    )

}

export default CourseDetails