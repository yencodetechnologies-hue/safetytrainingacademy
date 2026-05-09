const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");

const {
  getAllPayments,
  getMyPayments,
  createPayment,
  uploadReceipt,
  confirmPayment,
  updateStatus,
  deletePayment,
  getPaymentDetails,
} = require("../controllers/companyPaymentController");

const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "company-receipts",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  },
});

const uploadReceipt_ = multer({ storage: receiptStorage });


router.post("/", uploadReceipt_.single("receipt"), createPayment);
router.get("/my",                    verifyToken, getMyPayments);
router.patch("/:id/receipt",         verifyToken, uploadReceipt);
router.get("/",                      verifyAdmin, getAllPayments);
router.get("/:id/details",           verifyAdmin, getPaymentDetails);
router.patch("/:id/confirm",         verifyAdmin, confirmPayment);
router.patch("/:id/status",          verifyAdmin, updateStatus);
router.delete("/:id",                verifyAdmin, deletePayment);

module.exports = router;