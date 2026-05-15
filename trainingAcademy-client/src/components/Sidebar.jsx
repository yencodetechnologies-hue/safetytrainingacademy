import "../styles/Sidebar.css"
import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom"
import { API_URL } from "../data/service";

const menu = {
  Student: [
    { name: "Dashboard", path: "/student" },
    { name: "My Courses", path: "/student/my-courses" },
    { name: "Buy New Course", path: "/student/my-courses", state: { tab: "browse" } },
    { name: "Enrollment Form", path: "/student/enrollment-form" },
    { name: "Schedule", path: "/student/schedule" },
    { name: "Results", path: "/student/results" },
    { name: "Certificates", path: "/student/certificates" }
  ],

  Teacher: [
    { name: "Dashboard", path: "/teacher" },
    { name: "My Classes", path: "/teacher/classes" },
    { name: "Students", path: "/teacher/students" },
    { name: "Certifications", path: "/teacher/certifications" },
    { name: "Schedule", path: "/teacher/schedule" }
  ],

  Admin: [
    { name: "Dashboard", path: "/admin", icon: "fa-solid fa-table-columns" },
    { name: "Courses", path: "/admin/courses", icon: "fa-solid fa-book" },
    { name: "Students", path: "/admin/students", icon: "fa-solid fa-users" },
    { name: "Companies", path: "/admin/companies", icon: "fa-solid fa-users" },
    { name: "Schedule", path: "/admin/schedule", icon: "fa-solid fa-calendar" },
    { name: "Teachers", path: "/admin/teachers", icon: "fa-solid fa-chalkboard-user" },
    { name: "LLN Results", path: "/admin/LLN-results", icon: "fa-solid fa-clipboard-check" },
    { name: "Enrollment Forms", path: "/admin/enrollment-forms", icon: "fa-solid fa-file-pen" },
    { name: "Enrollment Links", path: "/admin/enrollment-links", icon: "fa-solid fa-link" },
    { name: "Exams", path: "/admin/exams", icon: "fa-solid fa-file-lines" },
    { name: "Payments", path: "/admin/payments", icon: "fa-solid fa-dollar-sign" },
    { name: "Company Payments", path: "/admin/company-payments", icon: "fa-solid fa-dollar-sign" },
    { name: "Agent Payments", path: "/admin/agent-payments", icon: "fa-solid fa-user-tie" },
    { name: "Certificates", path: "/admin/certificates", icon: "fa-solid fa-award" },
    { name: "Gallery", path: "/admin/gallery", icon: "fa-solid fa-image" },
    { name: "Sliders", path: "/admin/sliders", icon: "fa-solid fa-images" },
    { name: "Partners", path: "/admin/partners", icon: "fa-solid fa-handshake" },
    { name: "VOC Submission", path: "/admin/voc-submissions", icon: "fa-solid fa-image" },
    { name: "Results Upload", path: "/admin/results-upload", icon: "fa-solid fa-upload" }
  ],

  Company: [
    { name: "Dashboard", path: "/company", icon: "fa-solid fa-table-columns" },
    { name: "Courses", path: "/company/companyCourses", icon: "fa-solid fa-book" },
    { name: "Payments", path: "/company/companyPayments", icon: "fa-solid fa-dollar-sign" },
    { name: "Students", path: "/company/companyStudents", icon: "fa-solid fa-users" },
  ]
}

function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AuthContext);
  const [studentStatus, setStudentStatus] = useState({ 
    assessmentPassed: false, 
    enrollmentFormSubmitted: false,
    enrollmentFormRejected: false 
  });

  useEffect(() => {
    if (user?.role === "Student") {
      fetch(`${API_URL}/api/student/dashboard/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setStudentStatus({
            assessmentPassed: data.assessmentPassed,
            enrollmentFormSubmitted: data.enrollmentFormSubmitted,
            enrollmentFormRejected: data.enrollmentFormRejected
          });
        })
        .catch(err => console.error("Sidebar status fetch error:", err));
    }
  }, [user]);

  const getActiveFromPath = () => {
    const currentMenu = menu[user?.role] || []

    // Special case for Student My Courses vs Buy New Course
    if (user?.role === "Student" && location.pathname === "/student/my-courses") {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("tab") === "browse" || location.state?.tab === "browse") return "Buy New Course";
      return "My Courses";
    }

    const matched = [...currentMenu]
      .sort((a, b) => b.path.length - a.path.length)
      .find(item => location.pathname.startsWith(item.path))
    return matched?.name || "Dashboard"
  }

  const active = getActiveFromPath()

  const handleNavigate = (item) => {
    // Restricted paths for students who passed LLN but haven't submitted the form
    const restrictedPaths = ["/student/my-courses", "/student/schedule", "/student/results", "/student/certificates"];
    if (user?.role === "Student" && 
        studentStatus.assessmentPassed && 
        (studentStatus.enrollmentFormRejected || !studentStatus.enrollmentFormSubmitted) && 
        restrictedPaths.includes(item.path)) {
      alert("Please complete or update your enrollment form before continuing.");
      navigate("/student/enrollment-form");
      setIsOpen(false);
      return;
    }

    navigate(item.path, { state: item.state })
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <button className="sidebar-burger" onClick={() => setIsOpen(prev => !prev)}>
        <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {menu[user?.role]?.map((item) => (
          <button
            key={item.name}
            className={`menu-item ${active === item.name ? "active" : ""}`}
            onClick={() => handleNavigate(item)}
          >
            <span className="menu-icon">
              <i className={item.icon}></i>
            </span>
            <span className="menu-text">
              {item.name}
            </span>
          </button>
        ))}

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  )
}

export default Sidebar