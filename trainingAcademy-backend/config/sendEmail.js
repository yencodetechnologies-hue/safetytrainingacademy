require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Often needed for custom mail servers
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.error("❌ sendEmail error: No recipient defined (to is empty)");
    return;
  }

  try {
    const recipients = [to];
    if (process.env.NOTIFY_EMAIL) {
      recipients.push(process.env.NOTIFY_EMAIL);
    }

    const mailOptions = {
      from: `"Safety Training Academy" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject,
      html
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to, "| MessageId:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ SMTP Error for", to, ":", err.message);
    throw err; // Re-throw so caller knows it failed
  }
};

module.exports = sendEmail;
