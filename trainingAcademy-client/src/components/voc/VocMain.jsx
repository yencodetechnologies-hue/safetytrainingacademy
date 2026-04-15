import { useState } from "react"
import "./VocMain.css"
import VocStepper from "./VocStepper.jsx"
import VocStep1 from "./VocStep1.jsx"
import VocStep2 from "./VocStep2.jsx"
import VocStep3 from "./VocStep3.jsx"
import TopNav from "../landingPage/TopNav"
import TrustBar from "../landingPage/TrustBar"
import PublicNavbar from "../PublicNavbar"
import Footer from "../landingPage/Footer"

function Voc() {

    const [step, setStep] = useState(1)

    const [details, setDetails] = useState({
        firstName: "", lastName: "", email: "",
        phone: "", studentId: "",
        streetAddress: "", city: "", state: "", postcode: ""
    })

    const [courses, setCourses] = useState([])

    return (
        <section className="voc-page">
            <TopNav />
            <TrustBar />
            <PublicNavbar />

            <div className="voc-container">

                <VocStepper step={step} />

                {step === 1 && (
                    <VocStep1
                        data={details}
                        setData={setDetails}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <VocStep2
                        courses={courses}
                        setCourses={setCourses}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <VocStep3
                        courses={courses}
                        onBack={() => setStep(2)}
                        onComplete={() => setStep(4)}
                    />
                )}

                {step === 4 && (
                    <div className="voc-done">
                        <div className="voc-done-icon">✅</div>
                        <h2>Registration Complete!</h2>
                        <p>
                            A confirmation email has been sent to <strong>{details.email}</strong>.
                        </p>
                    </div>
                )}

            </div>

            <Footer />
        </section>
    )
}

export default Voc