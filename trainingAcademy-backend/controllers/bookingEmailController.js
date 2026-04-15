const sendEmail = require("../config/sendEmail");

const formatBookingId = (id) => {
    if (!id) return "00000000";
    const digits = String(id).replace(/\D/g, "");
    if (digits.length >= 8) return digits.slice(0, 8);
    if (digits.length > 0) return digits.padStart(8, "0");
    return String(id).slice(0, 8).toUpperCase().padStart(8, "0");
};

// ─────────────────────────────────────────────────────────────
// 1. Individual Student Booking Confirmation
// POST /api/booking-email/send-confirmation
// ─────────────────────────────────────────────────────────────
const sendBookingConfirmation = async (req, res) => {
    const { name, email, phone, courseName, courseCode, courseDate, startTime, endTime, coursePrice, paymentMethod } = req.body;

    const orderId = formatBookingId(Date.now().toString());
    const priceStr = `$${Number(coursePrice).toFixed(2)}`;
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const billingAddressHtml = `${name}<br/>${email}<br/>${phone || ""}`;

    const bankDetailsHtml = paymentMethod === "Bank Transfer" ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#fffbeb;border-radius:8px;border:1px solid #fcd34d;">
        <tr><td style="padding:20px;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Bank Transfer Details</p>
            <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;color:#92400e;">
                <tr><td style="width:140px;">Bank</td><td><strong>Commonwealth Bank</strong></td></tr>
                <tr><td>Account Name</td><td><strong>AIET College</strong></td></tr>
                <tr><td>BSB</td><td><strong>062 141</strong></td></tr>
                <tr><td>Account No</td><td><strong>10490235</strong></td></tr>
            </table>
            <p style="margin:12px 0 0;font-size:13px;color:#b45309;">Please use order number <strong>#${orderId}</strong> or your full name as payment reference.</p>
        </td></tr></table>` : "";

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Booking Confirmed #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong style="color:#333;">${name}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Thank you for booking with <strong>Safety Training Academy</strong>. Your booking has been successfully received!</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Please find your course details below:</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <tr><td style="font-size:13px;color:#64748b;width:120px;">Course Name</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseName}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Course Code</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseCode}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Date</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseDate}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Time</td><td style="font-size:14px;font-weight:600;color:#334155;">${startTime} - ${endTime}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Location</td><td style="font-size:14px;font-weight:600;color:#334155;">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
    </table>
    <div style="margin-bottom:24px;padding:16px;background-color:#fef3c7;border-radius:6px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400e;">Important: Course Preparation Checklist</p>
        <p style="margin:0 0 8px;font-size:13px;color:#334155;">Course Address: <strong>3/14-16 Marjorie Street, Sefton NSW 2162</strong></p>
        <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:#334155;">
            <li style="margin-bottom:6px;">ID reflecting your name and address.</li>
            <li style="margin-bottom:6px;">PPE — high visibility vest and steel cap boots. <em>(Not required for First Aid courses.)</em></li>
            <li style="margin-bottom:6px;"><strong>USI:</strong> <a href="https://www.usi.gov.au/your-usi/create-usi" style="color:#3b82f6;">Create USI</a> | <a href="https://www.usi.gov.au/faqs/find-your-usi" style="color:#3b82f6;">Find your USI</a></li>
        </ul>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#334155;">High-Risk licence (Forklift / Boom lift over 11m):</p>
        <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:#334155;">
            <li>100 Points ID: <a href="https://www.safework.nsw.gov.au/licences-and-registrations/licences/proof-of-identity" style="color:#3b82f6;">Proof of Identification</a></li>
            <li>AEN: <a href="https://www.service.nsw.gov.au/transaction/apply-for-a-high-risk-work-licence-assessment-enrolment-number" style="color:#3b82f6;">Apply for AEN</a></li>
        </ul>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#334155;">White Card / Asbestos:</p>
        <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:#334155;">
            <li>100 Points ID: <a href="https://www.safework.nsw.gov.au/licences-and-registrations/licences/evidence-of-identity" style="color:#3b82f6;">Evidence of Identity</a></li>
        </ul>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#334155;">We provide:</p>
        <ul style="margin:0 0 8px;padding-left:20px;font-size:13px;color:#334155;">
            <li>Beverages (coffee, tea, hot chocolate, water).</li>
            <li>Lunchroom, toilets, and fridge in kitchen room.</li>
            <li>Easy council parking.</li>
        </ul>
    </div>
    ${bankDetailsHtml}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Product</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#334155;">${courseName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Booking ID: ${orderId} | ${courseDate} | ${startTime} - ${endTime} ×1</p>
    </td></tr>
    <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;">
            <tr style="background-color:#f8fafc;"><td style="padding:8px 12px;color:#64748b;">Quantity</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:#334155;">1</td></tr>
            <tr><td style="padding:8px 12px;color:#64748b;">Price</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:#334155;">${priceStr}</td></tr>
        </table>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Order Details (Order #${orderId})</p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Order Date: <strong>${orderDateStr}</strong></p>
        <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;margin-top:12px;">
            <tr><td style="padding:8px 0;color:#334155;">Subtotal</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#334155;">${priceStr}</td></tr>
            <tr><td style="padding:8px 0;color:#334155;">Payment method</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#334155;">${paymentMethod}</td></tr>
            <tr style="border-top:2px solid #e2e8f0;"><td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#334155;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:15px;font-weight:700;color:#334155;">${priceStr}</td></tr>
        </table>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Billing Address</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${billingAddressHtml}</p>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Office: <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a></p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Booking: <a href="mailto:bookings@safetytrainingacademy.edu.au" style="color:#3b82f6;">bookings@safetytrainingacademy.edu.au</a></p>
        <p style="margin:0;font-size:14px;color:#334155;">Business: 1300 976 097 | M: 0483 878 887</p>
    </td></tr></table>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong style="color:#334155;">Safety Training Academy</strong><br/>Training Team | 1300 976 097</p>
</td></tr>
</table></td></tr></table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">NEW BOOKING RECEIVED #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 20px;font-size:15px;color:#555;">New booking from <strong style="color:#333;">${name}</strong></p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Product</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#334155;">${courseName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Booking ID: ${orderId} | ${courseDate} | ${startTime} - ${endTime} ×1</p>
    </td></tr>
    <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;">
            <tr style="background-color:#f8fafc;"><td style="padding:8px 12px;color:#64748b;">Quantity</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:#334155;">1</td></tr>
            <tr><td style="padding:8px 12px;color:#64748b;">Price</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:#334155;">${priceStr}</td></tr>
        </table>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Order Details (Order #${orderId})</p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Order Date: <strong>${orderDateStr}</strong></p>
        <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;margin-top:12px;">
            <tr><td style="padding:8px 0;color:#334155;">Subtotal</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#334155;">${priceStr}</td></tr>
            <tr><td style="padding:8px 0;color:#334155;">Payment method</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#334155;">${paymentMethod}</td></tr>
            <tr style="border-top:2px solid #e2e8f0;"><td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#334155;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:15px;font-weight:700;color:#334155;">${priceStr}</td></tr>
        </table>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Billing Address</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${billingAddressHtml}</p>
    </td></tr></table>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0 0 12px;font-size:14px;color:#334155;font-weight:600;">Congratulations on the sale. Please confirm payment before scheduling the course.</p>
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong style="color:#334155;">Safety Training Academy System</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;

    try {
        await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `New Booking #${orderId} - ${name} - ${courseName}`, html: academyHtml });
        console.log("✅ Academy email sent");
        await sendEmail({ to: email, subject: `Booking Confirmed - ${courseName} (Order #${orderId})`, html: studentHtml });
        console.log("✅ Student email sent");
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Email error:", err.message);
        res.status(500).json({ success: false, message: "Email sending failed" });
    }
};

