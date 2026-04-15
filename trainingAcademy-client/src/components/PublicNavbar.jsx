import "../styles/PublicNavbar.css";
import logo from "../assets/SafetyTrainingAcademylogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const mobileMenuItems = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Resources", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Forms", path: "/forms" },
  { label: "Fees & Refund", path: "/fees-refund" },
  { label: "Unique Student Identifier (USI)", path: "/usi" },
  { label: "Code of Practice", path: "/code-of-practice" },
  { label: "Gallery", path: "/gallery" },
];

function PublicNavbar({ courses = [] }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showResources, setShowResources] = useState(false);

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) acc[course.category] = [];
    acc[course.category].push(course);
    return acc;
  }, {});

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* OVERLAY - outside click pannuna close */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu} />
      )}

      <header className="public-navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <div className="navbar-logo">
            <img src={logo} alt="Safety Training Academy Logo" />
          </div>

          {/* DESKTOP NAV LINKS */}
          <ul className="nav-links">
            <li onClick={() => navigate("/")}>Home</li>

            <li
              onMouseEnter={() => {
                setShowDropdown(true);
                if (!activeCategory && Object.keys(groupedCourses).length > 0) {
                  setActiveCategory(Object.keys(groupedCourses)[0]);
                }
              }}
              onMouseLeave={() => setShowDropdown(false)}
              style={{ position: "relative" }}
            >
              Courses <i className="fa-solid fa-angle-down"></i>
              {showDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: "0",
                  width: "700px", display: "flex", background: "#0d1b2a",
                  color: "white", borderRadius: "10px", overflow: "hidden", zIndex: 999,
                }}>
                  <div style={{ width: "30%", padding: "15px" }}>
                    {Object.keys(groupedCourses).map((cat) => (
                      <div key={cat} onMouseEnter={() => setActiveCategory(cat)}
                        style={{ padding: "10px", cursor: "pointer", background: activeCategory === cat ? "#00bcd4" : "transparent" }}>
                        {cat}
                      </div>
                    ))}
                  </div>
                  <div style={{ width: "70%", padding: "15px" }}>
                    {activeCategory && groupedCourses[activeCategory].map((course) => (
                      <div key={course._id}
                        onClick={() => navigate(`/course/${course.slug}-${course._id}`)}
                        style={{ padding: "8px 0", cursor: "pointer" }}>
                        {course.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li
              onMouseEnter={() => setShowResources(true)}
              onMouseLeave={() => setShowResources(false)}
              style={{ position: "relative" }}
            >
              Resources <i className="fa-solid fa-angle-down"></i>
              {showResources && (
                <div className="resources-dropdown">
                  <div onClick={() => navigate("/forms")}>Forms</div>
                  <div onClick={() => navigate("/fees-refund")}>Fees & Refund</div>
                  <div onClick={() => navigate("/usi")}>Unique Student Identifier (USI)</div>
                  <div onClick={() => navigate("/code-of-practice")}>Code of Practice ▸</div>
                  <div onClick={() => navigate("/gallery")}>Gallery</div>
                </div>
              )}
            </li>

            <li onClick={() => navigate("/about")}>About</li>
            <li onClick={() => navigate("/contact")}>Contact</li>
          </ul>

          {/* DESKTOP BUTTONS */}
          <div className="nav-buttons">
            <button>Combo Courses</button>
            <button onClick={() => navigate("/book-now")}>Book now</button>
            <button><Link className="login-link" to="/login">Login / Register</Link></button>
          </div>

          {/* MOBILE BURGER */}
          <div className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </div>

        </div>

        {/* MOBILE DROPDOWN PANEL */}
        {mobileMenuOpen && (
          <div className="mobile-fullmenu">
            {/* Scrollable list */}
            <div className="mobile-fullmenu-list">
              {mobileMenuItems.map((item, index) => (
                <div
                  key={index}
                  className="mobile-fullmenu-item"
                  onClick={() => { navigate(item.path); closeMenu(); }}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Buttons - always visible at bottom */}
            <div className="mobile-fullmenu-buttons">
              <button onClick={closeMenu}>Combo Courses</button>
              <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
              <button><Link className="login-link" to="/login">Login / Register</Link></button>
            </div>
          </div>
        )}

      </header>
    </>
  );
}

export default PublicNavbar;