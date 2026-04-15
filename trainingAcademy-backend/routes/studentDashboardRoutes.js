const express = require("express");
const router = express.Router();
const {
  getStudentDashboard
} = require("../controllers/studentDashboardController");

router.get("/dashboard/:id", getStudentDashboard);

module.exports = router;