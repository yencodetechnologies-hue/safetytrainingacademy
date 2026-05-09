const VocSubmission = require("../models/VocSubmission")
const sendEmail = require("../config/sendEmail")

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const parseCourses = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const sanitizeCard = (cardRaw) => {
    if (!cardRaw) return { name: "", last4: "", expiryMonth: "", expiryYear: "" }
    const c = typeof cardRaw === "string" ? safeJson(cardRaw) : cardRaw
    return {
        name:        String(c.name || "").trim(),
        last4:       String(c.last4 || "").replace(/\D/g, "").slice(-4),
        expiryMonth: String(c.expiryMonth || "").trim().slice(0, 2),
        expiryYear:  String(c.expiryYear  || "").trim().slice(0, 4),
    }
}

const safeJson = (str) => {
    try { return JSON.parse(str) } catch { return {} }
}

// Reuses the VOC confirmation HTML body from bookingEmailController so we have
// one source of truth for the brand template.
const sendVocConfirmationEmail = async ({ toEmail, firstName, lastName, submissionId, amountPaid, paymentMethod }) => {
    const shortId = String(submissionId).slice(0, 8)
    const priceStr = `$${Number(amountPaid).toFixed(2)}`

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">VOC Submission Received</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${firstName} ${lastName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Thank you for your VOC submission to Safety Training Academy. We have received your request.</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <tr><td style="font-size:13px;color:#64748b;width:140px;">Submission ID</td><td style="font-size:14px;font-weight:600;color:#334155;">${shortId}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Amount Paid</td><td style="font-size:14px;font-weight:600;color:#334155;">${priceStr}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Payment Method</td><td style="font-size:14px;font-weight:600;color:#334155;">${paymentMethod}</td></tr>
    </table>
    <p style="font-size:14px;color:#334155;">Our team will review your application and get back to you soon.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></td></tr></table></body></html>`

    try {
        await sendEmail({ to: toEmail, subject: `VOC Submission Received - #${shortId}`, html })
    } catch (err) {
        // Log but never break the API response over an email failure.
        console.error("VOC confirmation email failed:", err.message)
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/voc
//   multipart/form-data:
//     - all Step 1 text fields
//     - courses (JSON string)
//     - paymentMethod ("card" | "bank")
//     - card  (JSON string of safe metadata) when card
//     - bank  (JSON string with refId)        when bank
//     - proof (file)                          when bank
// ─────────────────────────────────────────────────────────────
exports.createSubmission = async (req, res) => {
    try {
        const b = req.body || {}

        const courses = parseCourses(b.courses)
        if (courses.length === 0) {
            return res.status(400).json({ error: "At least one course is required." })
        }

        const paymentMethod = (b.paymentMethod || "").toLowerCase()
        if (!["card", "bank"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Invalid payment method." })
        }

        const requiredText = ["firstName", "lastName", "email", "phone", "streetAddress", "city", "state", "postcode"]
        for (const f of requiredText) {
            if (!b[f] || !String(b[f]).trim()) {
                return res.status(400).json({ error: `${f} is required.` })
            }
        }

        const doc = {
            firstName:     b.firstName,
            lastName:      b.lastName,
            email:         b.email,
            phone:         b.phone,
            studentId:     b.studentId || "",
            streetAddress: b.streetAddress,
            city:          b.city,
            state:         b.state,
            postcode:      b.postcode,
            courses,
            amount:        courses.length * VocSubmission.PRICE_PER_COURSE,
            paymentMethod,
        }

        if (paymentMethod === "card") {
            doc.card = sanitizeCard(b.card)
            doc.bank = { refId: "", proofUrl: "" }
        } else {
            const bank = typeof b.bank === "string" ? safeJson(b.bank) : (b.bank || {})
            const refId = String(bank.refId || b.bankRefId || "").trim()
            if (!refId) {
                return res.status(400).json({ error: "Transaction / Reference ID is required for bank transfer." })
            }
            const proofUrl = req.file?.path || req.file?.secure_url || ""
            if (!proofUrl) {
                return res.status(400).json({ error: "Payment receipt is required for bank transfer." })
            }
            doc.bank = { refId, proofUrl }
            doc.card = { name: "", last4: "", expiryMonth: "", expiryYear: "" }
        }

        const submission = await VocSubmission.create(doc)

        // Fire confirmation email (non-blocking failure)
        await sendVocConfirmationEmail({
            toEmail:      submission.email,
            firstName:    submission.firstName,
            lastName:     submission.lastName,
            submissionId: submission._id,
            amountPaid:   submission.amount,
            paymentMethod: paymentMethod === "card" ? "Credit / Debit Card" : "Bank Transfer",
        })

        res.status(201).json(submission)
    } catch (err) {
        console.error("VOC createSubmission error:", err)
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/voc — admin list
// ─────────────────────────────────────────────────────────────
exports.listSubmissions = async (_req, res) => {
    try {
        const items = await VocSubmission.find().sort({ createdAt: -1 }).lean()
        res.json(items)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/voc/stats — dashboard counts
// ─────────────────────────────────────────────────────────────
exports.getStats = async (_req, res) => {
    try {
        const [pending, verified, rejected, total] = await Promise.all([
            VocSubmission.countDocuments({ status: "Pending"  }),
            VocSubmission.countDocuments({ status: "Verified" }),
            VocSubmission.countDocuments({ status: "Rejected" }),
            VocSubmission.countDocuments({}),
        ])
        res.json({ pending, verified, rejected, total })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/voc/:id/status  { status }
// ─────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body || {}
        if (!["Pending", "Verified", "Rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status." })
        }
        const updated = await VocSubmission.findByIdAndUpdate(
            req.params.id,
            { status, reviewedAt: new Date() },
            { new: true }
        )
        if (!updated) return res.status(404).json({ error: "Submission not found." })
        res.json(updated)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/voc/:id
// ─────────────────────────────────────────────────────────────
exports.deleteSubmission = async (req, res) => {
    try {
        const removed = await VocSubmission.findByIdAndDelete(req.params.id)
        if (!removed) return res.status(404).json({ error: "Submission not found." })
        res.json({ message: "Deleted successfully." })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
