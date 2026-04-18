import "../../styles/EnrollmentComplete.css"
import { useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

function EnrollmentComplete() {

    const { state } = useLocation()
    const enrollmentData = state || {}
    const navigate = useNavigate()
    const { setUser } = useContext(AuthContext)

    const handleGoToDashboard = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/auth/auto-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: enrollmentData.email }),
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem("token", data.token)
                if (data.user && typeof data.user === "object") {
                    localStorage.setItem("user", JSON.stringify(data.user))
                    setUser(data.user)
                }
                window.location.href = "/student" // ✅ hard redirect
            } else {
                alert("Login failed")
            }
        } catch (err) {
            console.error(err)
            window.location.href = "/login"
        }
    }

    return (
        <div className="ec-page">
            <div className="ec-card">

                <div className="ec-header">
                    <div className="ec-check-circle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ec-check-icon"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 className="ec-title">
                        Thank you for your booking with Safety Training Academy
                    </h1>
                    <p className="ec-subtitle">
                        Your Booking has been completed successfully.
                    </p>
                </div>

                <div className="ec-body">
                    <p className="ec-message">
                        A confirmation email has been sent to{" "}
                        <strong>{enrollmentData.email || "your email"}</strong>. Please check your inbox and follow the instructions.
                    </p>
                    <p className="ec-message">
                        If you need any assistance, please contact us.
                    </p>

                    <div className="ec-divider" />

                    <div className="ec-contact">
                        <p className="ec-regards">Kind regards,</p>
                        <p className="ec-org-name">Safety Training Academy</p>
                        <p className="ec-org-role">Training Team</p>
                        <p className="ec-org-phone">1300 976 097</p>
                        <a href="mailto:info@safetytrainingacademy.edu.au" className="ec-org-email">
                            info@safetytrainingacademy.edu.au
                        </a>
                    </div>

                    <button className="ec-dashboard-btn" onClick={handleGoToDashboard}>
                        Continue to Dashboard
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EnrollmentComplete