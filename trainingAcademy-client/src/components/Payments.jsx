import React, { useState } from 'react';
import { useEffect } from "react";
import axios from "axios";
import '../styles/Payments.css';

const Payment = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");

  const openReview = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const formatStatus = (status) => {
    if (status === "success") return "Verified";
    if (status === "pending") return "Pending";
    if (status === "failed") return "Rejected";
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://72.61.236.154:8000/api/flow/payments");

      setPayments(res.data.payments);
      setStats(res.data.stats);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    await axios.put(
      `http://72.61.236.154:8000/api/flow/payment/${selectedPayment.enrollmentId}/${selectedPayment.itemId}`,
      { status: "success" }
    );

    fetchPayments();
  };


  const handleReject = async () => {
    try {
      if (!selectedPayment?.enrollmentId || !selectedPayment?.itemId) {
        alert("Invalid payment data");
        return;
      }

      if (!rejectionReason) {
        alert("Enter rejection reason");
        return;
      }

      await axios.put(
        `http://72.61.236.154:8000/api/flow/payment/${selectedPayment.enrollmentId}/${selectedPayment.itemId}`,
        {
          status: "failed",
          reason: rejectionReason
        }
      );

      fetchPayments();

    } catch (err) {
      console.error("Reject Error:", err);
    }
  };

  return (
    <div className="payment-container">
      <header className="payment-header">
        <h2>Payment Management</h2>
        <p>Track and manage course payments and verify student receipts</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>Payment Receipt Verification</h3>
          <button className="refresh-btn" onClick={fetchPayments}>🔄 Refresh</button>
        </div>

        <div className="table-responsive">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Booking date</th>
                <th>Student</th>
                <th>Course</th>
                <th>Shedule Date</th>
                <th>Individual/Company</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Payment date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p,index) => (
                <tr key={p.id || p.transId || index}>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>
                    <div className="student-info">
                      <span className="name">{p.student}</span>
                      <span className="email">{p.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="course-info">
                      <span className="course-name">{p.course}</span>
                    </div>
                  </td>
                  <td>{p.sessionDate ? new Date(p.sessionDate).toLocaleDateString() : "—"}</td> 
                  <td>{p.type || "Individual"}</td>
                  <td>{p.transId || "—"}</td>        
                  <td className="amount">${p.amount}</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${formatStatus(p.status).toLowerCase()}`}>
                      {formatStatus(p.status)}
                    </span>
                  </td>
                  <td>
                    <button className="review-btn" onClick={() => openReview(p)}>👁 Review</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Review Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Payment Receipt Review</h3>
              <button onClick={() => setShowModal(false)} className="close-x">×</button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div className="info-box">
                  <h4>Student Information</h4>
                  <p><strong>Name:</strong> {selectedPayment.student}</p>
                  <p><strong>Email:</strong> {selectedPayment.email}</p>
                </div>
                <div className="info-box">
                  <h4>Course Information</h4>
                  <p><strong>Course:</strong> {selectedPayment.course}</p>
                  <p><strong>Price:</strong> ${selectedPayment.amount}</p>
                </div>
              </div>

              <div className="transaction-details">
                <h4>Transaction Details</h4>
                <div className="detail-row">
                  <p><strong>Amount:</strong> <span className="text-green">${selectedPayment.amount}</span></p>
                  <p><strong>Transaction ID:</strong> {selectedPayment.transId}</p>
                </div>
              </div>

              <div className="receipt-preview">
                <div className="receipt-header">
                  {/* <span>Payment Receipt</span>
                  
                  <button className="download-btn">Download Receipt</button> */}
                </div>
                <img className="receipt-header-img" src={selectedPayment.slipUrl} alt="Receipt" />
                <div className="pdf-placeholder">
                  <p>PDF Document</p>
                  <button className="open-pdf" onClick={() => window.open(selectedPayment.slipUrl, "_blank")}>
                    Open PDF in New Tab
                  </button>
                </div>
              </div>

              <div className="rejection-section">
                <label>Rejection Reason (if rejecting)</label>
                <input
                  type="text"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button className="btn-reject" onClick={() => {
                handleReject()
                setShowModal(false)
              }}>Reject</button>
              <button className="btn-verify" onClick={() => {
                handleVerify()
                setShowModal(false)
              }}>Verify Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;