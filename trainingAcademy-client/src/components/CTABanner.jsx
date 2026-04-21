import { useNavigate } from "react-router-dom"
import "../styles/CTABanner.css"

function CTABanner() {
    const navigate = useNavigate()

    return (
        <div className="cta-banner">
            <div className="cta-text">
                <h2 className="cta-title">Ready to get certified this week?</h2>
                <p className="cta-sub">
                    Same-week sessions available · Sunday classes · Certificate issued same day
                </p>
            </div>
            <div className="cta-actions">
                <button className="cta-btn-dark" onClick={() => navigate("/book-now")}>
                    Book Now
                </button>
                <button className="cta-btn-dark" onClick={() => navigate("/book-now")}>
                    Submit Enquiry
                </button>
                <a href="tel:1300976097" className="cta-btn-white">
                    ☎ Call 1300 976 097
                </a>
            </div>
        </div>
    )
}

export default CTABanner