// ─────────────────────────────────────────────────────────────
// 2. Company Order Confirmation
// POST /api/booking-email/company-order
// ─────────────────────────────────────────────────────────────
const sendCompanyOrderConfirmation = async (req, res) => {
    const { toEmail, companyName, orderId: rawOrderId, totalAmount, links = [] } = req.body;

    const orderId = formatBookingId(rawOrderId || Date.now().toString());
    const priceStr = `$${Number(totalAmount).toFixed(2)}`;
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const linksHtml = links.map(l => `
        <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#334155;">${l.courseName}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Date: ${l.courseDateDisplay}</p>
            <p style="margin:0;font-size:13px;"><a href="${l.fullUrl}" style="color:#3b82f6;">${l.fullUrl}</a></p>
        </td></tr>`).join("");

    const companyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Thank you for your booking – Order #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${companyName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Thank you for your booking with Safety Training Academy.</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Instructions:</p>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;">Please share the links with your employees to continue their LLN assessment and complete their Enrolment.</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Employee links:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${linksHtml}</table>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;">Please ask them to complete the form and assessment before their course date.</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <tr><td style="color:#64748b;width:120px;">Order #</td><td><strong>${orderId}</strong></td></tr>
        <tr><td style="color:#64748b;">Order Date</td><td>${orderDateStr}</td></tr>
        <tr><td style="color:#64748b;">Total</td><td><strong>${priceStr}</strong></td></tr>
    </table>
    <p style="font-size:14px;color:#334155;">If you need any assistance, please contact us.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong>Safety Training Academy</strong><br/>Training Team | 1300 976 097<br/><a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a></p>
</td></tr>
</table></td></tr></table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">NEW COMPANY BOOKING #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 20px;font-size:15px;color:#555;">New company booking from <strong>${companyName}</strong> (${toEmail})</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <tr><td style="color:#64748b;width:120px;">Order #</td><td><strong>${orderId}</strong></td></tr>
        <tr><td style="color:#64748b;">Date</td><td>${orderDateStr}</td></tr>
        <tr><td style="color:#64748b;">Total</td><td><strong>${priceStr}</strong></td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Courses / Employee links:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${linksHtml}</table>
    <p style="margin:16px 0 0;font-size:14px;color:#334155;">Please follow up with the company for payment confirmation.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy System</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;

    try {
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `New Company Booking #${orderId} - ${companyName}`, html: academyHtml });
        }
        await sendEmail({ to: toEmail, subject: `Thank you for your booking – Order #${orderId}`, html: companyHtml });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Company order email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 3. Enrollment Link Registration (Company link வழியா student)
