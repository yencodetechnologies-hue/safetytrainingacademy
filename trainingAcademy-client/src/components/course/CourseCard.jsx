import "../../styles/CourseCard.css"
import { useNavigate } from "react-router-dom";

function CourseCard({ course }) {

  const navigate = useNavigate()
  
  return (

    <div className="course-card">

      <div className="course-image" onClick={() => navigate(`/course/${course.slug}-${course._id}`)}>

        {course.image && (
          <img src={course.image} alt={course.title} />
        )}

        <div className="image-overlay">
          View Details
        </div>

      </div>

      <div className="course-body">

        <div className="course-top">

          <span className="badge">
            {`${course.category}`}
          </span>

          {/* ✅ experienceBasedBooking ஆனா w/exp & w/o exp price காட்டு */}
          <div className="course-card-price">
            {course.experienceBasedBooking ? (
              <div >
                <p className="price" >
                  <span >${course.withExperiencePrice}</span>
                </p>
                <p className="old-price" >
                  <span >${course.withoutExperiencePrice}</span>
                </p>
              </div>
            ) : (
              <p className="price">${course.sellingPrice}</p>
            )}
          </div>

        </div>

        <div className="special-price">
          <h3 className="course-title">
            {course.title}
          </h3>
          {/* ✅ experienceBasedBooking இல்லன்னா மட்டும் original price காட்டு */}
          {!course.experienceBasedBooking && course.originalPrice && (
            <p className="old-price">
              ${course.originalPrice}
            </p>
          )}
        </div>

        <div className="courseCard-info">
          <p><span><i className="fa-solid fa-location-dot"></i></span> {course.location}</p>
          <p><span><i className="fa-solid fa-chalkboard-user"></i></span> Delivery: {course.deliveryMethod}</p>
          <p><span><i className="fa-regular fa-calendar-days"></i></span>{course.duration}</p>
        </div>

        {course.experienceBasedBooking ? (

          <div className="exp-buttons">

            <button
              className="book-btn-course"
              onClick={() => navigate(`/book-now?courseId=${course._id}&type=with-experience`)} // ✅
            >
              <span className="old-price">${course.withExperienceOriginal}</span>
              <span className="new-price-cc">${course.withExperiencePrice || 0}</span>
              Book With Experience
            </button>

            <button
              className="book-btn-course alt"
              onClick={() => navigate(`/book-now?courseId=${course._id}&type=without-experience`)} // ✅
            >
              <span className="old-price">${course.withoutExperienceOriginal}</span>
              <span className="new-price-cc">${course.withoutExperiencePrice}</span>
              Book Without Experience
            </button>

          </div>

        ) : (

          <button
            className="book-btn-course"
            onClick={() => navigate(`/book-now?courseId=${course._id}`)}
          >
            Book Now
            <span><i className="fa-regular fa-circle-right"></i></span>
          </button>

        )}

        <button
          className="details-btn detail-btn-course"
          onClick={() => navigate(`/course/${course.slug}-${course._id}`)}
        >
          View Details
          <span><i className="fa-solid fa-circle-info"></i></span>
        </button>

      </div>

    </div>

  )

}

export default CourseCard