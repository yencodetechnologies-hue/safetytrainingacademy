import "../../styles/Hero.css"
import sliderOne from "../../assets/Slider1.jpeg"
import sliderTwo from "../../assets/Slider2.jpeg"
import sliderThree from "../../assets/Slider3.jpeg"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

function Hero() {
  const navigate = useNavigate()
  const images = [sliderOne, sliderTwo, sliderThree]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [pubsearch, pubsetSearch] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const currentIndexRef = useRef(0)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("https://api.octosofttechnologies.in/api/courses")
        if (!res.ok) throw new Error("Failed to fetch courses")
        const data = await res.json()
        setAllCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndexRef.current + 1) % images.length
      setNextIndex(next)
      setAnimating(true)
      setTimeout(() => {
        currentIndexRef.current = next
        setCurrentIndex(next)
        setAnimating(false)
      }, 1200)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (pubsearch.trim()) {
      const filtered = allCourses.filter(c =>
        c.title.toLowerCase().includes(pubsearch.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [pubsearch])

  return (
    <section className="hero" style={{ backgroundImage: `url(${images[currentIndex]})` }}>

      <div
        className={`hero-next-layer ${animating ? "hero-next-animate" : ""}`}
        style={{ backgroundImage: `url(${images[nextIndex]})` }}
      />

      <div className="hero-overlay"></div>
       <div className="announcement-bar">
          <p>🔥 SUNDAY CLASSES AVAILABLE • ENROLL NOW • LIMITED SEATS 🔥     NATIONALLY RECOGNIZED CERTIFICATES •      GET CERTIFIED WITH CREDENTIALS THAT ARE RECOGNIZED ACROSS ALL STATES AND TERRITORIES </p>
        </div>
      <div className="hero-container">
       
        {/* LEFT */}
        <div className="hero-left">
          <h1>
            NATIONALLY RECOGNIZED
            <span>CERTIFICATES</span>
          </h1>
          <p>
            Get certified with credentials that are recognized across all states and territories.
            Start your career with confidence.
          </p>

          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => {
              const el = document.getElementById("courses")
              if (el) {
                el.scrollIntoView({ behavior: "smooth" })
              } else {
                navigate("/#courses")
              }
            }}>
              <i className="fa-solid fa-book-open"></i> View All Courses
            </button>

            <div className="hero-search-wrapper">
              <div className="hero-search">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="hero-search-input"
                  value={pubsearch}
                  onChange={(e) => pubsetSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && pubsearch.trim()) {
                      navigate(`/courses?search=${pubsearch}`)
                    }
                  }}
                />
                <button
                  className="hero-search-btn"
                  onClick={() => {
                    if (pubsearch.trim()) {
                      navigate(`/courses?search=${pubsearch}`)
                      pubsetSearch("")
                    }
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="search-dropdown">
                  {suggestions.map((course) => (
                    <div
                      key={course._id}
                      className="search-item"
                      onClick={() => {
                        navigate(`/courses?search=${course.title}&category=${course.category}`)
                        setSuggestions([])
                        pubsetSearch("")
                      }}
                    >
                      {course.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-icon"><i className="fa-regular fa-star"></i></span>
              <div className="hero-stat-text">
                <strong>10,000+</strong>
                <span>Students Trained</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon shield"><i className="fa-solid fa-circle-check"></i></span>
              <div className="hero-stat-text">
                <strong>100%</strong>
                <span>Compliance Focused</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon shield"><i className="fa-solid fa-shield-halved"></i></span>
              <div className="hero-stat-text">
                <strong>Trusted</strong>
                <span>Across Australia</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="hero-card">
          <div className="hero-card-title-row">
            <h3>Course Enrolment</h3>
            <div className="hero-card-divider"></div>
          </div>
          <p>
            To enrol for a Course with Safety Training Academy, please complete our online
            Enrolment form via the button below:
          </p>
          <button className="enrol-btn" onClick={() => navigate("/book-now")}>
            <i className="fa-solid fa-user-shield"></i> Start Enrolment Now →
          </button>
          <button className="voc-btn" onClick={() => navigate("/voc")}>
            <i className="fa-solid fa-user-shield"></i> VOC (Verification of Competency)
          </button>
        </div>

      </div>
    </section>
  )
}

export default Hero