import { useState, useEffect, useRef } from "react";
import CourseSelection from "../components/course/CourseSelection";
import "../styles/BookNow.css";
import Payment from "../components/Payment";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import EnrollmentRegister from "../components/enrollmrntRegister/EnrollmentRegister";
import CourseSelectionSuccess from "../components/course/CourseSelectionSuccess";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom"
import Loading from "../components/Loading"

function BookNow() {
    const { state } = useLocation()
    const navigate = useNavigate();
    const enrollRef = useRef(null);
    const { id: enrollId } = useParams();
    const [searchParams] = useSearchParams();
    const bookingType = searchParams.get("type");

    const [isCompanyEnroll, setIsCompanyEnroll] = useState(false);
    const [isLoading, setIsLoading] = useState(!!enrollId);
    const [enrollmentType, setEnrollmentType] = useState("individual");
    const [step, setStep] = useState(1);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollSection, setEnrollSection] = useState(1);
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const [triggerValidation, setTriggerValidation] = useState(false);
    const [paymentData, setPaymentData] = useState({});

    const cardPaymentRef = useRef({ trigger: null, paymentMethod: "bank", paymentStatus: null })
    // ✅ CHANGE 1: ref மாறும்போது button label update ஆக இந்த state வேணும்
    const [activePaymentMethod, setActivePaymentMethod] = useState("Bank Transfer")

    const email = state?.email || "your email"
    const [isProcessing, setIsProcessing] = useState(false)

    const coursePrice = selectedCourse
        ? selectedCourse.experienceBasedBooking
            ? bookingType === "with-experience"
                ? selectedCourse.withExperiencePrice
                : bookingType === "without-experience"
                    ? selectedCourse.withoutExperiencePrice
                    : selectedCourse.sellingPrice
            : selectedCourse.sellingPrice
        : 0;

    useEffect(() => {
        if (selectedCourse?._id) localStorage.setItem("courseId", selectedCourse._id);
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedSession?._id) localStorage.setItem("sessionId", selectedSession._id);
    }, [selectedSession]);

    useEffect(() => {
        if (!enrollId) return;
        setIsLoading(true);
        fetch(`https://api.octosofttechnologies.in/api/book-now/check-role?id=${enrollId}`)
            .then(res => res.json())
            .then(data => {
                if (data.role === "company" || data.role === "Company") {
                    setIsCompanyEnroll(true);
                    setEnrollmentType("company");
                } else {
                    navigate("/");
                }
            })
            .catch(() => navigate("/"))
            .finally(() => setIsLoading(false));
    }, [enrollId]);

    const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "" });

    const totalSteps = enrollmentType === "individual" ? 4 : 2;
    const effectiveStep = isCompanyEnroll ? step - 1 : step;
    const progress = (effectiveStep / totalSteps) * 100;

    useEffect(() => {
        if (step === 1) {
            setSelectedSession(null);
            localStorage.removeItem("enrollId");
            localStorage.removeItem("flowId");
            localStorage.removeItem("courseId");
            localStorage.removeItem("sessionId");
        }
    }, [step]);

    if (isLoading) return <div>Loading...</div>;

    const createFlow = async (slipUrl = "") => {
        try {
            const studentId = localStorage.getItem("enrollId");
            if (!studentId) return;

            const formData = new FormData();
            formData.append("studentId", studentId);
            formData.append("courseId", selectedCourse._id);
            formData.append("courseCategory", selectedCourse.category);
            formData.append("courseName", selectedCourse.title);
            formData.append("price", coursePrice);
            formData.append("enrollmentType", enrollmentType);
            formData.append("sessionDate", selectedSession?.date);
            formData.append("startTime", selectedSession?.startTime);
            formData.append("endTime", selectedSession?.endTime);
            formData.append("paymentMethod", paymentData.paymentMethod || "");
            formData.append("transactionId", paymentData.transactionId || "");
            formData.append("slipUrl", slipUrl);

            const res = await fetch("https://api.octosofttechnologies.in/api/flow/create", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            localStorage.setItem("flowId", data._id);
        } catch (err) {
            console.error(err);
        }
    };

    const sendBookingEmail = async () => {
        try {
            await fetch("https://api.octosofttechnologies.in/api/booking-email/send-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: paymentData.name,
                    email: paymentData.email,
                    courseName: selectedCourse?.title,
                    courseCode: selectedCourse?.courseCode,
                    courseDate: selectedSession?.date,
                    startTime: selectedSession?.startTime,
                    endTime: selectedSession?.endTime,
                    coursePrice,
                    paymentMethod: paymentData.paymentMethod,
                }),
            });
        } catch (err) {
            console.error("Email send failed:", err.message);
        }
    };

    const getNextLabel = () => {
        // ✅ CHANGE 2: cardPaymentRef.current பதிலா activePaymentMethod use பண்றோம்
        if (step === 2 && !isCompanyEnroll) {
            return `🔒 Pay $${coursePrice} & Continue`
        }
        if (step === 4 && enrollSection === 5) return "Submit"
        return "Next"
    }

 const handleNext = async () => {
 
    if (step === 2) {
 
        if (cardPaymentRef.current.paymentMethod === "Card Payment" && !isCompanyEnroll) {
            const success = await cardPaymentRef.current.trigger()
            if (!success) return
 
            setIsProcessing(true)   // ← loading start
            try {
                let studentId = localStorage.getItem("enrollId");
                let slipUrl = "";
 
                if (!studentId) {
                    const formData = new FormData();
                    formData.append("name", paymentData.name);
                    formData.append("email", paymentData.email);
                    formData.append("phone", paymentData.phone);
                    formData.append("paymentMethod", paymentData.paymentMethod);
                    formData.append("transactionId", paymentData.transactionId || "");
                    formData.append("courseId", selectedCourse?._id);
                    formData.append("sessionDate", selectedSession?.date);
                    formData.append("startTime", selectedSession?.startTime);
                    formData.append("endTime", selectedSession?.endTime);
 
                    const res = await fetch("https://api.octosofttechnologies.in/api/enroll/enrollment", {
                        method: "POST",
                        body: formData,
                    });
 
                    const data = await res.json();
                    studentId = data._id;
                    localStorage.setItem("enrollId", studentId);
                    slipUrl = data.courses?.[0]?.slipUrl || "";
                }
 
                const flowId = localStorage.getItem("flowId");
                if (!flowId) await createFlow(slipUrl);
 
                await sendBookingEmail();
 
                navigate("/booking-success", {
                    state: {
                        selectedCourse,
                        courseDate: selectedSession?.date,
                        courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                        coursePrice,
                        paymentMethod: paymentData.paymentMethod,
                        email: paymentData.email,
                        name: paymentData.name,
                    }
                });
            } catch (err) {
                alert(err.message);
            } finally {
                setIsProcessing(false)  // ← loading stop
            }
            return;
        }
 
        // Bank Transfer flow
        setTriggerValidation(true);
        if (!isPaymentValid) return;
 
        setIsProcessing(true)   // ← loading start
        try {
            let studentId = localStorage.getItem("enrollId");
            let slipUrl = "";
 
            if (!studentId) {
                const formData = new FormData();
                formData.append("name", paymentData.name);
                formData.append("email", paymentData.email);
                formData.append("phone", paymentData.phone);
                formData.append("paymentMethod", paymentData.paymentMethod);
                formData.append("transactionId", paymentData.transactionId || "");
                if (paymentData.paymentSlip) {
                    formData.append("paymentSlip", paymentData.paymentSlip);
                }
                formData.append("courseId", selectedCourse?._id);
                formData.append("sessionDate", selectedSession?.date);
                formData.append("startTime", selectedSession?.startTime);
                formData.append("endTime", selectedSession?.endTime);
 
                const res = await fetch("https://api.octosofttechnologies.in/api/enroll/enrollment", {
                    method: "POST",
                    body: formData,
                });
 
                const data = await res.json();
                studentId = data._id;
                localStorage.setItem("enrollId", studentId);
                slipUrl = data.courses?.[0]?.slipUrl || "";
            }
 
            const flowId = localStorage.getItem("flowId");
            if (!flowId) await createFlow(slipUrl);
 
            await sendBookingEmail();
 
            navigate("/booking-success", {
                state: {
                    selectedCourse,
                    courseDate: selectedSession?.date,
                    courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                    coursePrice,
                    paymentMethod: paymentData.paymentMethod,
                    email: paymentData.email,
                    name: paymentData.name,
                }
            });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false)  // ← loading stop
        }
        return;
    }
 
    if (step === 4) {
        if (enrollSection === 5) {
            if (!enrollRef.current) return;
            const error = await enrollRef.current.submitForm();
            if (error) { alert(error); return; }
            navigate("/booking-success", {
                state: { email: paymentData.email || userDetails.email }
            });
            return;
        }
        setEnrollSection(prev => prev + 1);
        return;
    }
 
    if (isCompanyEnroll && step === 2) {
        setStep(3);
    } else if (step < totalSteps) {
        setStep(prev => prev + 1);
    }
}

    return (
        <section className="enroll-page">

            {step !== 3 && (
                <>
                    <h1 className="title">Student Enrollment</h1>
                    <p className="subtitle">Complete all steps to enroll in your course</p>
                </>
            )}

            <div className="enroll-card">

                <p className="home-pg-btn" style={{ width: "fit-content", padding: "10px 20px" }} onClick={() => navigate("/")}>
                    Back to Home
                </p>

                {step !== 3 && (
                    <div className="stepper">
                        <div className="stepper-wo-pbar">
                            <div className={`step ${step >= 1 ? "active" : ""}`}>📖</div>
                            {enrollmentType === "individual" && (
                                <>
                                    <div className={`step ${step >= 2 ? "active" : ""}`}>💳</div>
                                    <div className={`step ${step >= 3 ? "active" : ""}`}>📋</div>
                                    <div className={`step ${step >= 4 ? "active" : ""}`}>📄</div>
                                </>
                            )}
                            {enrollmentType === "company" && (
                                <div className={`step ${step >= 2 ? "active" : ""}`}>💳</div>
                            )}
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <CourseSelection
                        enrollmentType={enrollmentType}
                        setEnrollmentType={setEnrollmentType}
                        selectedSession={selectedSession}
                        setSelectedSession={setSelectedSession}
                        selectedCourse={selectedCourse}
                        setSelectedCourse={setSelectedCourse}
                        hideEnrollmentType={isCompanyEnroll}
                    />
                )}

                {step === 2 && (
                    <Payment
                        selectedCourse={selectedCourse}
                        coursePrice={coursePrice}
                        setUserDetails={setUserDetails}
                        enrollmentType={enrollmentType}
                        setEnrollmentType={setEnrollmentType}
                        selectedSession={selectedSession}
                        setSelectedSession={setSelectedSession}
                        setIsValid={setIsPaymentValid}
                        triggerValidation={triggerValidation}
                        isCompanyEnroll={isCompanyEnroll}
                        setPaymentData={setPaymentData}
                        // ✅ CHANGE 3: activePaymentMethod sync பண்றோம்
                        onCardPayment={(ref) => {
                            cardPaymentRef.current = ref
                            setActivePaymentMethod(ref.paymentMethod)
                        }}
                    />
                )}

                {step === 3 && (
                    <CourseSelectionSuccess enrollmentData={{
                        selectedCourse,
                        courseDate: selectedSession?.date,
                        courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                        coursePrice,
                        paymentMethod: paymentData.paymentMethod,
                        email: paymentData.email,
                        name: paymentData.name,
                    }} />
                )}

                <div className={`next-wrapper ${step > 1 ? "has-prev" : ""}`}>

                    {step > 1 && step !== 3 && (
                        <button
                            className="prev-btn"
                            disabled={step === 4 && enrollSection === 1}
                            onClick={() => {
                                if (step === 4) {
                                    if (enrollSection > 1) setEnrollSection(prev => prev - 1);
                                    return;
                                }
                                setStep(prev => prev - 1);
                            }}
                        >
                            Previous
                        </button>
                    )}

                    {step !== 3 && (
                        <button
                            className="next-btn"
                            disabled={step === 1 && !selectedSession}
                            onClick={handleNext}
                        >
                            {getNextLabel()}
                        </button>
                    )}

                </div>

            </div>
            {isProcessing && (
                <Loading
                    message="Processing your payment"
                    sub="Please wait, do not close this page"
                />
            )}
        </section>
    );
}

export default BookNow;