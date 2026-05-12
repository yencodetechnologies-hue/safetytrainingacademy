const adminBookingTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STA Admin Booking Notification</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }
    .eb-hdr { background: #0d2240; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .eb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 11px; border-radius: 2px; white-space: nowrap; }
    .eb-divider { height: 3px; background: #29b6e8; }
    .eb-alert { background: #0a1c33; padding: 9px 24px; font-size: 12px; color: #89c8e8; font-weight: 500; }
    .eb-content { padding: 18px 24px; }
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #29b6e8; letter-spacing: 1px; text-transform: uppercase; }
    .eb-section-body { padding: 11px 14px; }
    .eb-course-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px; }
    .eb-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .eb-table td { padding: 4px 0; vertical-align: top; }
    .eb-table .lbl { color: #666666; width: 40%; font-weight: 500; }
    .eb-table .val { color: #1a1a1a; font-weight: 700; }
    .eb-table .val-reg { color: #1a1a1a; font-weight: 400; }
    .eb-table .val-blue { color: #1a7fbf; font-weight: 600; }
    .eb-total-row td { border-top: 2px solid #e0e0e0; padding-top: 8px; }
    .eb-total-lbl { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .eb-total-val { font-size: 16px; font-weight: 700; color: #0d2240; text-align: right; }
    .eb-action { border: 2px solid #d4940a; border-radius: 4px; padding: 10px 14px; margin-bottom: 6px; background: #fffbf0; }
    .eb-action-title { font-size: 11px; font-weight: 700; color: #7a5500; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .eb-action-body { font-size: 12px; color: #7a5500; margin: 0; }
    .eb-footer { background: #0d2240; padding: 13px 24px; text-align: center; }
    .eb-footer-brand { font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 3px; }
    .eb-footer-info { font-size: 11px; color: #6fa8c8; line-height: 1.9; margin: 0; }
  </style>
</head>
<body>
  <div class="eb-body">
    <div class="eb-hdr">
      <div>
        <p class="eb-hdr-title">Safety Training Academy</p>
        <p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; Admin Notification</p>
      </div>
      <span class="eb-badge">New Booking</span>
    </div>
    <div class="eb-divider"></div>
    <div class="eb-alert">
      &#128276; You have received a new booking — confirm payment before scheduling.
    </div>
    <div class="eb-content">
      <div class="eb-section">
        <div class="eb-section-head"><span>Student details</span></div>
        <div class="eb-section-body">
          <table class="eb-table">
            <tr>
              <td class="lbl">Name</td>
              <td class="val">${data.studentName}</td>
            </tr>
            <tr>
              <td class="lbl">Email</td>
              <td class="val-blue">${data.studentEmail}</td>
            </tr>
            <tr>
              <td class="lbl">Mobile</td>
              <td class="val">${data.studentMobile}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="eb-section">
        <div class="eb-section-head"><span>Course details</span></div>
        <div class="eb-section-body">
          <p class="eb-course-title">${data.courseName}</p>
          <table class="eb-table">
            <tr>
              <td class="lbl">Date</td>
              <td class="val">${data.courseDate}</td>
            </tr>
            <tr>
              <td class="lbl">Time</td>
              <td class="val-reg">${data.courseTime}</td>
            </tr>
            <tr>
              <td class="lbl">Location</td>
              <td class="val-reg">${data.courseLocation}</td>
            </tr>
            <tr>
              <td class="lbl">Booking ID</td>
              <td class="val">${data.bookingId}</td>
            </tr>
            <tr>
              <td class="lbl">Order date</td>
              <td class="val-reg">${data.orderDate}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="eb-section">
        <div class="eb-section-head"><span>Payment summary</span></div>
        <div class="eb-section-body">
          <table class="eb-table">
            <tr>
              <td class="lbl">Quantity</td>
              <td style="text-align:right; color:#1a1a1a; font-weight:400;">${data.quantity}</td>
            </tr>
            <tr>
              <td class="lbl">Subtotal</td>
              <td style="text-align:right; color:#1a1a1a; font-weight:400;">${data.subtotal}</td>
            </tr>
            <tr>
              <td class="lbl">Payment method</td>
              <td style="text-align:right; color:#1a1a1a; font-weight:400;">${data.paymentMethod}</td>
            </tr>
            <tr class="eb-total-row">
              <td class="eb-total-lbl">Total</td>
              <td class="eb-total-val">${data.total}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="eb-action">
        <p class="eb-action-title">&#9888; Action required</p>
        <p class="eb-action-body">Please confirm payment before scheduling this student into the course.</p>
      </div>
    </div>
    <div class="eb-footer">
      <div class="eb-footer-brand">Safety Training Academy</div>
      <p class="eb-footer-info">
        2 Wellington St, Sefton NSW 2162 &nbsp;·&nbsp; RTO #45234<br>
        1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = adminBookingTemplate;
