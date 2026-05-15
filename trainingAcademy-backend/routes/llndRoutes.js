const express = require("express");
const router = express.Router();
const { saveLLN, getAllLLN } = require("../controllers/LLNController");

router.post("/:studentId/:courseId", saveLLN);
router.get("/", getAllLLN);

module.exports = router;