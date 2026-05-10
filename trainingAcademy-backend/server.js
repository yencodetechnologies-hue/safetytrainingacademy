require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const companyEnrollRoutes = require("./routes/companyEnrollRoutes");
const studentRoutes = require("./routes/studentMainRoutes");
const enrollmentRoutes = require("./routes/enrollmentFlowRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const bookingEmailRoutes = require("./routes/bookingEmailRoutes");
const paymentRouter = require("./routes/paymentRouter");
const enrollmentLinksRouter = require("./routes/enrollmentLinks");
const galleryRouter = require("./routes/gallery")
const companypaymentroute = require("./routes/companypaymentroute");
const courseLinkRoutes = require("./routes/courseLinkRoutes")
const resultRoutes = require("./routes/resultRoutes");
connectDB();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://safety-training-academy.netlify.app",
  "https://api.octosofttechnologies.in",
  "https://safetytrainingacademy.vercel.app",
  "https://www.safetytrainingacademy.edu.au",
  "https://safetytrainingacademy.edu.au",
  "http://72.61.236.154:8000",

];

// Combine with origins from .env
if (process.env.CLIENT_ORIGIN) {
  process.env.CLIENT_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches exactly or with a trailing slash
      const isAllowed = allowedOrigins.some(allowed => {
        return origin === allowed || origin === allowed + "/";
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`CORS blocked for origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  })
);

// ✅ Increased limits to handle file uploads up to 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
app.use("/api/enrollment-links", enrollmentLinksRouter);
app.use("/api/gallery", galleryRouter)
app.use("/api/company-payments", companypaymentroute);
app.use("/api/course-links", courseLinkRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/categories", require("./routes/categoryRoutes")); // ✅ ADD
app.use("/api/sliders", require("./routes/sliderRoutes"));
app.use("/api/partners", require("./routes/partnerRoutes"));
app.use("/api/voc", require("./routes/vocRoutes"));

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  
  // Ensure CORS headers are present on error responses
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes(origin + "/"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});