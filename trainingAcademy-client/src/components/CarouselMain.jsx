import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Carousel.css";
import { API_URL } from "../data/service";

const API_BASE = `${API_URL}/api`;

export default function HomePage({ courses = [] }) {
  const categories = [
  ...new Map(
    courses.map(course => [course.category, course])
  ).values()
];
  const loading = courses.length === 0;
  const scrollRef = useRef(null);
  const navigate = useNavigate();



  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/courses?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <section className="hp-section">
      <div className="hp-header">
        <div className="hp-header-left">
          {/* <p className="hp-tagline">Explore Our Courses</p> */}
          {/* <h2 className="hp-title">Engineered for your career</h2> */}
        </div>
        {/* <button
          className="hp-see-all"
          onClick={() => navigate("/all-courses")}
        >
          See all courses →
        </button> */}
      </div>

      <div className="hp-carousel-wrap">
        {/* Left Arrow */}
      

        {/* Scrollable Track */}
        <div className="hp-track" ref={scrollRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="hp-card hp-card-skeleton" />
            ))
            : categories.map((cat) => (
              <div
                key={cat.category}
                className="hp-card"
                onClick={() =>navigate(`/all-courses?category=${encodeURIComponent(cat.category)}`)}
              >
                <div className="hp-card-img-wrap">
                  <img
                    src={cat.image}
                    alt={cat.category}
                    className="hp-card-img"
                      onError={(e) => {
                        e.target.onerror = null; // 🔥 prevents loop
                        e.target.src = "/placeholder-course.png";
                      }}
                  />
                </div>
                <div className="hp-card-label">{cat.category}</div>
              </div>
            ))}
        </div>

        {/* Right Arrow */}
       
      </div>

      {/* Scroll indicator bar */}
      <div className="hp-scroll-bar">
        <div className="hp-scroll-thumb" />
      </div>
    </section>
  );
}