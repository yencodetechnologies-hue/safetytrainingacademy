const adminBookingTemplate = (data) => {

  // Extract number only e.g. "BK-10042" → "10042"
  const digits = String(data.bookingId || '').replace(/[^0-9]/g, '');
  const orderNumber = digits !== '' ? digits : (data.bookingId || '—');

  // ── Payment Method Logic ──────────────────────────────────────────
  const rawPm = (data.paymentMethod || 'card').toLowerCase();
  const pm = rawPm.replace(/[-_ ]/g, ''); 

  let paymentMethodLabel = 'Credit Card';
  let paymentStatusLabel = 'Confirmed';
  let paymentStatusColor = '#1e7e34';
  let paymentStatusBg    = '#dcfce7';
  let gatewayIdValue     = '-';
  let bankTransferValue  = '-';

  if (pm === 'banktransfer') {
    paymentMethodLabel = 'Bank Transfer';
    paymentStatusLabel = 'PLZ VERIFY';
    paymentStatusColor = '#c0392b';
    paymentStatusBg    = '#fee2e2';
    bankTransferValue  = data.bankTransferId || data.transactionId || '-';
    gatewayIdValue     = '-';
  }
  else if (pm === 'paylater') {
    paymentMethodLabel = 'Pay Later';
    paymentStatusLabel = 'PLZ VERIFY';
    paymentStatusColor = '#c0392b';
    paymentStatusBg    = '#fee2e2';
    bankTransferValue  = '-';
    gatewayIdValue     = '-';
  }
  else {
    // Default to Card
    paymentMethodLabel = 'Card Payment';
    const hasGateway = (data.gatewayId && data.gatewayId !== '-') || (data.gatewayTransactionId && data.gatewayTransactionId !== '-');
    paymentStatusLabel = hasGateway ? 'Confirmed' : 'PLZ VERIFY';
    paymentStatusColor = hasGateway ? '#1e7e34' : '#c0392b';
    paymentStatusBg    = hasGateway ? '#dcfce7' : '#fee2e2';
    gatewayIdValue     = data.gatewayId || data.gatewayTransactionId || '-';
    bankTransferValue  = '-';
  }

  // Row for Gateway ID
  const gatewayRow = `
    <div class="eb-row">
      <div class="eb-label">Gateway Transaction ID</div>
      <div class="eb-value" style="color: #6366f1;"><strong>${gatewayIdValue}</strong></div>
    </div>`;

  // Row for Bank Transfer / Transaction ID
  const transactionRow = `
    <div class="eb-row">
      <div class="eb-label">Transaction ID</div>
      <div class="eb-value"><strong>${bankTransferValue}</strong></div>
    </div>`;

  // ✅ Pay Later-kku rendu rows-um hide pannuvom
  const extraPaymentRows = (pm === 'paylater') ? '' : (gatewayRow + transactionRow);

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

    /* ── Notes/Alert ── */
    .eb-alert-box { background: #fffbea; border: 1px solid #f5e28a; border-radius: 4px; padding: 12px 14px; font-size: 12px; color: #7a6500; line-height: 1.5; margin-bottom: 12px; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 12px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
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

    <div class="eb-alert">
      ⚠ ACTION REQUIRED: Confirm payment before scheduling student.
    </div>

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
        <!-- Payment Method -->
        <div class="eb-row">
          <div class="eb-label">Payment Method</div>
          <div class="eb-value">${paymentMethodLabel}</div>
        </div>
        <!-- Payment Status -->
        <div class="eb-row">
          <div class="eb-label">Payment Status</div>
          <div class="eb-value">
            <span style="display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; padding:2px 9px; border-radius:2px; background:${paymentStatusBg}; color:${paymentStatusColor};">
              ${paymentStatusLabel}
            </span>
          </div>
        </div>
        <!-- Bank Transfer ID / Gateway ID (conditional) -->
        ${extraPaymentRows}
        <!-- Total Amount at the bottom -->
        <div class="eb-row eb-total-row">
          <div class="eb-label">Total Amount</div>
          <div class="eb-value">$${data.totalAmount || '0.00'}</div>
        </div>
      </div>

      <!-- ── 3. Course Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Course Details</span></div>
        <div class="eb-row">
          <div class="eb-label">Course Name</div>
          <div class="eb-value"><strong>${data.courseName || '—'}</strong></div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Course Code</div>
          <div class="eb-value">${data.courseCode || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Date & Time</div>
          <div class="eb-value">${data.courseDate || '—'} @ ${data.courseTime || '—'}</div>
        </div>
        <div class="eb-row">
          <div class="eb-label">Location</div>
          <div class="eb-value">${data.venue || '—'}</div>
        </div>
      </div>

      ${data.notes ? `
      <!-- ── 4. Notes ── -->
      <div class="eb-alert-box">
        <strong>⚠ Special Requirements / Notes:</strong><br />${data.notes}
      </div>` : ''}

      <!-- ── Action Alert Bottom ── -->
      <div class="eb-alert-box">
        <strong>⚠ ACTION REQUIRED</strong><br />
        Please confirm payment before scheduling this student into the course.
      </div>

    </div><!-- /eb-content -->

    <!-- ── Footer ── -->
    <div class="eb-footer">
      This is an automated admin notification from <strong>Safety Training Academy</strong> (RTO #45234).<br />
      2 Marjorie St, Sefton NSW 2162 &nbsp;·&nbsp; 1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au
    </div>

  </div>
</body>
</html>
  `;
};

module.exports = adminBookingTemplate;
