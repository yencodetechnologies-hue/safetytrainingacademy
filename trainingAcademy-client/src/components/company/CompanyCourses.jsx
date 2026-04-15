import { useState } from "react";
import "./CompanyCourses.css";

/* ── Dummy Data ── */
const DUMMY_COURSES = [
  {
    id: 1,
    code: "CPC30220",
    title: "Certificate III in Carpentry Course Information",
    price: "$3000",
    duration: null,
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $3000 📌 LOCATION: Face to Face",
    category: "Certificate Courses",
  },
  {
    id: 2,
    code: "CPC30620",
    title: "Certificate III in Painting and Decorating",
    price: "$2700",
    duration: null,
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $0 📌 LOCATION: Face to Face",
    category: "Certificate Courses",
  },
  {
    id: 3,
    code: "CPC31320",
    title: "Certificate III in Wall and Floor Tiling (RPL)",
    price: null,
    duration: "1 Day • $1900",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $2100 📌 LOCATION: Face to Face",
    category: "Certificate Courses",
  },
  {
    id: 4,
    code: "RIICCM202E",
    title: "Underground Service Locating Ticket",
    price: null,
    duration: "1 DAY TRAINING • $240",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $240 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
  {
    id: 5,
    code: "RIIHAN309F",
    title: "Conduct Telescopic materials handler operations",
    price: null,
    duration: "1 DAY • $380",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $380 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
  {
    id: 6,
    code: "UETDREL006",
    title: "Work safely in the vicinity of live electrical apparatus as a non-electrical worker",
    price: null,
    duration: "1 DAY • $220",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $220 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
  {
    id: 7,
    code: "CPCWHS1021 + CPCWHS1032",
    title: "Traffic Control + Implement Traffic Control Plans (IMP)",
    price: null,
    duration: "1 Day • $570",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $570 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
  {
    id: 8,
    code: "RIIWHS204E + ICTWHS201",
    title: "Work safely at heights + Provide telecommunications services safely on roofs",
    price: null,
    duration: "1 Day • $330",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $330 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
  {
    id: 9,
    code: "RIIWHS202E + RIIWHS204E",
    title: "Enter and Work in Confined Spaces + Work Safely at Heights",
    price: null,
    duration: "2 Days • $290",
    meta: "🎓 DELIVERY: Face to Face Training 📩 COST: $290 📌 LOCATION: Face to Face",
    category: "Short Courses",
  },
];

/* ── Component ── */
export default function CompanyCourses({ courses = DUMMY_COURSES }) {
  const [search, setSearch] = useState("");

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cr-wrapper">
      <p className="cr-page-label">Courses</p>
      <p className="cr-page-subtitle">
        Browse available training courses. Contact the academy to enrol your employees.
      </p>

      {/* Search */}
      <div className="cr-search-wrap">
        <div className="cr-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="cr-search-input"
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="cr-grid">
        {filtered.map((course) => (
          <div key={course.id} className="cr-card">
            <p className="cr-card-code">{course.code}</p>
            <p className="cr-card-title">{course.title}</p>
            {course.price && <p className="cr-card-price">{course.price}</p>}
            {course.duration && <p className="cr-card-price">{course.duration}</p>}
            <p className="cr-card-meta">{course.meta}</p>
            <p className="cr-card-category">{course.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
  ── Usage ──

  // Default dummy data:
  <Courses />

  // Real API data:
  <Courses courses={apiData} />
*/