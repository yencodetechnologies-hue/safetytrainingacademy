const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!studentId || studentId === "null") {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // ✅ LLND completed உள்ள flow-ஐ முதல்ல தேடு
    let flow = await EnrollmentFlow.findOne({
      studentId,
      "llnd.status": "completed"
    })
      .sort({ createdAt: -1 })
      .populate("studentId");

    // ✅ இல்லன்னா latest flow எடு
    if (!flow) {
      flow = await EnrollmentFlow.findOne({ studentId })
        .sort({ createdAt: -1 })
        .populate("studentId");
    }

    if (!flow) {
      return res.status(404).json({ message: "No enrollment data found" });
    }


    const paymentVerified = flow.items?.some(
      item => item.payment?.status === "success"
    ) || false;

    const llndScore = flow.llnd?.score || 0;
    const llndStatus = flow.llnd?.status;
    const assessmentPassed = llndStatus === "completed";

    const response = {
      studentName: flow.studentId?.name,
      assessmentScore: llndScore,
      paymentVerified,
      assessmentPassed,
      enrollmentFormApproved: flow.currentStep >= 4,
      enrolledCourses: flow.items?.map(item => ({
        courseId: item.course?.courseId,
        courseName: item.course?.courseName,
        price: item.course?.price,
        paymentStatus: item.payment?.status || "Pending"
      })) || []
    };

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};