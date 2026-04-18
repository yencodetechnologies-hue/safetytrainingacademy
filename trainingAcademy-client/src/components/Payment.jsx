import { useState } from "react"
import "../styles/Payment.css"
import { useEffect } from "react"
import * as Yup from "yup"
import Loading from "../components/Loading"

// ── Yup Schemas ───────────────────────────────────────────────────
const personalSchema = Yup.object({
    name:   Yup.string().trim().required("Full name is required"),
    phone:  Yup.string().trim().required("Phone number is required"),
    email:  Yup.string().trim().required("Email is required").email("Enter a valid email"),
    agreed: Yup.boolean().oneOf([true], "Please agree to the terms and conditions"),
})

const bankSchema = Yup.object({
    transactionId: Yup.string().trim().required("Transaction ID is required"),
    paymentSlip:   Yup.mixed().required("Payment slip is required"),
})

const cardSchema = Yup.object({
    cardName:    Yup.string().trim().required("Name on card is required"),
    cardNumber:  Yup.string().trim().required("Card number is required"),
    expiryMonth: Yup.string().required("Expiry month is required"),
    expiryYear:  Yup.string().required("Expiry year is required"),
    cvv:         Yup.string().trim().required("CVV is required"),
})

async function runSchema(schema, values) {
    try {
        await schema.validate(values, { abortEarly: false })
        return {}
    } catch (err) {
        const errs = {}
        err.inner.forEach(e => { errs[e.path] = e.message })
        return errs
    }
}

