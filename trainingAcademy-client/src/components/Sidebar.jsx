import "../styles/Sidebar.css"
import { useState } from "react"
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"

function Sidebar({ user }) {
  const [active, setActive] = useState("Dashboard")
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  

  const menu = {
    Student: [
      { name: "Dashboard", path: "/student" },
      { name: "My Courses", path: "/student/my-courses" },
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
      { name: "LLND Results", path: "/admin/llnd-results", icon: "fa-solid fa-clipboard-check" },
      { name: "Enrollment Forms", path: "/admin/enrollment-forms", icon: "fa-solid fa-file-pen" },
      { name: "Enrollment Links", path: "/admin/enrollment-links", icon: "fa-solid fa-link" },
      { name: "Exams", path: "/admin/exams", icon: "fa-solid fa-file-lines" },
      { name: "Payments", path: "/admin/payments", icon: "fa-solid fa-dollar-sign" },
      { name: "Certificates", path: "/admin/certificates", icon: "fa-solid fa-award" },
      { name: "Gallery", path: "/admin/gallery", icon: "fa-solid fa-image" }
    ],
    Company: [
      { name: "Dashboard", path: "/company", icon: "fa-solid fa-table-columns" },
      { name: "Courses", path: "/company/companyCourses", icon: "fa-solid fa-book" },
      { name: "Payments", path: "/company/companyPayments", icon: "fa-solid fa-dollar-sign" },
       { name: "Students", path: "/company/companyStudents", icon: "fa-solid fa-users" },
    ]
  }

  const handleNavigate = (item) => {
    setActive(item.name)
    navigate(item.path)
    setIsOpen(false)
  }



const { logout } = useContext(AuthContext);
const handleLogout = () => {
  logout(); 
  navigate("/");
};

  return (
    <>
      {/* Burger button — visible only on mobile */}
      <button className="sidebar-burger" onClick={() => setIsOpen(prev => !prev)}>
        <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
      </button>

      {/* Overlay — closes sidebar on outside click */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {menu[user?.role]?.map((item) => (
          <button
            key={item.path}
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

        <button className="logout" onClick={()=>{handleLogout()}}>
          Logout
        </button>
      </div>
    </>
  )
}

export default Sidebar