const adminBookingTemplate = (data) => {

  // Extract number only e.g. "BK-10042" → "10042"
  const orderNumber = String(data.bookingId).replace(/[^0-9]/g, '');

  // ── Payment Method Logic ──────────────────────────────────────────
  //
  //  paymentMethod === 'bank_transfer'
  //    → Show: Payment Method, Bank Transfer ID, Status: "Plz Verify"
  //
  //  paymentMethod === 'card'
  //    → Show: Payment Method, Gateway ID (if exists)
  //    → Status: "Confirmed"  (if gatewayId present)
  //    → Status: "Plz Verify" (if gatewayId missing)
  //
  //  paymentMethod === 'pay_later'
  //    → Show: Payment Method, Status: "Pending"
  //    → NO gateway/transaction ID shown
  //
  // ─────────────────────────────────────────────────────────────────

  const pm = data.paymentMethod; // 'bank_transfer' | 'card' | 'pay_later'

  let paymentMethodLabel = '—';
  let paymentStatusLabel = '—';
  let paymentStatusColor = '#b8860b';
  let paymentStatusBg    = '#fff8e1';
  let extraPaymentRow    = '';

  if (pm === 'bank_transfer') {
    paymentMethodLabel = 'Bank Transfer';
    paymentStatusLabel = 'Plz Verify';
    paymentStatusColor = '#b8860b';
    paymentStatusBg    = '#fff8e1';
    extraPaymentRow = `
      <div class="eb-row">
        <div class="eb-label">Bank Transfer ID</div>
        <div class="eb-value"><strong>${data.bankTransferId || '—'}</strong></div>
      </div>`;
  }

  else if (pm === 'card' || pm === 'card_payment' || pm === 'Card Payment') {
    paymentMethodLabel = 'Card Payment';
    if (data.gatewayId || data.gatewayTransactionId) {
      paymentStatusLabel = 'Confirmed';
      paymentStatusColor = '#1e7e34';
      paymentStatusBg    = '#e6f4ea';
      extraPaymentRow = `
        <div class="eb-row">
          <div class="eb-label">Gateway ID</div>
          <div class="eb-value"><strong>${data.gatewayId || data.gatewayTransactionId}</strong></div>
        </div>`;
    } else {
      paymentStatusLabel = 'Plz Verify';
      paymentStatusColor = '#b8860b';
      paymentStatusBg    = '#fff8e1';
      extraPaymentRow = '';
    }
  }

  else if (pm === 'pay_later' || pm === 'Pay Later') {
    paymentMethodLabel = 'Pay Later';
    paymentStatusLabel = 'Pending';
    paymentStatusColor = '#b8860b';
    paymentStatusBg    = '#fff8e1';
    extraPaymentRow    = `
      <div class="eb-row">
        <div class="eb-label">Gateway ID</div>
        <div class="eb-value" style="color: #000000;"><strong>—</strong></div>
      </div>`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STA Admin Booking Notification</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }

    /* ── Header ── */
    .eb-hdr { background: #0d2240; padding: 16px 24px; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .eb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }
    .eb-divider { height: 3px; background: #29b6e8; }

    /* ── Alert bar ── */
    .eb-alert { background: #0a1c33; padding: 9px 24px; font-size: 12px; color: #89c8e8; font-weight: 500; }

    /* ── Content ── */
    .eb-content { padding: 18px 24px; }

    /* ── Sections ── */
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    .eb-row { display: flex; border-bottom: 1px solid #f0f0f0; }
    .eb-row:last-child { border-bottom: none; }
    .eb-label { width: 38%; padding: 8px 14px; font-size: 11px; font-weight: 600; color: #666; background: #fafafa; border-right: 1px solid #f0f0f0; flex-shrink: 0; display: flex; align-items: center; }
    .eb-value { padding: 8px 14px; font-size: 12px; color: #1a1a1a; flex: 1; display: flex; align-items: center; word-break: break-word; }
    .eb-value a { color: #29b6e8; text-decoration: none; }

    /* ── Total row ── */
    .eb-total-row .eb-label { background: #f0f6ff; font-size: 13px; font-weight: 700; color: #0d2240; border-top: 2px solid #29b6e8; }
    .eb-total-row .eb-value { font-size: 14px; font-weight: 700; color: #0d2240; background: #f0f6ff; border-top: 2px solid #29b6e8; }

    /* ── Notes ── */
    .eb-note { background: #fffbea; border: 1px solid #f5e28a; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #7a6500; line-height: 1.5; margin-bottom: 12px; }

    /* ── Action button ── */
    .eb-actions { padding: 0 24px 18px; text-align: center; }
    .eb-btn-portal { display: inline-block; padding: 10px 28px; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none; letter-spacing: 0.4px; background: #29b6e8; color: #ffffff; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 12px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
    .eb-footer a { color: #29b6e8; text-decoration: none; }
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
            <p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; Admin Notification</p>
          </td>
          <td align="right" valign="top">
            <span class="eb-badge">New Booking</span>
            <p style="margin: 4px 0 0; font-size: 25px; font-weight: 700; color: #ffffff; text-align: right;">
              Booking ID: ${orderNumber}
            </p>
          </td>
        </tr>
      </table>
    </div>
    <div class="eb-divider"></div>

    <!-- ── Alert bar ── -->
    <div class="eb-alert">🔔&nbsp; You have received a new booking — confirm payment before scheduling.</div>

    <div class="eb-content">

      <!-- ── 1. Student Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Student Details</span></div>
        <div class="eb-row">
          <div class="eb-label">Name</div>
          <div class="eb-value">${data.contactName || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Email</div>
          <div class="eb-value"><a href="mailto:${data.contactEmail}">${data.contactEmail || '—'}</a></div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Phone</div>
          <div class="eb-value"><a href="tel:${data.contactPhone}">${data.contactPhone || '—'}</a></div>
        </div>
      </div>

      <!-- ── 2. Booking Summary ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Booking Summary</span></div>
        <div class="eb-row">
          <div class="eb-label">Booking ID</div>
          <div class="eb-value"><strong>${orderNumber}</strong></div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Submitted</div>
          <div class="eb-value">${data.submittedAt || new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</div>
        </div>
        <div class="eb-row eb-total-row">
          <div class="eb-label">Total Amount</div>
          <div class="eb-value">$${data.totalAmount || '0.00'}</div>
        </div>
        <!-- Payment Method -->
        <div class="eb-row">
          <div class="eb-label">Payment Method</div>
          <div class="eb-value">${paymentMethodLabel}</div>
        </div>
        <!-- Bank Transfer ID / Gateway ID (conditional) -->
        ${extraPaymentRow}
        <!-- Payment Status -->
        <div class="eb-row">
          <div class="eb-label">Payment Status</div>
          <div class="eb-value">
            <span style="display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; padding:2px 9px; border-radius:2px; background:${paymentStatusBg}; color:${paymentStatusColor};">
              ${paymentStatusLabel}
            </span>
          </div>
        </div>
      </div>

      <!-- ── 3. Course Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Course Details</span></div>
        <div class="eb-row">
          <div class="eb-label">Course</div>
          <div class="eb-value"><strong>${data.courseName || '—'}</strong></div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Course Code</div>
          <div class="eb-value">${data.courseCode || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Delivery Mode</div>
          <div class="eb-value">${data.deliveryMode || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Scheduled Date</div>
          <div class="eb-value">${data.courseDate || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Time</div>
          <div class="eb-value">${data.courseTime || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Location / Venue</div>
          <div class="eb-value">${data.venue || '—'}</div>
        </div>
      </div>

      <!-- ── Special Notes (optional) ── -->
      ${data.notes ? `
      <div class="eb-note">
        <strong>⚠ Special Requirements / Notes:</strong><br />${data.notes}
      </div>` : ''}

    </div><!-- /eb-content -->

    <!-- ── Login to Student Portal ── -->
    <div class="eb-actions">
      <a href="${data.studentPortalUrl || 'https://portal.safetytrainingacademy.com.au/login'}" class="eb-btn-portal">
        Login to Student Portal
      </a>
    </div>

    <!-- ── Footer ── -->
    <div class="eb-footer">
      This is an automated admin notification from <strong>Safety Training Academy</strong> (RTO #45234).<br />
      Do not reply directly to this email. &nbsp;|&nbsp;
      <a href="${data.adminUrl || '#'}">Admin Portal</a> &nbsp;|&nbsp;
      <a href="mailto:admin@safetytrainingacademy.com.au">admin@safetytrainingacademy.com.au</a><br />
      &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.
    </div>

  </div>
</body>
</html>
`;
};

module.exports = adminBookingTemplate;
