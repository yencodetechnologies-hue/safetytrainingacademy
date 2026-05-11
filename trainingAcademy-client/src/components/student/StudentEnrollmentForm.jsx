import { useState, useEffect, useRef } from "react";
import "./StudentEnrollmentForm.css";
import EnrollmentRegister from "../enrollmrntRegister/EnrollmentRegister";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../data/service";

export default function StudentEnrollmentForm() {

  const [userDetails, setUserDetails] = useState(null);
  const [savedFormData, setSavedFormData] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [assessmentPassed, setAssessmentPassed] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const enrollmentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const studentId = user?.id;

        if (!studentId) throw new Error("Student ID not found. Please login again.");

        const [userRes, formRes, dashRes] = await Promise.all([
          fetch(`${API_URL}/api/students/enrollment/${studentId}`),
          fetch(`${API_URL}/api/enrollment-form?studentId=${studentId}`),
          fetch(`${API_URL}/api/student/dashboard/${studentId}`)
        ]);

        if (!userRes.ok) throw new Error("Failed to fetch user details");

        const userData = await userRes.json();
        setUserDetails(userData);

        if (formRes.ok) {
          const formData = await formRes.json();
          if (formData.length > 0) {
            const data = formData[0];``
            if (data?.personalDetails?.dob) {
              data.personalDetails.dob = data.personalDetails.dob.split("T")[0];
            }
            setSavedFormData(data);
          }
        }

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setPaymentVerified(dashData.paymentVerified === true);
          setAssessmentPassed(dashData.assessmentPassed === true);
          setEnrollmentType(dashData.enrollmentType || "");
          setPaymentMethod(dashData.paymentMethod || "");
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const error = await enrollmentRef.current?.submitForm();
      if (error) {
        alert(error);
        return;
      }

      const flowId = localStorage.getItem("flowId");
      if (!flowId) {
        alert("Flow ID not found. Please start enrollment again.");
        return;
      }

      const res = await fetch(`${API_URL}/api/flow/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit enrollment");
      }

      navigate("/enrollment-success");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userDetails) return <div>No user details found.</div>;

  const canAccess = true; // Bypassed verification as per user request


  if (!canAccess) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ color: "#e53e3e", marginBottom: "8px" }}>Payment Verification Required</h2>
        <p style={{ color: "#666", marginBottom: "24px", maxWidth: "400px" }}>
          Please wait until admin verifies your payment before completing the enrollment form.
        </p>
        <button
          onClick={() => navigate("/student")}
          style={{
            padding: "10px 24px",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (!assessmentPassed) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
        <h2 style={{ color: "#e53e3e", marginBottom: "8px" }}>LLND Assessment Required</h2>
        <p style={{ color: "#666", marginBottom: "24px", maxWidth: "400px" }}>
          Please complete and pass the LLND Assessment before filling the enrollment form.
        </p>
        <button
          onClick={() => navigate("/student")}
          style={{
            padding: "10px 24px",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <section>
      <EnrollmentRegister
        ref={enrollmentRef}
        userDetails={userDetails}
        savedFormData={savedFormData}
        section={step}
        setSection={setStep}
      />
      <div className={`next-wrapper ${step > 1 ? "has-prev" : ""}`}>

        {step > 1 && (
          <button className="prev-btn" onClick={() => setStep(prev => prev - 1)}>
            Previous
          </button>
        )}

        {step < totalSteps ? (
          <button className="next-btn" onClick={async () => {
            await enrollmentRef.current?.saveSection(step)
            setStep(prev => prev + 1)
          }}>
            Next
          </button>
        ) : (
          <button
            className="next-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}

      </div>
    </section>
  );
}