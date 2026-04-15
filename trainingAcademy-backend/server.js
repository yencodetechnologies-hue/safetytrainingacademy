const express = require("express");
const cors = require("cors");
const Eway = require('eway-rapid');
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const companyRoutes = require("./routes/companyRoutes");
const companyEnrollRoutes = require("./routes/companyEnrollRoutes");
const studentRoutes = require("./routes/studentMainRoutes");
const enrollmentRoutes = require("./routes/enrollmentFlowRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const bookingEmailRoutes = require("./routes/bookingEmailRoutes");
const paymentRouter = require("./routes/paymentRouter");

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = ["http://localhost:5173","https://safety-training-academy.netlify.app","http://72.61.236.154:8000/","http://72.61.236.154:8000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/enrollment-form", require("./routes/enrollmentFormRoutes"));
app.use("/api/companies", companyRoutes);
app.use("/api/book-now", companyEnrollRoutes);
app.use("/api/enroll", studentRoutes);
app.use("/api/llnd", require("./routes/llndRoutes"));
app.use("/api/payment", paymentRouter);
app.use("/api/flow", enrollmentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student", studentDashboardRoutes);
app.use("/api/booking-email", bookingEmailRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});