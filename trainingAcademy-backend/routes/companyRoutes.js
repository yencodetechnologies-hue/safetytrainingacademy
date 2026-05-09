const express = require("express");
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  getCompanyDetails,
  createCompany,
  updateCompany,
  toggleCompanyStatus,
  togglePayLater,
  deleteCompany,
  companyLogin,
} = require("../controllers/companyController");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");
router.post("/login", companyLogin);
router.get("/", verifyAdmin, getAllCompanies);
router.get("/:id/details", verifyAdmin, getCompanyDetails);
router.get("/:id", verifyToken, getCompanyById)
router.post("/", verifyAdmin, createCompany);
router.put("/:id", verifyAdmin, updateCompany);
router.patch("/:id/toggle-status", verifyAdmin, toggleCompanyStatus);
router.patch("/:id/toggle-pay-later", verifyAdmin, togglePayLater);
router.delete("/:id", verifyAdmin, deleteCompany);
router.post("/register", createCompany);

module.exports = router;