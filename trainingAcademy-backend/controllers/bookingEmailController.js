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
// Email Templates
// ─────────────────────────────────────────────────────────────
const buildStudentHtml = (data) => {
  const { orderId, student, course, payment, portal } = data;

  // Extract number only e.g. "BK-10042" → "10042"
  const orderNumber = String(orderId).replace(/[^0-9]/g, '');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation – Safety Training Academy</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .sb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }

    /* ── Header ── */
    .sb-hdr { background: #0d2240; padding: 16px 24px; }
    .sb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .sb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .sb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
    .sb-divider { height: 3px; background: #29b6e8; }

    /* ── Banner ── */
    .sb-banner { background: #0a1c33; padding: 13px 24px; text-align: center; }
    .sb-banner-text { margin: 0; font-size: 15px; font-weight: 700; color: #ffffff; }

    /* ── Content ── */
    .sb-content { padding: 18px 24px; }
    .sb-greeting { font-size: 12px; color: #1a1a1a; margin: 0 0 14px; line-height: 1.6; }

    /* ── Sections ── */
    .sb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .sb-section-head { background: #0d2240; padding: 7px 14px; }
    .sb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    .sb-row { display: flex; border-bottom: 1px solid #f0f0f0; }
    .sb-row:last-child { border-bottom: none; }
    .sb-label { width: 38%; padding: 8px 14px; font-size: 11px; font-weight: 600; color: #666; background: #fafafa; border-right: 1px solid #f0f0f0; flex-shrink: 0; display: flex; align-items: center; }
    .sb-value { padding: 8px 14px; font-size: 12px; color: #1a1a1a; flex: 1; display: flex; align-items: center; word-break: break-word; }
    .sb-value a { color: #29b6e8; text-decoration: none; }

    /* ── Payment total ── */
    .sb-total-row .sb-label { background: #f0f6ff; font-size: 13px; font-weight: 700; color: #0d2240; border-top: 2px solid #29b6e8; }
    .sb-total-row .sb-value { font-size: 14px; font-weight: 700; color: #0d2240; background: #f0f6ff; border-top: 2px solid #29b6e8; }

    /* ── LLN Alert ── */
    .sb-lln-alert { background: #fff3f3; border: 1px solid #ffb3b3; border-radius: 4px; padding: 10px 14px; font-size: 11px; color: #c0392b; line-height: 1.6; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 9px; }
    .sb-lln-alert strong { color: #a00; display: block; margin-bottom: 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ── What to Bring ── */
    .sb-checklist { margin: 0; padding: 0; list-style: none; }
    .sb-checklist li { padding: 7px 14px; font-size: 12px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: flex-start; gap: 8px; }
    .sb-checklist li:last-child { border-bottom: none; }
    .sb-checklist li::before { content: '✓'; color: #29b6e8; font-weight: 700; flex-shrink: 0; }

    /* ── Next Steps ── */
    .sb-steps { margin: 0; padding: 0; list-style: none; counter-reset: step; }
    .sb-steps li { counter-increment: step; padding: 9px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }
    .sb-steps li:last-child { border-bottom: none; }
    .sb-steps li::before { content: counter(step); background: #0d2240; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .sb-steps li a { color: #29b6e8; text-decoration: none; font-weight: 600; }

    /* ── Footer ── */
    .sb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 14px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.7; }
    .sb-footer a { color: #29b6e8; text-decoration: none; }
    .sb-footer strong { color: #555; }
  </style>
</head>
<body>
  <div class="sb-body">

    <!-- ── Header ── -->
    <div class="sb-hdr">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p class="sb-hdr-title">Safety Training Academy</p>
            <p class="sb-hdr-sub">RTO #45234 &nbsp;·&nbsp; Booking Confirmation</p>
          </td>
          <td align="right" valign="top">
            <span class="sb-badge">Confirmed</span>
            <p style="margin: 4px 0 0; font-size: 25px; font-weight: 700; color: #ffffff; text-align: right;">
              Booking ID: ${orderNumber}
            </p>
          </td>
        </tr>
      </table>
    </div>
    <div class="sb-divider"></div>

    <!-- ── Banner ── -->
    <div class="sb-banner">
      <p class="sb-banner-text">&#10003; &nbsp;Booking Confirmed</p>
    </div>

    <div class="sb-content">

      <!-- ── Greeting ── -->
      <p class="sb-greeting">
        Hi <strong>${student?.firstName || 'there'}</strong>,<br /><br />
        Thank you for booking with Safety Training Academy. Your booking is confirmed — please review the details below and make sure all pre-course steps are completed before your training date.
      </p>

      <!-- ── Course Details — no Trainer ── -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Course Details</span></div>
        <div class="sb-row">
          <div class="sb-label">Booking ID</div>
          <div class="sb-value"><strong>${orderNumber}</strong></div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Course</div>
          <div class="sb-value"><strong>${course?.name || '—'}</strong></div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Course Code</div>
          <div class="sb-value">${course?.code || '—'}</div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Delivery Mode</div>
          <div class="sb-value">${course?.deliveryMode || '—'}</div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Date</div>
          <div class="sb-value">${course?.date || '—'}</div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Time</div>
          <div class="sb-value">${course?.time || '—'}</div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Location</div>
          <div class="sb-value">${course?.venue || '—'}</div>
        </div>
      </div>

      <!-- ── Payment Summary — no Invoice # ── -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Payment Summary</span></div>
        ${payment?.items?.length ? payment.items.map(item => `
        <div class="sb-row">
          <div class="sb-label">${item.label}</div>
          <div class="sb-value">$${item.amount}</div>
        </div>`).join('') : ''}
        ${payment?.discount ? `
        <div class="sb-row">
          <div class="sb-label">Discount</div>
          <div class="sb-value" style="color:#1e7e34;">- $${payment.discount}</div>
        </div>` : ''}
        <div class="sb-row sb-total-row">
          <div class="sb-label">Total Paid</div>
          <div class="sb-value">$${payment?.total || '0.00'}</div>
        </div>
        <div class="sb-row">
          <div class="sb-label">Method</div>
          <div class="sb-value">${payment?.method || '—'}</div>
        </div>
      </div>

      <!-- ── LLN Alert ── -->
      <div class="sb-lln-alert">
        <span style="font-size:15px; flex-shrink:0; margin-top:1px;">&#9888;</span>
        <div>
          <strong>Important — Action Required</strong>
          Please finish your LLN &amp; Enrolment in the Student Portal before attending the course. Your spot will not be confirmed until this is completed.
        </div>
      </div>

      <!-- ── Next Steps ── -->
      <div class="sb-section">
        <div class="sb-section-head"><span>Next Steps</span></div>
        <ol class="sb-steps">
          <li>Log in to the <a href="${portal?.url || '#'}">Student Portal</a> and complete your <strong>LLN Assessment</strong> and <strong>Enrolment Form</strong>.</li>
          <li>Ensure you have a valid <strong>USI</strong>. Visit <a href="https://www.usi.gov.au">usi.gov.au</a> if needed.</li>
          <li>Arrive at the venue at least <strong>15 minutes early</strong> with photo ID.</li>
          <li>Check your email for any updates regarding your session.</li>
        </ol>
      </div>

      <!-- ── What to Bring ── -->
      <div class="sb-section">
        <div class="sb-section-head"><span>What to Bring</span></div>
        <ul class="sb-checklist">
          <li>Photo ID (driver's licence or passport)</li>
          <li>Confirmation of your USI</li>
          <li>Appropriate PPE for the course (if advised)</li>
          <li>Sturdy, enclosed footwear — no thongs or open-toed shoes</li>
          <li>Water bottle and snacks — a break will be provided</li>
          ${course?.additionalItems ? course.additionalItems.map(item => `<li>${item}</li>`).join('') : ''}
        </ul>
      </div>

    </div><!-- /eb-content -->

    <!-- ── Footer ── -->
    <div class="sb-footer">
      Questions? Contact us at
      <a href="mailto:admin@safetytrainingacademy.com.au">admin@safetytrainingacademy.com.au</a>
      or call <a href="tel:1300976097">1300 976 097</a>.<br />
      <strong>Safety Training Academy</strong> &nbsp;|&nbsp; RTO #45234 &nbsp;|&nbsp;
      <a href="${portal?.url || '#'}">Student Portal</a><br /><br />
      &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.<br />
      <span style="font-size:9px;">This is an automated confirmation. Please do not reply directly to this email.</span>
    </div>

  </div>
</body>
</html>
`;
};

const buildLLNNotificationHtml = (data) => {
  const { bookingId, studentName, studentEmail, studentPhone, score, status } = data;

  // Extract number only e.g. "BK-10042" → "10042"
  const orderNumber = String(bookingId).replace(/[^0-9]/g, '');

  const statusColor =
    status === 'Passed'   ? '#1e7e34' :
    status === 'Failed'   ? '#c0392b' : '#b8860b';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LLN Assessment Notification – Safety Training Academy</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }

    /* ── Header ── */
    .eb-hdr { background: #0d2240; padding: 16px 24px; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .eb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
    .eb-divider { height: 3px; background: #29b6e8; }

    /* ── Content ── */
    .eb-content { padding: 18px 24px; }

    /* ── Sections ── */
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    .eb-section-body { padding: 11px 14px; }
    .eb-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .eb-table td { padding: 5px 0; vertical-align: top; }
    .eb-table .lbl { color: #666666; width: 40%; font-weight: 500; }
    .eb-table .val { color: #1a1a1a; font-weight: 700; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 12px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
    .eb-footer a { color: #29b6e8; text-decoration: none; }
    .eb-footer strong { color: #555; }
  </style>
</head>
<body>
  <div class="eb-body">

    <!-- ── Header ── -->
    <div class="eb-hdr">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p class="eb-hdr-title">Safety Training Academy</p>
            <p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; LLN Notification</p>
          </td>
          <td align="right" valign="top">
            <span class="eb-badge">Assessment Done</span>
            <p style="margin: 4px 0 0; font-size: 25px; font-weight: 700; color: #ffffff; text-align: right;">
              Booking ID: ${orderNumber}
            </p>
          </td>
        </tr>
      </table>
    </div>
    <div class="eb-divider"></div>

    <div class="eb-content">

      <!-- ── Student Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Student Details</span></div>
        <div class="eb-section-body">
          <table class="eb-table">
            <tr>
              <td class="lbl">Name</td>
              <td class="val">${studentName || '—'}</td>
            </tr>
            <tr>
              <td class="lbl">Email</td>
              <td class="val">${studentEmail || '—'}</td>
            </tr>
            <tr>
              <td class="lbl">Phone Number</td>
              <td class="val">${studentPhone || '—'}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- ── Assessment Result ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Assessment Result</span></div>
        <div class="eb-section-body">
          <table class="eb-table">
            <tr>
              <td class="lbl">Booking ID</td>
              <td class="val">${orderNumber}</td>
            </tr>
            <tr>
              <td class="lbl">Score</td>
              <td class="val" style="font-size: 16px;">${Number(score).toFixed(1)}%</td>
            </tr>
            <tr>
              <td class="lbl">Status</td>
              <td class="val" style="color: ${statusColor};">${status || '—'}</td>
            </tr>
          </table>
        </div>
      </div>

    </div><!-- /eb-content -->

    <!-- ── Footer ── -->
    <div class="eb-footer">
      This is an automated notification from <strong>Safety Training Academy</strong> (RTO #45234).<br />
      Do not reply directly to this email. &nbsp;|&nbsp;
      <a href="mailto:admin@safetytrainingacademy.com.au">admin@safetytrainingacademy.com.au</a><br />
      &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.
    </div>

  </div>
</body>
</html>
`;
};

// ─────────────────────────────────────────────────────────────
// 1. Individual Student Booking Confirmation
// POST /api/booking-email/send-confirmation
// ─────────────────────────────────────────────────────────────
const sendBookingConfirmation = async (req, res) => {
    const { name, email, phone, mobile, mobileNumber, mobilePhone, courseName, courseCode, courseDate, startTime, endTime, coursePrice, paymentMethod, gatewayTransactionId, bankTransferId } = req.body;

    const finalPhone = phone || mobile || mobileNumber || mobilePhone || "";
    const orderId = formatBookingId(Date.now().toString());
    const priceStr = `$${Number(coursePrice).toFixed(2)}`;
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" });

    // ✅ Default password assigned to new students
    const defaultPassword = "123456";

    // 1. Build Student Confirmation HTML
    const studentHtml = buildStudentHtml({
        orderId,
        student: { firstName: name.split(" ")[0] },
        course: {
            name: courseName,
            code: courseCode,
            deliveryMode: "Face to Face",
            date: new Date(courseDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }),
            time: `${startTime} - ${endTime}`,
            venue: "3/14-16 Marjorie Street, Sefton NSW 2162"
        },
        payment: {
            items: [{ label: courseName, amount: Number(coursePrice).toFixed(2) }],
            total: Number(coursePrice).toFixed(2),
            method: paymentMethod
        },
        portal: { url: "https://portal.safetytrainingacademy.edu.au" }
    });

    const courseDateStrFormatted = courseDate ? new Date(courseDate).toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Australia/Sydney"
    }) : "To be confirmed";

    const adminMailData = {
        bookingId: orderId,
        paymentMethod: paymentMethod,
        bankTransferId: bankTransferId || "—",
        gatewayId: gatewayTransactionId || null,
        contactName: name,
        contactEmail: email,
        contactPhone: finalPhone || "—",
        totalAmount: Number(coursePrice).toFixed(2),
        submittedAt: orderDateStr,
        courseName: courseName,
        courseCode: courseCode,
        deliveryMode: "Face to Face",
        courseDate: courseDateStrFormatted,
        courseTime: `${startTime} - ${endTime}`,
        venue: "3/14-16 Marjorie Street, Sefton NSW 2162",
        notes: null, // Add if available in req.body
        studentPortalUrl: "https://portal.safetytrainingacademy.edu.au/login",
        adminUrl: "https://admin.safetytrainingacademy.edu.au"
    };

    try {
        console.log("--- Email Sending Diagnostics ---");
        console.log("Academy Recipient (BOOKINGS_EMAIL):", process.env.BOOKINGS_EMAIL);
        console.log("Student Recipient:", email);
        console.log("Order ID:", orderId);

        // 1. Send Academy Notification (Delayed by 10 seconds)
        setTimeout(async () => {
            try {
                await sendEmail({
                    to: process.env.BOOKINGS_EMAIL,
                    subject: `New Booking #${orderId} - ${name} - ${courseName}`,
                    html: adminBookingTemplate(adminMailData)
                });
                console.log(`✅ Academy notification sent to ${process.env.BOOKINGS_EMAIL}`);
            } catch (academyErr) {
                console.error(`❌ Academy notification failed for ${process.env.BOOKINGS_EMAIL}:`, academyErr.message);
            }
        }, 10000);

        // 2. Send Student Confirmation
        await sendEmail({
            to: email,
            subject: `Booking Confirmed - ${courseName} (Order #${orderId})`,
            html: studentHtml
        });
        console.log(`✅ Student confirmation sent to ${email}`);

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
            <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Date: ${l.courseDateDisplay || (l.courseDate ? new Date(l.courseDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" }) : "TBC")}</p>
            <p style="margin:0;font-size:13px;"><a href="${l.fullUrl}" style="color:#3b82f6;">${l.fullUrl}</a></p>
        </td></tr>`).join("");

    const companyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
    .co-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
</style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d2240;color:#ffffff;padding:20px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p style="margin:0; font-size:16px; font-weight:700;">Safety Training Academy</p>
            <p style="margin:2px 0 0; font-size:10px; color:#29b6e8; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Company Booking</p>
          </td>
          <td align="right" valign="top">
            <span class="co-badge">Confirmed</span>
          </td>
        </tr>
    </table>
</td></tr>
<tr><td style="height:3px; background:#29b6e8;"></td></tr>
<tr><td style="background:#0a1c33; padding:10px 30px; font-size:12px; color:#89c8e8; font-weight:500;">
    &#10003; Thank you for your booking – Order #${orderId}
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
<tr><td style="background:#0d2240;color:#ffffff;padding:24px 30px;text-align:center;">
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

    const dateStr = courseDate ? new Date(courseDate).toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Australia/Sydney"
    }) : "To be confirmed";

    const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : "To be confirmed";

    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
    .er-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
</style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d2240;color:#ffffff;padding:20px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p style="margin:0; font-size:16px; font-weight:700;">Safety Training Academy</p>
            <p style="margin:2px 0 0; font-size:10px; color:#29b6e8; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Enrollment Confirmation</p>
          </td>
          <td align="right" valign="top">
            <span class="er-badge">Registered</span>
          </td>
        </tr>
    </table>
</td></tr>
<tr><td style="height:3px; background:#29b6e8;"></td></tr>
<tr><td style="background:#0a1c33; padding:10px 30px; font-size:12px; color:#89c8e8; font-weight:500;">
    &#10003; Registration complete – ${courseName}
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
        studentMobile: req.body.phone || req.body.mobile || req.body.mobileNumber || req.body.mobilePhone || "—",
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

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
    .cp-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d2240;color:#ffffff;padding:20px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p style="margin:0; font-size:16px; font-weight:700;">Safety Training Academy</p>
            <p style="margin:2px 0 0; font-size:10px; color:#29b6e8; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Company Portal Notification</p>
          </td>
          <td align="right" valign="top">
            <span class="cp-badge">Welcome</span>
          </td>
        </tr>
    </table>
</td></tr>
<tr><td style="height:3px; background:#29b6e8;"></td></tr>
<tr><td style="background:#0a1c33; padding:10px 30px; font-size:12px; color:#89c8e8; font-weight:500;">
    &#10003; Your company portal access has been successfully configured.
</td></tr>
<tr><td style="padding:30px;">
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1a1a1a;">Your company portal is ready</h2>
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
<tr><td style="background:#0d2240;color:#ffffff;padding:24px 30px;text-align:center;">
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
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td><h1 style="margin:0;font-size:20px;">NEW VOC SUBMISSION</h1></td>
            <td align="right"><span style="font-size:12px;font-weight:700;background:rgba(255,255,255,0.2);padding:4px 8px;border-radius:4px;">ID: ${shortId}</span></td>
        </tr>
    </table>
</td></tr>
<tr><td style="padding:30px;">
    <p>A new VOC submission has been received.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Name</td><td><strong>${firstName} ${lastName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${toEmail}</td></tr>
        <tr><td style="color:#64748b;">Amount</td><td><strong>${priceStr}</strong></td></tr>
        <tr><td style="color:#64748b;">Payment</td><td>${paymentMethod}</td></tr>
        <tr><td style="color:#64748b;">Submission ID</td><td><strong>#${shortId}</strong></td></tr>
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
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;text-align:center;">
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
// 9. LLN Completion Notification
// ─────────────────────────────────────────────────────────────
const sendLLNCompletionNotification = async (req, res) => {
    const { studentEmail, studentName, score, isPassed, bookingId, studentPhone } = req.body;

    const status = isPassed ? "Passed" : "Under Review";
    const statusColor = isPassed ? "#16a34a" : "#ca8a04";
    const statusBg = isPassed ? "#f0fdf4" : "#fefce8";

    // 1. Student Email (Basic Template)
    const studentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;text-align:center;">
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

    // 2. Academy Notification (New High-Fidelity Template)
    const academyHtml = buildLLNNotificationHtml({
        bookingId,
        studentName,
        studentEmail,
        studentPhone,
        score,
        status
    });

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
    const { studentEmail, studentName, bookingId, studentPhone, gatewayTransactionId } = req.body;

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
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td><h1 style="margin:0;font-size:20px;">ENROLLMENT FORM SUBMITTED</h1></td>
            <td align="right"><span style="font-size:12px;font-weight:700;background:rgba(255,255,255,0.2);padding:4px 8px;border-radius:4px;">ID: ${bookingId || "—"}</span></td>
        </tr>
    </table>
</td></tr>
<tr><td style="padding:30px;">
    <p>A student has submitted their enrollment form and is awaiting review.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Student Name</td><td><strong>${studentName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${studentEmail}</td></tr>
        <tr><td style="color:#64748b;">Phone Number</td><td><strong>${studentPhone || "—"}</strong></td></tr>
        <tr><td style="color:#64748b;">Booking ID</td><td><strong>${bookingId || "—"}</strong></td></tr>
        <tr><td style="color:#64748b;">Transaction ID</td><td><strong>${gatewayTransactionId || "—"}</strong></td></tr>
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
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;text-align:center;">
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
    formatBookingId,
};
