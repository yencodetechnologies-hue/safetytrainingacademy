import React from "react";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../data/service";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);

  const studentId = user.id;
  localStorage.setItem("studentId", user.id);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("startLLN") === "true") {
      setShowAssessment(true);
      // Optional: clean up URL
      navigate("/student", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/student/dashboard/${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const resData = await res.json();
        setData(resData);
      } catch (err) {
        console.error(err);
        setError("Something went wrong da 😅");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [studentId, navigate]);

  const paymentVerified = data?.paymentVerified ?? false;
  const assessmentPassed = data?.assessmentPassed ?? false;
  const enrollmentFormSubmitted = data?.enrollmentFormSubmitted ?? false;
  const enrollmentFormApproved = data?.enrollmentFormApproved ?? false;
  const enrollmentFormRejected = data?.enrollmentFormRejected ?? false;
  const assessmentScore = data?.assessmentScore ?? null;

  const paymentMethod = data?.paymentMethod || "";
  const enrollmentType = data?.enrollmentType || "";

  const canTakeAssessment = paymentVerified; // Must pay before taking assessment


  const handleAssessmentComplete = () => {
    // We don't necessarily need to hide the assessment if we're navigating away,
    // but doing so ensures the dashboard state is clean if they come back.
    setShowAssessment(false);

    const fetchDashboardAndRedirect = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/dashboard/${studentId}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const resData = await res.json();
        setData(resData);

        // ✅ Redirect immediately if passed and form not yet submitted
        if (resData.assessmentPassed && !resData.enrollmentFormSubmitted) {
          navigate("/student/enrollment-form");
        }
      } catch (err) {
        console.error("Redirect fetch error:", err);
      }
    };
    
    fetchDashboardAndRedirect();
  };

  const handleRestrictedClick = (targetPath, state = {}) => {
    if (assessmentPassed && (!enrollmentFormSubmitted || enrollmentFormRejected)) {
      alert("Please complete or update your enrollment form before continuing.");
      navigate("/student/enrollment-form");
      return;
    }
    navigate(targetPath, state);
  };

  if (showAssessment) {
    return (
      <LLNDAssessment
        onComplete={handleAssessmentComplete}
        flowId={data.latestFlowId}
        userDetails={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">
          Welcome Back! <span className="wave">👋</span>
        </h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your courses today.
        </p>
      </div>

      <div className="dashboard-alerts">
        {/* LLND Assessment Alert (NOW BACK TO TOP) */}
        {!assessmentPassed ? (
          <div className="alert alert-danger">
            <div className="alert-icon-wrap">📖</div>
            <div className="alert-body">
              <span className="alert-badge">Action required</span>
              <p className="alert-title">LLND Assessment Required</p>
              <p className="alert-desc">
                Complete the LLND assessment to fully activate your enrollment
              </p>
            </div>
            <button
              className="alert-action-btn"
              onClick={() => {
                setShowAssessment(true);
              }}
            >
              📋 Take Assessment
            </button>
          </div>
        ) : (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-body">
              <p className="alert-title">Pre-Enrollment Assessment Passed</p>
              <p className="alert-desc">
                Score: {assessmentScore}%
              </p>
            </div>
          </div>
        )}

        {/* Enrollment Form Alert (NOW BELOW LLND) */}
        {!enrollmentFormSubmitted ? (
          <div className="alert alert-danger">
            <div className="alert-icon-wrap">📄</div>
            <div className="alert-body">
              <span className="alert-badge">Action required</span>
              <p className="alert-title">Enrollment Form Required</p>
              <p className="alert-desc">
                Complete your enrollment form to finalize your course registration
              </p>
            </div>
            <button
              className="alert-action-btn"
              onClick={() => {
                navigate("/student/enrollment-form");
              }}
            >
              📝 Complete Form
            </button>
          </div>
        ) : enrollmentFormRejected ? (
          <div className="alert alert-danger">
            <div className="alert-icon-wrap">❌</div>
            <div className="alert-body">
              <span className="alert-badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>Form Rejected</span>
              <p className="alert-title">Enrollment Form Needs Update</p>
              <p className="alert-desc">
                Your enrollment form was rejected. Please review and update your details.
              </p>
            </div>
            <button
              className="alert-action-btn"
              onClick={() => {
                navigate("/student/enrollment-form");
              }}
            >
              🔄 Resubmit Form
            </button>
          </div>
        ) : !enrollmentFormApproved ? (
          <div className="alert alert-warning">
            <span className="alert-icon">⏳</span>
            <div className="alert-body">
              <span className="alert-badge" style={{ background: "#fef9c3", color: "#ca8a04" }}>Awaiting Review</span>
              <p className="alert-title">Enrollment Form Submitted</p>
              <p className="alert-desc">
                Your form has been received and is currently being reviewed by our team.
              </p>
              <button
                className="alert-link"
                onClick={() => navigate("/student/enrollment-form")}
              >
                View Submitted Form
              </button>
            </div>
          </div>
        ) : (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-body">
              <p className="alert-title">Enrollment Form Approved</p>
              <p className="alert-desc">
                Your enrollment form has been approved.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions-card">
        <h2 className="quick-actions-title">Quick Actions</h2>
        <div className="quick-actions-list">

          {/* ✅ Navigate to My Courses → Browse Courses tab */}
          <button
            className="quick-action-btn"
            disabled={!canTakeAssessment}
            onClick={() => handleRestrictedClick("/student/my-courses", { state: { tab: "browse" } })}
          >
            <span className="qa-icon">📖</span>
            <span>Enroll in New Course</span>
          </button>

          <button className="quick-action-btn" onClick={() => handleRestrictedClick("/student/certificates")}>
            <span className="qa-icon">🏅</span>
            <span>Download Certificates</span>
          </button>

          <button className="quick-action-btn" onClick={() => handleRestrictedClick("/student/results")}>
            <span className="qa-icon">📈</span>
            <span>View Results</span>
          </button>

        </div>
      </div>
    </div>
  );
}