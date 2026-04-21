import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/Footer.css"
import logo from "../../assets/Logo STA.jpeg"
import FooterMobile from "../mobile/components/FooterMobile"

const courseLinks = [
    { label: "White Card",           path: "/courses/white-card" },
    { label: "Forklift Licence",     path: "/courses/forklift" },
    { label: "Working at Heights",   path: "/courses/working-at-heights" },
    { label: "EWP Boom 11m",         path: "/courses/ewp-boom" },
    { label: "Confined Space",       path: "/courses/confined-space" },
    { label: "Traffic Control",      path: "/courses/traffic-control" },
]

const quickLinks = [
    { label: "Home",            path: "/" },
    { label: "Upcoming Dates",  path: "/upcoming-dates" },
    { label: "VOC / RPL",       path: "/voc-rpl" },
    { label: "Book Now",        path: "/book-now" },
    { label: "About Us",        path: "/about" },
    { label: "Contact Us",      path: "/contact" },
    { label: "FAQs",            path: "/faqs" },
]

const accredLinks = [
    { label: "RTO #45234",                    path: "#" },
    { label: "SafeWork NSW Approved",         path: "#" },
    { label: "Nationally Recognised Training", path: "#" },
]

const socialLinks = [
    { label: "Facebook",  icon: "fa-brands fa-facebook-f", url: "https://facebook.com" },
    { label: "Instagram", icon: "fa-brands fa-instagram",  url: "https://instagram.com" },
    { label: "LinkedIn",  icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com" },
]

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= breakpoint
    )
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [breakpoint])
    return isMobile
}

function Footer({ courses = [] }) {
    const navigate  = useNavigate()
    const isMobile  = useIsMobile()

    if (isMobile) {
        return <FooterMobile courses={courses} />
    }

    return (
        <footer className="footer">

            {/* TOP GRADIENT BAR */}
            <div className="footer-top-bar" />

            {/* MAIN GRID */}
            <div className="footer-grid">

                {/* BRAND COL */}
                <div className="footer-brand-col">
                    <div className="footer-logo-wrap">
                        
                        <div className="footer-logo-text">
                            SAFETY TRAINING ACADEMY
                        </div>
                    </div>

                 

                    <div className="footer-contact-list">
                        <div className="footer-contact-item">
                            <i className="fa-solid fa-location-dot" />
                            <span>3/14-16 Marjorie Street, Sefton NSW 2162</span>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fa-solid fa-envelope" />
                            <span>info@safetytrainingacademy.edu.au</span>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fa-solid fa-phone" />
                            <span>0483 878 887 &nbsp;·&nbsp; 1300 976 097</span>
                        </div>
                    </div>

                    <div className="footer-socials">
                        {socialLinks.map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noreferrer"
                                className="footer-social-btn" aria-label={s.label}>
                                <i className={s.icon} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* COURSES COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Courses</div>
                    {courseLinks.map((l, i) => (
                        <span key={i} className="footer-link"
                            onClick={() => navigate(l.path)}>
                            {l.label}
                        </span>
                    ))}
                    <span className="footer-link footer-link--highlight"
                        onClick={() => navigate("/courses")}>
                        View all courses →
                    </span>
                </div>

                {/* QUICK LINKS COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Quick Links</div>
                    {quickLinks.map((l, i) => (
                        <span key={i} className="footer-link"
                            onClick={() => navigate(l.path)}>
                            {l.label}
                        </span>
                    ))}
                </div>

                {/* ACCREDITATION + FOLLOW US COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Accreditation</div>
                    {accredLinks.map((l, i) => (
                        <span key={i} className="footer-link"
                            onClick={() => navigate(l.path)}>
                            {l.label}
                        </span>
                    ))}

                    <div className="footer-col-title" style={{ marginTop: "20px" }}>
                        Follow Us
                    </div>
                    {socialLinks.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer"
                            className="footer-link footer-social-text">
                            {s.label}
                        </a>
                    ))}
                </div>

            </div>

            {/* BOTTOM BAR */}
            <div className="footer-bottom">
                <span className="footer-bottom-text">
                    © 2024 Safety Training Academy. All rights reserved.
                    ABN 45234 · safetytrainingacademy.edu.au
                </span>
                <div className="footer-rto-badge">RTO #45234</div>
            </div>

        </footer>
    )
}

export default Footer