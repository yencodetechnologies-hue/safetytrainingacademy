import "../../styles/CourseDetailHero.css"
import { useNavigate } from "react-router-dom"

function CourseDetailHero({ course }) {

    const navigate = useNavigate()

    const originalPrice = course?.originalPrice || 150
    const sellingPrice = course?.sellingPrice || 100
    const savings = originalPrice - sellingPrice

    return (
        <div className="course-detail-hero">

            {/* HERO SECTION */}
            <div
                className="hero-wrapper"
                style={
                    course?.image
                        ? { backgroundImage: `url(${course.image})` }
                        : {}
                }
            >
                <div className="hero-container">

                    {/* LEFT — 3fr */}
                    <div className="course-hero-left">

                        <div className="course-tag">
                            {course?.courseCode || "Construction — White Card"}
                        </div>

                        <h1 className="hero-title">
                            {course?.title || "Prepare to Work Safely in the Construction Industry"}
                        </h1>

                        <div className="hero-sub-meta">
                            {course?.category || ""} · Nationally Recognised Training
                        </div>

                        <div className="hero-meta-row">
                            <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span><strong>{course?.duration || "1 day"}</strong> duration</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📍</span>
                                <span><strong>{course?.location || "Sefton"}</strong> NSW 2162</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">🏅</span>
                                <span><strong>RTO #45234</strong> accredited</span>
                            </div>
                        </div>

                       

                    </div>

                    {/* RIGHT — 1fr — Price Card */}
                    <div className="hero-right">
                        <div className="price-card-hero">

                            <div className="price-row">
                                <span className="price-now">${sellingPrice}</span>
                                <span className="price-old">${originalPrice}</span>
                                <span className="save-badge">Save ${savings}</span>
                            </div>

                            <p className="price-note">
                                All inclusive — no hidden fees · SafeWork NSW card fee included
                            </p>

                            <button className="btn-book">
                                Book Now — Pick a Date
                            </button>

                            <button className="btn-voc">
                                Already Trained? Book VOC
                            </button>

                            <ul className="checklist">
                                <li><span className="check-icon">✓</span> Certificate issued same day</li>
                                <li><span className="check-icon">✓</span> Sunday sessions available</li>
                                <li><span className="check-icon">✓</span> SafeWork NSW approved RTO</li>
                                <li><span className="check-icon">✓</span> 1,000+ five-star Google reviews</li>
                            </ul>

                        </div>
                    </div>

                </div>
            </div>

            {/* INFO BAR */}
            <div className="info-bar">
                <div className="info-bar-inner">
                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <div className="info-text">
                            <strong>1 Day</strong>
                            <span>Course duration</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">⏰</span>
                        <div className="info-text">
                            <strong>8:30am – 4:30pm</strong>
                            <span>Class hours</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div className="info-text">
                            <strong>Sefton NSW</strong>
                            <span>Training location</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">🎓</span>
                        <div className="info-text">
                            <strong>RTO #45234</strong>
                            <span>Accredited provider</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📋</span>
                        <div className="info-text">
                            <strong>Same Day</strong>
                            <span>Certificate issued</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">🌏</span>
                        <div className="info-text">
                            <strong>All States</strong>
                            <span>Nationally recognised</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CourseDetailHero