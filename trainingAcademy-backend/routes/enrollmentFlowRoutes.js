const express = require("express");
const router = express.Router();
const { uploadPayment } = require("../middleware/upload");

const controller = require("../controllers/enrollmentFlowController");

router.post("/create", uploadPayment.single("paymentSlip"), controller.createFlow); // ✅
router.post("/add-course", controller.addCourse);
router.post("/payment", uploadPayment.single("paymentSlip"), controller.updatePayment); // ✅
router.post("/llnd", controller.saveLLND);
router.post("/complete", controller.completeEnrollment);
router.get("/get", controller.getFlow);
router.get("/llnd-results", controller.getLLNDResults);
router.get("/payments", controller.getAllPayments);
router.put("/payment/:enrollmentId/:itemId", controller.updatePaymentStatus);


module.exports = router;