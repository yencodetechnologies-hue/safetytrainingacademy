const express = require("express");
const router = express.Router();
const { createEnrollmentForm, getEnrollmentForms, updateEnrollmentStatus,saveSection } = require("../controllers/enrollmentFormController");
const { uploadEnrollment } = require("../middleware/upload");

// ✅ ஒரே route — middleware சேர்த்து
router.post("/",
  uploadEnrollment.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "photoDocument", maxCount: 1 },
    { name: "signature", maxCount: 1 }
  ]),
  createEnrollmentForm
);
router.post("/section", saveSection);
router.get("/", getEnrollmentForms);
router.patch("/:id/status", updateEnrollmentStatus);

module.exports = router;