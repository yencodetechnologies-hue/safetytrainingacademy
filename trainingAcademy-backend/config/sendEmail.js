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
  try {
    await transporter.sendMail({
      from: `"Safety Training Academy" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ SMTP Error:", err.message);
  }
};

module.exports = sendEmail;