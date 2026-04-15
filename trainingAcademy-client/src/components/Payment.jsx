import { useState } from "react"
import "../styles/Payment.css"
import { useEffect } from "react"

function Payment({ selectedCourse, setUserDetails, onNext, onPrev, courseDate, coursePrice, setIsValid, triggerValidation, isCompanyEnroll, setPaymentData }) {

    const [paymentMethod, setPaymentMethod] = useState("bank")

    // Personal Details State
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [agreed, setAgreed] = useState(false)

    // Bank Transfer State
    const [transactionId, setTransactionId] = useState("")
    const [paymentSlip, setPaymentSlip] = useState(null)

    // Card Payment State
    const [cardName, setCardName] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [expiryMonth, setExpiryMonth] = useState("")
    const [expiryYear, setExpiryYear] = useState("")
    const [cvv, setCvv] = useState("")
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState(false)

    // ✅ eWAY Payment Status State (NEW - no UI change, just state)
    const [paymentStatus, setPaymentStatus] = useState(null) // null | "loading" | "success" | "error"
    const [paymentError, setPaymentError] = useState("")
    const [ewayTransactionId, setEwayTransactionId] = useState("")

    // Errors State
    useEffect(() => {
        if (!name && !email && !phone) return

        setUserDetails(prev => ({
            ...prev,
            name,
            email,
            phone
        }))
    }, [name, email, phone])

    useEffect(() => {
        const fullData = {
            name,
            email,
            phone,
            agreed,
            paymentMethod,
            transactionId,
            paymentSlip,
            cardName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv
        };

        setPaymentData(fullData);

    }, [
        name, email, phone, agreed,
        paymentMethod,
        transactionId, paymentSlip,
        cardName, cardNumber,
        expiryMonth, expiryYear, cvv
    ]);

    
    const validate = () => {
        const newErrors = {}

        if (!name.trim()) newErrors.name = "Full name is required"
        if (!phone.trim()) newErrors.phone = "Phone number is required"
        if (!email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"
        if (!agreed) newErrors.agreed = "Please agree to the terms"

        if (paymentMethod === "Bank Transfer") {
            if (!isCompanyEnroll && !transactionId.trim()) newErrors.transactionId = "Transaction ID is required"
            if (!isCompanyEnroll && !paymentSlip) newErrors.paymentSlip = "Payment slip is required"
        }

        if (paymentMethod === "Card Payment") {
            if (!isCompanyEnroll && !cardName.trim()) newErrors.cardName = "Name on card is required"
            if (!isCompanyEnroll && !cardNumber.trim()) newErrors.cardNumber = "Card number is required"
            if (!isCompanyEnroll && !expiryMonth) newErrors.expiryMonth = "Expiry month is required"
            if (!isCompanyEnroll && !expiryYear) newErrors.expiryYear = "Expiry year is required"
            if (!isCompanyEnroll && !cvv.trim()) newErrors.cvv = "CVV is required"
        }

        // ONLY show errors when triggered
        if (triggerValidation) {
            setErrors(newErrors)
        }

        return Object.keys(newErrors).length === 0
    }

    const handleContinue = () => {

        setTouched(true)
        if (validate()) {
            setUserDetails(prev => ({
                ...prev,
                name,
                email,
                phone
            }))
        }

    }

    useEffect(() => {
        const isValid = validate()
        if (setIsValid) setIsValid(isValid)
    }, [name, phone, email, agreed, transactionId, paymentSlip, cardName, cardNumber, expiryMonth, expiryYear, cvv, paymentMethod, triggerValidation])

    // ✅ eWAY Card Payment Handler (NEW)
    const handleCardPayment = async () => {
        // Re-use existing validate logic
        const newErrors = {}
        if (!name.trim()) newErrors.name = "Full name is required"
        if (!phone.trim()) newErrors.phone = "Phone number is required"
        if (!email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"
        if (!agreed) newErrors.agreed = "Please agree to the terms"
        if (!cardName.trim()) newErrors.cardName = "Name on card is required"
        if (!cardNumber.trim()) newErrors.cardNumber = "Card number is required"
        if (!expiryMonth) newErrors.expiryMonth = "Expiry month is required"
        if (!expiryYear) newErrors.expiryYear = "Expiry year is required"
        if (!cvv.trim()) newErrors.cvv = "CVV is required"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setPaymentStatus("loading")
        setPaymentError("")

        try {
            const response = await fetch("/api/payment/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cardName,
                    cardNumber,
                    expiryMonth,
                    expiryYear,
                    cvv,
                    amount: coursePrice || selectedCourse?.sellingPrice || "0",
                    email,
                    name,
                    phone,
                    userId: phone,
                }),
            })

            const result = await response.json()

            if (result.success) {
                setPaymentStatus("success")
                setEwayTransactionId(result.transactionId)
                // Update paymentData with eWAY transaction info
                setPaymentData(prev => ({
                    ...prev,
                    ewayTransactionId: result.transactionId,
                    paymentConfirmed: true,
                }))
                // Move to next step after short delay
                setTimeout(() => onNext(), 1500)
            } else {
                setPaymentStatus("error")
                setPaymentError(result.message || "Payment failed. Please try again.")
            }
        } catch (err) {
            setPaymentStatus("error")
            setPaymentError("Network error. Please check your connection and try again.")
        }
    }

    return (

        <div className="payment-wrapper">

            {/* Step Header */}

            <div className="payment-header">
                <h3>Step 2: Payment</h3>
                <p>Enter your details and choose your payment method</p>
            </div>

            {/* Personal Details */}

            <div className="payment-card">

                <h4>Personal Details</h4>

                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                        type="text"
                        placeholder="+61 xxx xxx xxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="terms">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>I agree to the terms and conditions and understand my information will be used for enrollment purposes</span>
                </div>
                {errors.agreed && <span className="error-text">{errors.agreed}</span>}

            </div>

            {/* Order Summary */}

            <div className="summary-card">

                <h4>Order Summary</h4>

                <div className="summary-row">
                    <span>Course:</span>
                    <span>
                        {selectedCourse
                            ? `${selectedCourse.courseCode} - ${selectedCourse.title}`
                            : "Select a course"}
                    </span>
                </div>

                <div className="summary-row">
                    <span>Duration:</span>
                    <span>{selectedCourse?.duration || "0"}</span>
                </div>

                <div className="summary-row total">
                    <span>Total:</span>
                    <span>
                        ${coursePrice || selectedCourse?.sellingPrice || "0"}
                    </span>
                </div>

            </div>

            {/* Payment Method */}
            {!isCompanyEnroll && (
                <div className="payment-method">

                    <label>Select Payment Method *</label>

                    <div
                        className={`method-card ${paymentMethod === "Bank Transfer" ? "active" : ""}`}
                        onClick={() => setPaymentMethod("Bank Transfer")}
                    >
                        <input type="radio" checked={paymentMethod === "Bank Transfer"} readOnly />
                        <div>
                            <strong>Bank Transfer</strong>
                            <p>Transfer to our bank account - pay later</p>
                        </div>
                    </div>

                    <div
                        className={`method-card ${paymentMethod === "Card Payment" ? "active" : ""}`}
                        onClick={() => setPaymentMethod("Card Payment")}
                    >
                        <input type="radio" checked={paymentMethod === "Card Payment"} readOnly />
                        <div>
                            <strong>Credit Card - Pay Now</strong>
                            <p>Pay securely with your card online</p>
                        </div>
                    </div>

                </div>
            )}


            {/* Bank Details */}
            {!isCompanyEnroll && paymentMethod === "Bank Transfer" && (
                <div className="bank-details">

                    <h4>Bank Details</h4>

                    <div className="bank-row">
                        <span>Bank:</span>
                        <span>Commonwealth Bank</span>
                    </div>

                    <div className="bank-row">
                        <span>Account Name:</span>
                        <span>AIET College</span>
                    </div>

                    <div className="bank-row">
                        <span>BSB:</span>
                        <span>062 141</span>
                    </div>

                    <div className="bank-row">
                        <span>Account No:</span>
                        <span>10490235</span>
                    </div>

                    <div className="form-group">
                        <label>Transaction ID / Reference *</label>
                        <input
                            type="text"
                            placeholder="Enter your bank transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                        {errors.transactionId && <span className="error-text">{errors.transactionId}</span>}
                    </div>

                    <div className="form-group">
                        <label>Payment slip upload *</label>
                        <input
                            type="file"
                            onChange={(e) => setPaymentSlip(e.target.files[0])}
                        />
                        {errors.paymentSlip && <span className="error-text">{errors.paymentSlip}</span>}
                    </div>

                    <p className="bank-note">
                        Please use your name and course code as the payment reference.
                    </p>

                </div>
            )}


            {/* Card Payment */}

            {!isCompanyEnroll && paymentMethod === "Card Payment" && (

                <div className="card-payment">

                    <div className="secure-box">
                        <div className="secure-left">
                            🔒 <strong>Secure Payment</strong>
                            <p>Your card details are encrypted and secure</p>
                        </div>
                        <div className="pci">
                            🛡 PCI Compliant
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Name on Card *</label>
                        <input
                            type="text"
                            placeholder="JOHN SMITH"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                        />
                        {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Card Number *</label>
                        <input
                            type="text"
                            placeholder="4111 1111 1111 1111"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                        />
                        {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                    </div>

                    <div className="card-row">

                        <div className="form-group">
                            <label>Expiry Month *</label>
                            <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)}>
                                <option value="">MM</option>
                                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
                        </div>

                        <div className="form-group">
                            <label>Expiry Year *</label>
                            <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)}>
                                <option value="">YY</option>
                                {["2025", "2026", "2027", "2028", "2029"].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
                        </div>

                    </div>

                    <div className="form-group">
                        <label>CVV *</label>
                        <input
                            type="password"
                            placeholder="???"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                        />
                        {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                    </div>

                    <div className="card-logos">
                        <span>We accept:</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="master" />
                    </div>

                    {/* ✅ eWAY Status Messages (NEW - shown only after Pay Now click) */}
                    {paymentStatus === "success" && (
                        <div className="payment-success">
                            ✅ Payment Successful! Transaction ID: <strong>{ewayTransactionId}</strong>
                        </div>
                    )}

                    {paymentStatus === "error" && (
                        <div className="payment-error">
                            ❌ {paymentError}
                        </div>
                    )}

                    {/* ✅ Pay Now Button (NEW) */}
                    <button
                        className="pay-now-btn"
                        onClick={handleCardPayment}
                        disabled={paymentStatus === "loading" || paymentStatus === "success"}
                    >
                        {paymentStatus === "loading"
                            ? "⏳ Processing Payment..."
                            : paymentStatus === "success"
                            ? "✅ Payment Complete"
                            : `💳 Pay Now $${coursePrice || selectedCourse?.sellingPrice || "0"}`}
                    </button>

                </div>

            )}

            {/* Warning */}

            <div className="payment-warning">
                Note: After completing the payment step, you will proceed to the LLND Assessment and then the Enrollment Form.
            </div>

            {/* Buttons */}


        </div>

    )

}

export default Payment