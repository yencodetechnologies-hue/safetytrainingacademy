const express = require("express");
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany, 
  toggleCompanyStatus,
  deleteCompany,
  companyLogin,
} = require("../controllers/companyController");
const { verifyAdmin } = require("../middleware/authMiddleware");
router.post("/login", companyLogin);
router.get("/", verifyAdmin, getAllCompanies);
router.get("/:id", verifyAdmin, getCompanyById);
router.post("/", verifyAdmin, createCompany);
router.put("/:id", verifyAdmin, updateCompany);
router.patch("/:id/toggle-status", verifyAdmin, toggleCompanyStatus);
router.delete("/:id", verifyAdmin, deleteCompany);

module.exports = router;