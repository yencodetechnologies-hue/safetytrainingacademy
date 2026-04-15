import "../../styles/CourseDetailHero.css"
import { useNavigate } from "react-router-dom"

function CourseDetailHero({ course }) {

    const navigate = useNavigate()

    return (

        <div className="course-detail-hero">

            <div className="course-hero-container">

                <button
                    className="back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back to Courses
                </button>


                <div className="hero-badges-container">



                    <span className="badge blue">
                        Short Courses
                    </span>

                    <span className="badge purple">
                        Combo Available
                    </span>

                    <span className="badge red">
                        SALE - Save $20!
                    </span>

                </div>


                <h1 className="hero-title">
                    {course?.title || "Course"} {course?.category || "Course" && `- ${course?.category || "categoryv"}`}
                </h1>


                <div className="hero-meta">

                    <span>👷 DELIVERY: {course?.deliveryMethod}</span>

                    <span>💰 COST: ${course?.sellingPrice}</span>

                    <span>📍 LOCATION: {course?.location}</span>

                </div>


                <div className="hero-search">

                    <input
                        type="text"
                        placeholder="Search other courses..."
                    />

                </div>

            </div>

        </div>

    )

}

export default CourseDetailHero