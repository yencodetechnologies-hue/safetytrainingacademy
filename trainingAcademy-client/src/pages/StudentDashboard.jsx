import React from "react";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import { useNavigate } from "react-router-dom";

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
          `http://72.61.236.154:8000/api/student/dashboard/${studentId}`
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
  }, [studentId]);

  const paymentVerified = data?.paymentVerified ?? false; // 🔥 NEW
  const assessmentPassed = data?.assessmentPassed ?? false;
  const enrollmentFormApproved = data?.enrollmentFormApproved ?? false;
  const assessmentScore = data?.assessmentScore ?? null;

  const handleAssessmentComplete = () => {
    setShowAssessment(false);

    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `http://72.61.236.154:8000/api/student/dashboard/${studentId}`
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

        {/* 🔥 PAYMENT CHECK FIRST */}
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
                // ✅ Payment pending ஆனா alert காட்டு
                if (!paymentVerified) {
                  alert("Please wait until admin verifies your payment before taking the assessment.");
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
                // ✅ Payment pending ஆனா alert காட்டு
                if (!paymentVerified) {
                  alert("Please wait until admin verifies your payment before completing the enrollment form.");
                  return;
                }
                // ✅ ADD THIS CHECK
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

          {/* 🔥 DISABLED UNTIL PAYMENT VERIFIED */}
          <button className="quick-action-btn" disabled={!paymentVerified}>
            <span className="qa-icon">📖</span>
            <span>Enroll in New Course</span>
          </button>

          <button className="quick-action-btn">
            <span className="qa-icon">🏅</span>
            <span>Download Certificates</span>
          </button>

          <button className="quick-action-btn">
            <span className="qa-icon">📈</span>
            <span>View Results</span>
          </button>

        </div>
      </div>
    </div>
  );
}