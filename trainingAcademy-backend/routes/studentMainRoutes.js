const express = require("express");
const router = express.Router();
const { uploadPayment } = require("../middleware/upload"); // ✅ add

const {
  createStudent,
  updateStudent,
  getStudentById,
  updateStudentCourse,
  getAllStudents,
  updateStudentStatus,
  deleteStudent
} = require("../controllers/studentMainController");

router.post("/enrollment", uploadPayment.single("paymentSlip"), createStudent); // ✅ middleware add
router.put("/enrollment/:id", updateStudent);
router.get("/enrollment/:id", getStudentById);
router.put("/enrollment/:studentId/:courseId", updateStudentCourse);
router.get("/", getAllStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.patch("/:id/status", updateStudentStatus);
router.delete("/:id", deleteStudent);

module.exports = router;