// POST /api/booking-email/enrollment-link
// ─────────────────────────────────────────────────────────────
const sendEnrollmentLinkConfirmation = async (req, res) => {
    const { toEmail, studentName, courseName, courseCode, courseDate, startTime, endTime } = req.body;

    const dateStr = courseDate || "To be confirmed";
    const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : "To be confirmed";

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Registration complete – ${courseName}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${studentName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">You have successfully completed your registration via the enrollment link.</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Your course details:</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <tr><td style="font-size:13px;color:#64748b;width:120px;">Course</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseName}</td></tr>
        ${courseCode ? `<tr><td style="font-size:13px;color:#64748b;">Course Code</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseCode}</td></tr>` : ""}
        <tr><td style="font-size:13px;color:#64748b;">Date</td><td style="font-size:14px;font-weight:600;color:#334155;">${dateStr}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Time</td><td style="font-size:14px;font-weight:600;color:#334155;">${timeStr}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Location</td><td style="font-size:14px;font-weight:600;color:#334155;">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:14px;color:#334155;">If you need any assistance, please contact us.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong>Safety Training Academy</strong><br/>1300 976 097</p>
</td></tr>
</table></td></tr></table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">New Registration Received (via link)</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>New student registered via enrollment link.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Student Name</td><td><strong>${studentName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${toEmail}</td></tr>
        <tr><td style="color:#64748b;">Course</td><td>${courseName}</td></tr>
        <tr><td style="color:#64748b;">Date</td><td>${dateStr}</td></tr>
        <tr><td style="color:#64748b;">Time</td><td>${timeStr}</td></tr>
    </table>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy System</strong></p>
</td></tr>
</table></body></html>`;

    try {
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `NEW REGISTRATION (LINK) - ${studentName} - ${courseName}`, html: academyHtml });
        }
        await sendEmail({ to: toEmail, subject: `Registration complete – ${courseName}`, html: studentHtml });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Enrollment link email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 4. Company Portal Welcome
// POST /api/booking-email/company-welcome
// ─────────────────────────────────────────────────────────────
const sendCompanyPortalWelcome = async (req, res) => {
    const { toEmail, companyName, portalEnrollmentUrl, loginBaseUrl, initialPassword } = req.body;

    const hasPassword = !!initialPassword;
    const subject = hasPassword
        ? "Welcome — your company portal sign-in & employee enrolment link"
        : "Your company account — employee enrolment link";

    const credentialsHtml = hasPassword ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        <tr><td style="padding:20px;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your sign-in details</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#334155;">
                <tr><td style="padding:6px 0;color:#64748b;width:140px;">Company name</td><td style="padding:6px 0;font-weight:600;">${companyName}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b;">Email (login)</td><td style="padding:6px 0;font-weight:600;">${toEmail}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b;">Password</td><td style="padding:6px 0;font-family:monospace;font-weight:600;">${initialPassword}</td></tr>
            </table>
            <p style="margin:12px 0 0;font-size:13px;color:#64748b;">Keep this email confidential. Do not share your password.</p>
        </td></tr></table>` : "";

    const loginBlockHtml = loginBaseUrl ? `
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Company portal (for you)</p>
        <p style="margin:0 0 24px;font-size:14px;color:#334155;"><a href="${loginBaseUrl}" style="color:#3b82f6;">${loginBaseUrl}</a></p>` : "";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Your company portal is ready</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 20px;font-size:15px;color:#555;">Hello <strong>${companyName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#555;">Your company account is ready. Training booked through the employee link is billed to your company.</p>
    ${credentialsHtml}
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Employee enrolment link</p>
    <p style="margin:0 0 24px;font-size:14px;color:#334155;">Share this with your team:</p>
    <p style="margin:0 0 24px;font-size:14px;"><a href="${portalEnrollmentUrl}" style="color:#3b82f6;">${portalEnrollmentUrl}</a></p>
    ${loginBlockHtml}
    <p style="margin:0;font-size:14px;color:#64748b;">Questions? Reply to this email or contact the training team.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;

    try {
        await sendEmail({ to: toEmail, subject, html });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Company welcome email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 5. VOC Submission Confirmation
// POST /api/booking-email/voc-confirmation
// ─────────────────────────────────────────────────────────────
const sendVOCConfirmation = async (req, res) => {
    const { toEmail, firstName, lastName, submissionId, amountPaid, paymentMethod } = req.body;

    const shortId = String(submissionId).slice(0, 8);
    const priceStr = `$${Number(amountPaid).toFixed(2)}`;

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
</table></td></tr></table></body></html>`;

    try {
        await sendEmail({ to: toEmail, subject: `VOC Submission Received - #${shortId}`, html });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ VOC email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 6. Email OTP
// POST /api/booking-email/send-otp
// ─────────────────────────────────────────────────────────────
const sendEmailOTP = async (req, res) => {
    const { toEmail, otp } = req.body;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Verify your email</h1>
</td></tr>
<tr><td style="padding:30px;text-align:center;">
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Use the following code to verify your email address for VOC submission:</p>
    <div style="background-color:#f3f4f6;padding:20px;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:8px;color:#1f2937;margin-bottom:24px;">${otp}</div>
    <p style="margin:0;font-size:13px;color:#6b7280;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;

    try {
        await sendEmail({ to: toEmail, subject: `${otp} is your verification code`, html });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ OTP email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 7. Company Billing — Bank Transfer Notice
// POST /api/booking-email/company-bank-transfer
// ─────────────────────────────────────────────────────────────
const sendCompanyBankTransfer = async (req, res) => {
    const { companyEmail, companyName, amount, submissionId, linesSummary } = req.body;
    const amountStr = `$${Number(amount).toFixed(2)}`;

    const companyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">Bank Transfer Notice Received</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>Hello <strong>${companyName}</strong>,</p>
    <p>We received your bank transfer payment notice for <strong>${amountStr}</strong>.</p>
    <p>Reference: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${submissionId}</code></p>
    <pre style="white-space:pre-wrap;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${linesSummary}</pre>
    <p>Our accounts team will verify your transfer and update your balance. Questions? Call 1300 976 097.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Thank you,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">Company Bank Transfer Submitted</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p><strong>Company:</strong> ${companyName} (${companyEmail})</p>
    <p><strong>Amount:</strong> ${amountStr}</p>
    <p><strong>Submission ID:</strong> ${submissionId}</p>
    <pre style="white-space:pre-wrap;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${linesSummary}</pre>
</td></tr>
</table></body></html>`;

    try {
        await sendEmail({ to: companyEmail, subject: `We received your bank transfer notice — ${amountStr}`, html: companyHtml });
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `Company bank transfer notice — ${companyName} — ${amountStr}`, html: academyHtml });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Bank transfer email error:", err.message);
        res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 8. Company Billing — Card Payment
// POST /api/booking-email/company-card-payment
// ─────────────────────────────────────────────────────────────
const sendCompanyCardPayment = async (req, res) => {
    const { companyEmail, companyName, amount, transactionReference, linesSummary } = req.body;
    const amountStr = `$${Number(amount).toFixed(2)}`;

    const companyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">Payment Received</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>Hello <strong>${companyName}</strong>,</p>
    <p>Your card payment of <strong>${amountStr}</strong> has been applied to your company account.</p>
    <p>Transaction: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${transactionReference}</code></p>
    <pre style="white-space:pre-wrap;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${linesSummary}</pre>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Thank you,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">Company Card Payment Applied</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p><strong>Company:</strong> ${companyName} (${companyEmail})</p>
    <p><strong>Amount:</strong> ${amountStr}</p>
    <p><strong>Transaction:</strong> ${transactionReference}</p>
    <pre style="white-space:pre-wrap;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${linesSummary}</pre>
</td></tr>
</table></body></html>`;

    try {
        await sendEmail({ to: companyEmail, subject: `Payment received — ${amountStr}`, html: companyHtml });
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `Company card payment — ${companyName} — ${amountStr}`, html: academyHtml });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Card payment email error:", err.message);
        res.status(500).json({ success: false });
    }
};

module.exports = {
    sendBookingConfirmation,
    sendCompanyOrderConfirmation,
    sendEnrollmentLinkConfirmation,
    sendCompanyPortalWelcome,
    sendVOCConfirmation,
    sendEmailOTP,
    sendCompanyBankTransfer,
    sendCompanyCardPayment,
};