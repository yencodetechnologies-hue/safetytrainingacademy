import React from "react";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/student/dashboard/${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const resData = await res.json();
        setData(resData);
        if (resData.latestFlowId) {
          localStorage.setItem("flowId", resData.latestFlowId);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong da 😅");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [studentId]);

  const paymentVerified = data?.paymentVerified ?? false;
  const assessmentPassed = data?.assessmentPassed ?? false;
  const enrollmentFormApproved = data?.enrollmentFormApproved ?? false;
  const assessmentScore = data?.assessmentScore ?? null;
  
  const paymentMethod = data?.paymentMethod || "";
  const enrollmentType = data?.enrollmentType || "";

  const canTakeAssessment = true; // Bypassed verification as per user request


  const handleAssessmentComplete = () => {
    setShowAssessment(false);

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
      }
    };
    fetchDashboard();
  };

  if (showAssessment) {
    return (
      <LLNDAssessment
        onComplete={handleAssessmentComplete}
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

        {/* LLND Assessment Alert */}
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
                if (!canTakeAssessment) {
                  alert("Please wait until admin verifies your bank transfer payment before taking the assessment.");
                  return;
                }
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
                Score: {assessmentScore}% – You can now enroll in courses.
              </p>
            </div>
          </div>
        )}

        {/* Enrollment Form Alert */}
        {!enrollmentFormApproved ? (
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
                if (!assessmentPassed) {
                  alert("Please complete and pass the LLND Assessment before filling the enrollment form.");
                  return;
                }
                navigate("/student/enrollment-form");
              }}
            >
              📋 Complete Form
            </button>
          </div>
        ) : (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-body">
              <p className="alert-title">Enrollment Form Approved</p>
              <p className="alert-desc">
                Your enrollment form has been approved.
              </p>
              <button
                className="alert-link"
                onClick={() => navigate("/student/enrollment-form")}
              >
                View Form
              </button>
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
            onClick={() => navigate("/student/my-courses", { state: { tab: "browse" } })}
          >
            <span className="qa-icon">📖</span>
            <span>Enroll in New Course</span>
          </button>

          <button className="quick-action-btn" onClick={() => navigate("/student/certificates")}>
            <span className="qa-icon">🏅</span>
            <span>Download Certificates</span>
          </button>

          <button className="quick-action-btn" onClick={() => navigate("/student/results")}>
            <span className="qa-icon">📈</span>
            <span>View Results</span>
          </button>

        </div>
      </div>
    </div>
  );
}