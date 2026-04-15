require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: ` <${process.env.SMTP_USER}>`,
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