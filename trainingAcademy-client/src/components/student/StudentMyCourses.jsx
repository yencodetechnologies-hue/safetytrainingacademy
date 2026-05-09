import { useState, useEffect } from "react";
import "./StudentMyCourses.css";
import { useNavigate, useLocation } from "react-router-dom";
import LLNDAssessment from "../llnd/LLNDAssessment";
import Payment from "../../components/Payment";
import { API_URL } from "../../data/service";
import { cdnImage } from "../../utils/cdnImage";

export default function StudentMyCourses() {
  const location = useLocation();

  // If navigated here with state.tab = "browse", start on browse tab
  const [tab, setTab] = useState(location.state?.tab || "enrolled");

  const [search, setSearch] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [showAssessment, setShowAssessment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [browseCourses, setBrowseCourses] = useState([]);
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [userDetails, setUserDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const fetchData = async () => {
    try {
      const studentId = user?.id;
      if (!studentId) throw new Error("Student ID not found. Please login again.");

      const [dashRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/api/student/dashboard/${studentId}`),
        fetch(`${API_URL}/api/courses`)
      ]);

      if (!dashRes.ok) throw new Error("Failed to fetch dashboard data");
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");

      const dash = await dashRes.json();
      const courses = await coursesRes.json();

      setDashboardData(dash);
      setBrowseCourses(courses);
      setEnrolledCourseDetails(dash.enrolledCourses || []);

    } catch (err) {
      console.error(err);
      // Don't show error for missing enrollment data — just show empty state
      if (!err.message?.includes("Student ID")) {
        setDashboardData({ enrolledCourses: [] });
        setEnrolledCourseDetails([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssessmentComplete = () => {
    setShowAssessment(false);
    fetchData();
  };

  const filtered = browseCourses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (showAssessment) {
    return (
      <LLNDAssessment
        onComplete={handleAssessmentComplete}
        userDetails={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
      />
    );
  }

  if (showPayment && selectedCourse) {
    return (
      <div style={{ padding: "24px" }}>
        <button
          onClick={() => { setShowPayment(false); setSelectedCourse(null); }}
          style={{ marginBottom: 16, cursor: "pointer", padding: "8px 16px" }}
        >
          ← Back
        </button>
        <Payment
          selectedCourse={selectedCourse}
          setUserDetails={setUserDetails}
          setPaymentData={setPaymentData}
          coursePrice={selectedCourse?.sellingPrice || selectedCourse?.price}
          isCompanyEnroll={false}
          triggerValidation={false}
          setIsValid={() => {}}
          onCardPayment={() => {}}
        />
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button
            className="mc-btn mc-btn--purple"
            onClick={() => {
              setShowPayment(false);
              setSelectedCourse(null);
              fetchData();
            }}
          >
            Submit Payment
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const scoreDisplay = Math.round(dashboardData?.assessmentScore || 0);
  const assessmentPassed = dashboardData?.assessmentPassed;
  const formApproved = dashboardData?.enrollmentFormApproved;
  const paymentVerified = dashboardData?.paymentVerified ?? false;
  const enrollmentType = dashboardData?.enrollmentType || "";
  const isAgent = enrollmentType === "agent" || enrollmentType === "Agent";

  return (
    <div className="mc-wrapper">
      <div className="mc-header">
        <h1 className="mc-title">My Courses</h1>
        <p className="mc-subtitle">Manage your enrolled courses and discover new certifications</p>
      </div>

      {assessmentPassed && (
        <div className="mc-banner mc-banner--success">
          <span className="mc-banner__icon">✓</span>
          <div>
            <strong>Pre-Enrollment Assessment Passed</strong>
            <p>Score: {scoreDisplay}% – You can now enroll in courses. You can also retake LLND anytime if you want to improve your result.</p>
          </div>
        </div>
      )}

      {assessmentPassed && (
        <div className="mc-banner mc-banner--optional">
          <div className="mc-banner__left">
            <span className="mc-optional-badge">Optional</span>
            <div>
              <strong className="mc-banner__title--purple">LLND Assessment Retake Available</strong>
              <p>You have already passed. Retake anytime if you want to improve your score.</p>
            </div>
          </div>
          <button
            className="mc-btn mc-btn--purple"
            onClick={() => setShowAssessment(true)}
          >
            <span>📖</span> Retake Assessment
          </button>
        </div>
      )}

      {formApproved && (
        <div className="mc-banner mc-banner--success">
          <span className="mc-banner__icon">✓</span>
          <div>
            <strong>Enrollment Form Approved</strong>
            <p>Your enrollment form has been approved.</p>
            <a href="#" className="mc-link">View Form</a>
          </div>
        </div>
      )}

      <div className="mc-tabs">
        <button
          className={`mc-tab ${tab === "enrolled" ? "mc-tab--active" : ""}`}
          onClick={() => setTab("enrolled")}
        >
          Enrolled Courses
        </button>
        <button
          className={`mc-tab ${tab === "browse" ? "mc-tab--active" : ""}`}
          onClick={() => setTab("browse")}
        >
          Browse Courses
        </button>
      </div>

      {tab === "enrolled" && (
        <div className="mc-enrolled">
          {enrolledCourseDetails?.length === 0 && (
            <p>No enrolled courses found.</p>
          )}
          {enrolledCourseDetails?.map((course, index) => (
            <div key={index} className="mc-course-card">
              {course.image && (
                <img
                  src={cdnImage(course.image, { w: 480 })}
                  alt={course.courseName}
                  className="mc-course-card__img"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="mc-course-card__body">
                <div className="mc-course-card__top">
                  <div>
                    <h3 className="mc-course-card__title">{course.courseName}</h3>
                  </div>
                  <div className="mc-course-card__badges">
                    <span className="mc-badge status-active">Active</span>
                    {isAgent ? (
                      <span className="mc-badge status-active">Payment: N/A</span>
                    ) : (
                      <span className={`mc-badge ${paymentVerified ? "status-active" : "status-pending"}`}>
                        Payment: {paymentVerified ? "Paid" : "Pending"}
                      </span>
                    )}
                    <span className={`mc-badge ${assessmentPassed ? "status-completed" : "status-pending"}`}>
                      LLN: {assessmentPassed ? "Completed" : "Pending"}
                    </span>
                    <span className={`mc-badge ${formApproved ? "status-approved" : "status-pending"}`}>
                      Form: {formApproved ? "Approved" : "Required"}
                    </span>
                  </div>
                </div>

                <div className="mc-course-card__progress-section">
                  <div className="mc-course-card__progress-label">
                    <span>Overall Progress</span>
                    <span className="mc-course-card__progress-pct">10%</span>
                  </div>
                  <div className="mc-progress-bar">
                    <div className="mc-progress-bar__fill" style={{ width: "10%" }} />
                  </div>
                </div>

                {course.sessionDate && (
                  <div className="mc-course-card__schedule">
                    <h4 className="mc-schedule-title">📅 Your Booked Session</h4>
                    <div className="mc-schedule-row">
                      <span className="mc-schedule-date">
                        📆 {new Date(course.sessionDate).toLocaleDateString("en-AU", {
                          weekday: "short", day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                      {course.startTime && course.endTime && (
                        <span className="mc-schedule-time">
                          🕐 {course.startTime} – {course.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!course.sessionDate && (
                  <p className="mc-no-schedule">No session booked yet. Contact us for details.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "browse" && (
        <div className="mc-browse">
          <div className="mc-search-wrap">
            <span className="mc-search-icon">🔍</span>
            <input
              className="mc-search"
              placeholder="Search for courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mc-grid">
            {filtered.map((course) => (
              <div key={course._id} className="mc-browse-card">
                <div className="mc-browse-card__img-wrap">
                  <img
                    src={cdnImage(course.image, { w: 480 })}
                    alt={course.title}
                    className="mc-browse-card__img"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="mc-category-badge">{course.title}</span>
                </div>
                <div className="mc-browse-card__body">
                  <h3 className="mc-browse-card__title">{course.title}</h3>
                  <p className="mc-browse-card__batch">Next batch starts: {course.nextBatch || "Contact us"}</p>
                  <div className="mc-browse-card__meta">
                    {course.duration && <span>⏱ {course.duration}</span>}
                    <span>👥 {course.studentsEnrolled || 0}</span>
                  </div>
                  {course.tags && (
                    <div className="mc-tags">
                      {course.tags.map((t) => (
                        <span key={t} className="mc-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  {course.dates && course.dates.length > 0 && (
                    <div className="mc-date-select">
                      <label>📅 Select a Date</label>
                      <select
                        value={selectedDates[course._id] || ""}
                        onChange={(e) =>
                          setSelectedDates({ ...selectedDates, [course._id]: e.target.value })
                        }
                      >
                        <option value="">Choose a date</option>
                        {course.dates.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mc-browse-card__footer">
                    <div>
                      <p className="mc-price-label">Price</p>
                      <p className="mc-price">{course.price}</p>
                    </div>
                    <button
                      className="mc-btn mc-btn--purple mc-btn--sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowPayment(true);
                      }}
                    >
                      ↑ Enroll &amp; Pay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}