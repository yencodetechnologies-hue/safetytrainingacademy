// routes/enrollmentFormRoutes.js
const express = require("express");
const router = express.Router();
const { 
  createEnrollmentForm, 
  getEnrollmentForms, 
  updateEnrollmentStatus,
  saveSection,
  saveSection2File,
  saveSection3File,
  deleteSection2File  ,
  deleteSection3File,
  deleteSection5File// ✅ NEW
} = require("../controllers/enrollmentFormController");
const { uploadEnrollment } = require("../middleware/upload");

router.post("/",
  uploadEnrollment.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "photoDocument", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "qualificationFile", maxCount: 1 },  // ✅ ADD THIS
    { name: "staIdFile", maxCount: 1 }, 
  ]),
  createEnrollmentForm
);

router.post("/section2-file",
  uploadEnrollment.single("staIdFile"),
  saveSection2File
);

// ✅ NEW - Section 3 file upload
router.post("/section3-file",
  uploadEnrollment.single("qualificationFile"),
  saveSection3File
);
router.delete("/section2-file", deleteSection2File)
router.post("/section", saveSection);
router.get("/", getEnrollmentForms);
router.patch("/:id/status", updateEnrollmentStatus);
router.delete("/section3-file", deleteSection3File)
router.delete("/section5-file", deleteSection5File)

module.exports = router;