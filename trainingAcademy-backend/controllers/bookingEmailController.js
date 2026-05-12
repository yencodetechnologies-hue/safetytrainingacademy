const sendEmail = require("../config/sendEmail");
const adminBookingTemplate = require("../templates/adminBookingTemplate");

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
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" });
    const billingAddressHtml = `${name}<br/>${email}<br/>${phone || ""}`;

    // ✅ Default password — booking pannumbothu user-ku assign aagum
    const defaultPassword = "123456";

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

    // ✅ Login credentials block — student email-la mattum varum
    const loginCredentialsHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
        <tr><td style="padding:20px;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;">🔐 Your Student Portal Login</p>
            <p style="margin:0 0 12px;font-size:14px;color:#1e3a8a;">An account has been created for you. Use the credentials below to access your student portal:</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#1e3a8a;background-color:#ffffff;border-radius:6px;border:1px solid #dbeafe;">
                <tr><td style="padding:12px 16px;width:120px;border-bottom:1px solid #dbeafe;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #dbeafe;"><strong>${email}</strong></td></tr>
                <tr><td style="padding:12px 16px;">Password</td><td style="padding:12px 16px;"><strong style="font-family:monospace;font-size:15px;background-color:#fef3c7;padding:4px 10px;border-radius:4px;">${defaultPassword}</strong></td></tr>
            </table>
        </td></tr></table>`;

    const studentHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STA Booking Confirmation</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .sb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }
    .sb-hdr { background: #0d2240; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .sb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .sb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .sb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 11px; border-radius: 2px; white-space: nowrap; }
    .sb-divider { height: 3px; background: #29b6e8; }
    .sb-banner { background: #0a1c33; padding: 13px 24px; text-align: center; }
    .sb-banner-text { font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; }
    .sb-banner-id { color: #29b6e8; }
    .sb-content { padding: 18px 24px; }
    .sb-greeting { font-size: 14px; color: #1a1a1a; margin: 0 0 8px; }
    .sb-intro { font-size: 13px; color: #555555; line-height: 1.7; margin: 0 0 14px; }
    .sb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .sb-section-head { background: #0d2240; padding: 7px 14px; }
    .sb-section-head span { font-size: 10px; font-weight: 700; color: #29b6e8; letter-spacing: 1px; text-transform: uppercase; }
    .sb-section-body { padding: 11px 14px; }
    .sb-course-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
    .sb-course-meta { font-size: 11px; color: #555555; margin: 0 0 10px; }
    .sb-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .sb-table td { padding: 4px 0; vertical-align: top; }
    .sb-table .lbl { color: #666666; width: 40%; font-weight: 500; }
    .sb-table .val { color: #1a1a1a; font-weight: 700; }
    .sb-table .val-reg { color: #1a1a1a; font-weight: 400; }
    .sb-table .val-blue { color: #1a7fbf; font-weight: 600; }
    .sb-pw-box { background: #fff8e6; border: 1px solid #f0d080; border-radius: 3px; padding: 3px 9px; font-size: 12.5px; font-weight: 700; color: #7a5500; display: inline-block; letter-spacing: 1px; }
    .sb-portal-note { font-size: 12px; color: #555555; margin: 0 0 10px; line-height: 1.6; }
    .sb-total-row td { border-top: 2px solid #e0e0e0; padding-top: 8px; font-weight: 700; }
    .sb-total-val { text-align: right; font-size: 15px; font-weight: 700; color: #0d2240; }
    .sb-checklist { border: 2px solid #d4940a; border-radius: 4px; padding: 11px 14px; margin-bottom: 12px; background: #fffbf0; }
    .sb-checklist-title { font-size: 11px; font-weight: 700; color: #7a5500; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sb-checklist-addr { font-size: 12px; color: #7a5500; margin: 0 0 8px; }
    .sb-checklist ul { margin: 0 0 8px; padding-left: 18px; font-size: 12px; color: #7a5500; line-height: 1.8; }
    .sb-checklist-provide { font-size: 12px; font-weight: 700; color: #7a5500; margin: 0 0 4px; }
    .sb-bank { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .sb-bank-head { background: #0d2240; padding: 7px 14px; }
    .sb-bank-head span { font-size: 10px; font-weight: 700; color: #29b6e8; letter-spacing: 1px; text-transform: uppercase; }
    .sb-bank-body { padding: 11px 14px; }
    .sb-bank-note { font-size: 11px; color: #c07000; margin: 8px 0 0; }
    .sb-bank-note strong { color: #0d2240; }
    .sb-footer { background: #0d2240; padding: 13px 24px; text-align: center; }
    .sb-footer-brand { font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 3px; }
    .sb-footer-info { font-size: 11px; color: #6fa8c8; line-height: 1.9; margin: 0; }
  </style>
</head>
<body>
  <div class="sb-body">
    <!-- Header -->
    <div class="sb-hdr">
      <div>
        <p class="sb-hdr-title">Safety Training Academy</p>
        <p class="sb-hdr-sub">RTO #45234 &nbsp;·&nbsp; Booking Confirmation</p>
      </div>
      <span class="sb-badge">Confirmed</span>
    </div>
    <div class="sb-divider"></div>

    <!-- Banner -->
    <div class="sb-banner">
      <p class="sb-banner-text">&#10003; &nbsp;Booking Confirmed &nbsp;<span class="sb-banner-id">#${orderId}</span></p>
    </div>

    <div class="sb-content">
      <p class="sb-greeting">Dear <strong>${name}</strong>,</p>
      <p class="sb-intro">Thank you for booking with <strong>Safety Training Academy</strong>. Your booking has been successfully received!</p>

      <!-- Course / Product -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Product</span></div>
        <div class="sb-section-body">
          <p class="sb-course-title">${courseName}</p>
          <p class="sb-course-meta">Booking ID: #${orderId} &nbsp;|&nbsp; ${courseDate} &nbsp;|&nbsp; ${startTime} - ${endTime}</p>
          <table class="sb-table">
            <tr>
              <td class="lbl">Quantity</td>
              <td style="text-align:right; color: #1a1a1a; font-weight:400;">1</td>
            </tr>
            <tr>
              <td class="lbl">Price</td>
              <td style="text-align:right; color: #1a1a1a; font-weight:700;">${priceStr}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Student Portal Login -->
      <div class="sb-section">
        <div class="sb-section-head"><span>&#128274; Your student portal login</span></div>
        <div class="sb-section-body">
          <p class="sb-portal-note">An account has been created for you. Use the credentials below to access your student portal:</p>
          <table class="sb-table">
            <tr>
              <td class="lbl">Email</td>
              <td class="val-blue">${email}</td>
            </tr>
            <tr>
              <td class="lbl">Password</td>
              <td><span class="sb-pw-box">${defaultPassword}</span></td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Course Preparation Checklist -->
      <div class="sb-checklist">
        <p class="sb-checklist-title">&#9888; Important: Course preparation checklist</p>
        <p class="sb-checklist-addr">Course Address: <strong>3/14-16 Marjorie Street, Sefton NSW 2162</strong></p>
        <ul>
          <li>ID reflecting your name and address.</li>
          <li>PPE — high visibility vest and steel cap boots.</li>
          <li>USI: <a href="https://www.usi.gov.au/students/get-a-usi" style="color:#c07000;">Create USI</a></li>
        </ul>
        <p class="sb-checklist-provide">We provide:</p>
        <ul>
          <li>Beverages, Lunchroom, Toilets, and easy council parking.</li>
        </ul>
      </div>

      <!-- Bank Transfer Details (Conditional) -->
      ${paymentMethod === "Bank Transfer" ? `
      <div class="sb-bank">
        <div class="sb-bank-head"><span>Bank transfer details</span></div>
        <div class="sb-bank-body">
          <table class="sb-table">
            <tr>
              <td class="lbl">Bank</td>
              <td class="val">Commonwealth Bank</td>
            </tr>
            <tr>
              <td class="lbl">Account name</td>
              <td class="val">AIET College</td>
            </tr>
            <tr>
              <td class="lbl">BSB</td>
              <td class="val">062 141</td>
            </tr>
            <tr>
              <td class="lbl">Account no</td>
              <td class="val">10490235</td>
            </tr>
          </table>
          <p class="sb-bank-note">Please use order number <strong>#${orderId}</strong> or your full name as payment reference.</p>
        </div>
      </div>
      ` : ""}

      <!-- Order Details -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Order details (#${orderId})</span></div>
        <div class="sb-section-body">
          <p style="font-size:12px; color: #555555; margin: 0 0 8px;">Order Date: <strong style="color: #1a1a1a;">${orderDateStr}</strong></p>
          <table class="sb-table">
            <tr>
              <td class="lbl">Subtotal</td>
              <td style="text-align:right; color: #1a1a1a; font-weight:400;">${priceStr}</td>
            </tr>
            <tr>
              <td class="lbl">Payment method</td>
              <td style="text-align:right; color: #1a1a1a; font-weight:400;">${paymentMethod}</td>
            </tr>
            <tr class="sb-total-row">
              <td class="lbl" style="font-weight:700; color: #1a1a1a;">Total</td>
              <td class="sb-total-val">${priceStr}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Billing Address -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Billing address</span></div>
        <div class="sb-section-body">
          <table class="sb-table">
            <tr>
              <td class="lbl">Name</td>
              <td class="val">${name}</td>
            </tr>
            <tr>
              <td class="lbl">Email</td>
              <td class="val-blue">${email}</td>
            </tr>
            <tr>
              <td class="lbl">Mobile</td>
              <td class="val">${phone || ""}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sb-footer">
      <div class="sb-footer-brand">Safety Training Academy</div>
      <p class="sb-footer-info">
        2 Wellington St, Sefton NSW 2162 &nbsp;·&nbsp; RTO #45234<br>
        1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au
      </p>
    </div>
  </div>
</body>
</html>`;

    const adminMailData = {
        studentName: name,
        studentEmail: email,
        studentMobile: phone || "—",
        courseName: courseName,
        courseDate: courseDate,
        courseTime: `${startTime} - ${endTime}`,
        courseLocation: "3/14-16 Marjorie Street, Sefton NSW 2162",
        bookingId: `#${orderId}`,
        orderDate: orderDateStr,
        quantity: 1,
        subtotal: priceStr,
        paymentMethod: paymentMethod,
        total: priceStr
    };

    try {
        console.log("--- Email Sending Diagnostics ---");
        console.log("Academy Recipient (BOOKINGS_EMAIL):", process.env.BOOKINGS_EMAIL);
        console.log("Student Recipient:", email);
        console.log("Order ID:", orderId);

        // 1. Send Academy Notification
        try {
            await sendEmail({
                to: process.env.BOOKINGS_EMAIL,
                subject: `New Booking #${orderId} - ${name} - ${courseName}`,
                html: adminBookingTemplate(adminMailData)
            });
            console.log(`✅ Academy notification sent to ${process.env.BOOKINGS_EMAIL}`);
        } catch (academyErr) {
            console.error(`❌ Academy notification failed for ${process.env.BOOKINGS_EMAIL}:`, academyErr.message);
            // We continue so the student still gets their email even if internal notification fails
        }

        // 2. Send Student Confirmation
        try {
            await sendEmail({
                to: email,
                subject: `Booking Confirmed - ${courseName} (Order #${orderId})`,
                html: studentHtml
            });
            console.log(`✅ Student confirmation sent to ${email}`);
        } catch (studentErr) {
            console.error(`❌ Student confirmation failed for ${email}:`, studentErr.message);
            throw studentErr; // Re-throw for final response if student email fails
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Booking email process error:", err.message);
        res.status(500).json({ success: false, message: "Booking email process encountered an error" });
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
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" });

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

    const adminMailData = {
        studentName: studentName,
        studentEmail: toEmail,
        studentMobile: req.body.phone || "—",
        courseName: courseName,
        courseDate: dateStr,
        courseTime: timeStr,
        courseLocation: "3/14-16 Marjorie Street, Sefton NSW 2162",
        bookingId: "LINK-REG",
        orderDate: new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" }),
        quantity: 1,
        subtotal: "—",
        paymentMethod: "Enrollment Link",
        total: "—"
    };

    try {
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ 
                to: process.env.BOOKINGS_EMAIL, 
                subject: `NEW REGISTRATION (LINK) - ${studentName} - ${courseName}`, 
                html: adminBookingTemplate(adminMailData) 
            });
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

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
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

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:#f43f5e;color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">NEW VOC SUBMISSION</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>A new VOC submission has been received.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Name</td><td><strong>${firstName} ${lastName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${toEmail}</td></tr>
        <tr><td style="color:#64748b;">Amount</td><td><strong>${priceStr}</strong></td></tr>
        <tr><td style="color:#64748b;">Payment</td><td>${paymentMethod}</td></tr>
        <tr><td style="color:#64748b;">Submission ID</td><td><code>${submissionId}</code></td></tr>
    </table>
    <p style="margin-top:20px;">Please log in to the admin portal to review this submission.</p>
</td></tr>
</table></body></html>`;

    try {
        await sendEmail({ to: toEmail, subject: `VOC Submission Received - #${shortId}`, html: studentHtml });
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `ACTION REQUIRED: New VOC Submission - ${firstName} ${lastName}`, html: academyHtml });
        }
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
// ─────────────────────────────────────────────────────────────
// 9. LLN Completion Notification
// ─────────────────────────────────────────────────────────────
const sendLLNCompletionNotification = async (req, res) => {
    const { studentEmail, studentName, score, isPassed } = req.body;

    const status = isPassed ? "Passed" : "Under Review";
    const statusColor = isPassed ? "#16a34a" : "#ca8a04";
    const statusBg = isPassed ? "#f0fdf4" : "#fefce8";

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;">Assessment Completed</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>Dear <strong>${studentName}</strong>,</p>
    <p>Thank you for completing your Pre-Enrollment (LLN) Assessment.</p>
    <div style="margin:24px 0;padding:20px;background-color:${statusBg};border-radius:8px;border:1px solid ${statusColor};text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;">Your Result</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:${statusColor};">${status}</p>
        <p style="margin:8px 0 0;font-size:16px;color:#334155;">Score: ${Number(score).toFixed(1)}%</p>
    </div>
    ${isPassed
            ? "<p>Congratulations! You have passed the assessment. You can now proceed with your enrollment.</p>"
            : "<p>Your assessment is currently under review by our administration team. We will notify you once the review is complete.</p>"}
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:#f43f5e;color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">LLN ASSESSMENT COMPLETED</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>A student has completed their LLN Assessment.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Student Name</td><td><strong>${studentName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${studentEmail}</td></tr>
        <tr><td style="color:#64748b;">Score</td><td><strong>${Number(score).toFixed(1)}%</strong></td></tr>
        <tr><td style="color:#64748b;">Status</td><td><span style="color:${statusColor};font-weight:700;">${status}</span></td></tr>
    </table>
    <p style="margin-top:20px;">Please log in to the admin portal to review the results.</p>
</td></tr>
</table></body></html>`;

    try {
        await sendEmail({ to: studentEmail, subject: "Pre-Enrollment Assessment Completed", html: studentHtml });
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `ACTION REQUIRED: LLN Assessment Completed - ${studentName}`, html: academyHtml });
        }
        if (res) res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ LLN email error:", err.message);
        if (res) res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────────────────────────
// 10. Enrollment Form Completion Notification
// ─────────────────────────────────────────────────────────────
const sendEnrollmentFormCompletionNotification = async (req, res) => {
    const { studentEmail, studentName } = req.body;

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;">Enrollment Form Submitted</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>Dear <strong>${studentName}</strong>,</p>
    <p>We have successfully received your enrollment form.</p>
    <p>Our administration team will now review your application and documents. This process typically takes 1-2 business days.</p>
    <p>We will notify you via email as soon as your enrollment is approved.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Best regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></body></html>`;

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:#f43f5e;color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">ENROLLMENT FORM SUBMITTED</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>A student has submitted their enrollment form and is awaiting review.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Student Name</td><td><strong>${studentName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${studentEmail}</td></tr>
    </table>
    <p style="margin-top:20px;">Please log in to the admin portal to review the form and documents.</p>
</td></tr>
</table></body></html>`;

    try {
        await sendEmail({ to: studentEmail, subject: "Enrollment Form Received", html: studentHtml });
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `ACTION REQUIRED: Enrollment Form Submitted - ${studentName}`, html: academyHtml });
        }
        if (res) res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Enrollment form email error:", err.message);
        if (res) res.status(500).json({ success: false });
    }
};

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
    sendLLNCompletionNotification,
    sendEnrollmentFormCompletionNotification,
};
