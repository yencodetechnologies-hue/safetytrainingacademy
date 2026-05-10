import "../styles/PublicNavbar.css";
import logo from "../assets/SafetyTrainingAcademylogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const mobileMenuItems = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/all-courses" },
  { label: "Resources", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Forms", path: "/forms" },
  { label: "Fees & Refund", path: "/fees-refund" },
  { label: "Unique Student Identifier (USI)", path: "/usi" },
  { label: "Code of Practice", path: "/code-of-practice" },
  { label: "Gallery", path: "/gallery" },
  { label: "Sign In", path: "/login" },
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
            <img src={logo} alt="Safety Training Academy Logo"  onClick={() => navigate("/")} />
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
                <>
                  {/* Transparent hover-bridge over the 10px gap between
                      the navbar and the dropdown. Without this, the cursor
                      crosses empty space and onMouseLeave fires before the
                      user can reach a category. */}
                  <div className="courses-dropdown-bridge" />
                  <div className="courses-dropdown">
                  <div className="courses-dropdown-left">
                    {Object.keys(groupedCourses).map((cat) => (
                      <div
                        key={cat}
                        onMouseEnter={() => setActiveCategory(cat)}
                        className={`category-item ${activeCategory === cat ? "active" : ""}`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                  <div className="courses-dropdown-right">
                    {activeCategory && groupedCourses[activeCategory].map((course) => (
                      <div
                        key={course._id}
                        onClick={() => navigate(`/course/${course.slug}`)}
                        className="course-item"
                      >
                        {course.title}
                      </div>
                    ))}
                  </div>
                </div>
                </>
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
            <button onClick={() => navigate("/combo-courses")}>Combo Courses</button>
            <button onClick={() => navigate("/book-now")}>Book now</button>
            <button><Link className="login-link" to="/login">Login</Link></button>
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
              <button onClick={() => { navigate("/combo-courses"); closeMenu(); }}>Combo Courses</button>
              <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
              <button><Link className="login-link" to="/login">Login</Link></button>
            </div>
          </div>
        )}

      </header>
    </>
  );
}

export default PublicNavbar;