function Payment({ selectedCourse, setUserDetails, onNext, onPrev, courseDate, coursePrice, setIsValid, triggerValidation, isCompanyEnroll, setPaymentData, onCardPayment }) {

    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer")

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

    // eWAY Payment Status State
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [paymentError, setPaymentError] = useState("")
    const [ewayTransactionId, setEwayTransactionId] = useState("")

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

    // ── FIX 1: overrideValues support — checkbox/file stale state bypass ──
    const getFullErrors = async (overrideValues = {}) => {
        const vals = {
            name, phone, email, agreed,
            transactionId, paymentSlip,
            cardName, cardNumber, expiryMonth, expiryYear, cvv,
            ...overrideValues,
        }

        const personalErrors = await runSchema(personalSchema, {
            name: vals.name, phone: vals.phone,
            email: vals.email, agreed: vals.agreed,
        })

        let methodErrors = {}
        if (!isCompanyEnroll) {
            if (paymentMethod === "Bank Transfer") {
                methodErrors = await runSchema(bankSchema, {
                    transactionId: vals.transactionId,
                    paymentSlip:   vals.paymentSlip,
                })
            } else if (paymentMethod === "Card Payment") {
                methodErrors = await runSchema(cardSchema, {
                    cardName:    vals.cardName,
                    cardNumber:  vals.cardNumber,
                    expiryMonth: vals.expiryMonth,
                    expiryYear:  vals.expiryYear,
                    cvv:         vals.cvv,
                })
            }
        }

        return { ...personalErrors, ...methodErrors }
    }

    const validate = () => {
        getFullErrors().then(errs => {
            if (triggerValidation) setErrors(errs)
            if (setIsValid) setIsValid(Object.keys(errs).length === 0)
        })
        return Object.keys(errors).length === 0
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

    // ── FIX 2: triggerValidation false-ஆ இருக்கும்போது errors set பண்ணாதே ──
    // Page load-ல் triggerValidation=false → errors காட்டாது
    // Pay Now click பண்ணா triggerValidation=true → errors காட்டும்
    useEffect(() => {
        getFullErrors().then(errs => {
            if (setIsValid) setIsValid(Object.keys(errs).length === 0)
            if (triggerValidation) setErrors(errs)
        })
    }, [name, phone, email, agreed, transactionId, paymentSlip, cardName, cardNumber, expiryMonth, expiryYear, cvv, paymentMethod, triggerValidation])

    // ── onBlur: field touch பண்ணா மட்டும் அந்த field error காட்டு ──
    // overrideValues → checkbox/file latest value direct pass பண்ண
    const handleBlur = async (field, overrideValues = {}) => {
        const allErrors = await getFullErrors(overrideValues)
        setErrors(prev => ({
            ...prev,
            [field]: allErrors[field] || undefined,
        }))
    }

    // eWAY Card Payment Handler
    const handleCardPayment = async () => {
        const newErrors = await getFullErrors()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return false
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
                setPaymentData(prev => ({
                    ...prev,
                    ewayTransactionId: result.transactionId,
                    paymentConfirmed: true,
                }))
                return true
            } else {
                setPaymentStatus("error")
                setPaymentError(result.message || "Your card was declined. Please contact your bank or try a different payment method.")
                return false
            }
        } catch (err) {
            setPaymentStatus("error")
            setPaymentError("Network error. Please check your connection and try again.")
            return false
        }
    }

    useEffect(() => {
        if (onCardPayment) {
            onCardPayment({
                trigger: handleCardPayment,
                paymentMethod,
                paymentStatus
            })
        }
    }, [paymentMethod, paymentStatus, name, phone, email, agreed, cardName, cardNumber, expiryMonth, expiryYear, cvv])

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
                        onBlur={() => handleBlur("name")}
                        className={errors.name ? "input-error" : ""}
                    />
                    {errors.name && <span className="error-text">⚠ {errors.name}</span>}
                </div>

                <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                        type="text"
                        placeholder="+61 xxx xxx xxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={errors.phone ? "input-error" : ""}
                    />
                    {errors.phone && <span className="error-text">⚠ {errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <span className="error-text">⚠ {errors.email}</span>}
                </div>

                <div className="terms">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                            setAgreed(e.target.checked)
                            // ✅ FIX: latest checked value pass — stale state bypass
                            handleBlur("agreed", { agreed: e.target.checked })
                        }}
                    />
                    <span>I agree to the terms and conditions and understand my information will be used for enrollment purposes</span>
                </div>
                {errors.agreed && <span className="error-text">⚠ {errors.agreed}</span>}

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
                    <span>${coursePrice || selectedCourse?.sellingPrice || "0"}</span>
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
                            onBlur={() => handleBlur("transactionId")}
                            className={errors.transactionId ? "input-error" : ""}
                        />
                        {errors.transactionId && <span className="error-text">⚠ {errors.transactionId}</span>}
                    </div>

                    <div className="form-group">
                        <label>Payment slip upload *</label>
                        <input
                            type="file"
                            onChange={(e) => {
                                setPaymentSlip(e.target.files[0])
                                // ✅ FIX: file object pass — stale state bypass
                                handleBlur("paymentSlip", { paymentSlip: e.target.files[0] })
                            }}
                            className={errors.paymentSlip ? "input-error" : ""}
                        />
                        {errors.paymentSlip && <span className="error-text">⚠ {errors.paymentSlip}</span>}
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
                            onBlur={() => handleBlur("cardName")}
                            className={errors.cardName ? "input-error" : ""}
                        />
                        {errors.cardName && <span className="error-text">⚠ {errors.cardName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Card Number *</label>
                        <input
                            type="text"
                            placeholder="4111 1111 1111 1111"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            onBlur={() => handleBlur("cardNumber")}
                            className={errors.cardNumber ? "input-error" : ""}
                        />
                        {errors.cardNumber && <span className="error-text">⚠ {errors.cardNumber}</span>}
                    </div>

                    <div className="card-row">

                        <div className="form-group">
                            <label>Expiry Month *</label>
                            <select
                                value={expiryMonth}
                                onChange={(e) => setExpiryMonth(e.target.value)}
                                onBlur={() => handleBlur("expiryMonth")}
                                className={errors.expiryMonth ? "input-error" : ""}
                            >
                                <option value="">MM</option>
                                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {errors.expiryMonth && <span className="error-text">⚠ {errors.expiryMonth}</span>}
                        </div>

                        <div className="form-group">
                            <label>Expiry Year *</label>
                            <select
                                value={expiryYear}
                                onChange={(e) => setExpiryYear(e.target.value)}
                                onBlur={() => handleBlur("expiryYear")}
                                className={errors.expiryYear ? "input-error" : ""}
                            >
                                <option value="">YY</option>
                                {["2025", "2026", "2027", "2028", "2029"].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            {errors.expiryYear && <span className="error-text">⚠ {errors.expiryYear}</span>}
                        </div>

                    </div>

                    <div className="form-group">
                        <label>CVV *</label>
                        <input
                            type="password"
                            placeholder="???"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            onBlur={() => handleBlur("cvv")}
                            className={errors.cvv ? "input-error" : ""}
                        />
                        {errors.cvv && <span className="error-text">⚠ {errors.cvv}</span>}
                    </div>

                    <div className="card-logos">
                        <span>We accept:</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="master" />
                    </div>

                    {/* ✅ Success Message */}
                    {paymentStatus === "success" && (
                        <div className="payment-success">
                            ✅ Payment Successful! Transaction ID: <strong>{ewayTransactionId}</strong>
                        </div>
                    )}

                    {/* ✅ Error Card */}
                    {paymentStatus === "error" && (
                        <div className="payment-error-card">
                            <div className="payment-error-card-header">
                                <div className="payment-error-card-title">
                                    <span>⚠️</span>
                                    <strong>Payment failed</strong>
                                </div>
                                <button
                                    className="payment-error-close"
                                    onClick={() => setPaymentStatus(null)}
                                >✕</button>
                            </div>
                            <p className="payment-error-message">
                                {paymentError || "Your card was declined. Please contact your bank or try a different payment method."}
                            </p>
                            <button
                                className="try-again-btn"
                                onClick={() => setPaymentStatus(null)}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Loading handled by Loading component (full screen) */}

                </div>

            )}

            {paymentStatus === "loading" && <Loading message="Processing your payment" sub="Please wait, do not close this page" />}

            {/* Warning */}
            <div className="payment-warning">
                Note: After completing the payment step, you will proceed to the LLND Assessment and then the Enrollment Form.
            </div>

            {/* Buttons - intentionally empty, BookNow controls navigation */}

        </div>

    )

}

export default Payment