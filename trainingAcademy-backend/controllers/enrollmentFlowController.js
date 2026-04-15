const EnrollmentFlow = require("../models/EnrollmentFlows");
const mongoose = require("mongoose");

// ✅ Create new flow
exports.createFlow = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      courseCategory,
      courseName,
      price,
      enrollmentType,
      sessionDate,
      startTime,
      endTime,
      paymentMethod,
      transactionId,
      slipUrl        // ✅ add பண்ணுங்க
    } = req.body;

    const flow = await EnrollmentFlow.create({
      studentId,
      enrollmentType: enrollmentType || "Individual",
      sessionDate,
      startTime,
      endTime,
      items: [{
        course: {
          courseId,
          price,
          courseCategory,
          courseName,
        },
        payment: {
          method: paymentMethod,
          transactionId,
          slipUrl,       // ✅ req.body-ல் இருந்து வந்த URL
          status: "pending",
        }
      }],
      meta: {
        createdFromIP: req.ip,
        userAgent: req.headers["user-agent"]
      }
    });

    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Add another course
exports.addCourse = async (req, res) => {
  try {
    const { flowId, course } = req.body;

    await EnrollmentFlow.findByIdAndUpdate(flowId, {
      $push: {
        items: {
          course: {
            courseId: course.courseId,
            courseName: course.courseName,
            price: course.price
          }
        }
      }
    });

    res.json({ message: "Course added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { flowId, courseId, payment } = req.body;

    // ✅ Cloudinary image URL
    const paymentSlipUrl = req.file ? req.file.path : null;

    await EnrollmentFlow.updateOne(
      { _id: flowId, "items.course.courseId": courseId },
      {
        $set: {
          "items.$.payment.status": payment.status,
          "items.$.payment.paymentId": payment.paymentId,
          "items.$.payment.amount": payment.amount,
          "items.$.payment.method": payment.method,           // ✅ payment method
          "items.$.payment.transactionId": payment.transactionId, // ✅ transaction ID
          "items.$.payment.slipUrl": paymentSlipUrl,          // ✅ image URL
          "items.$.payment.paidAt": new Date(),
          currentStep: 2
        }
      }
    );

    res.json({ message: "Payment updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Save LLND
exports.saveLLND = async (req, res) => {
  try {
    const { flowId, ...rest } = req.body; // ✅ முதல்ல இது

    // ✅ இப்போ log பண்ணு
  

    if (!flowId) {
      return res.status(400).json({ error: "Flow ID missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(flowId)) {
      return res.status(400).json({ error: "Invalid flowId" });
    }

    const existing = await EnrollmentFlow.findById(flowId);

    if (!existing) {
      return res.status(404).json({ error: "Flow not found for id: " + flowId });
    }

    const formattedAnswers = Object.entries(rest.answers || {}).flatMap(
      ([section, answers]) =>
        Object.entries(answers).map(([key, value]) => ({
          questionId: `${section}-${key}`,
          answer: value
        }))
    );

    const updated = await EnrollmentFlow.findByIdAndUpdate(
      flowId,
      {
        $set: {
          "llnd.answers": formattedAnswers,
          "llnd.score": Number(rest.percentage) || 0,
          "llnd.status": "completed",
          "llnd.summary.total": rest.total,
          "llnd.summary.correct": rest.correct,
          "llnd.summary.percentage": Number(rest.percentage),
          "llnd.summary.sections": rest.sections || [],
          llndRaw: rest,
          currentStep: 3
        }
      },
      { returnDocument: "after" }
    );



    res.json(updated);

  } catch (err) {
    console.error("saveLLND error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Final Enrollment
exports.completeEnrollment = async (req, res) => {
  try {
    const { flowId } = req.body;

    await EnrollmentFlow.findByIdAndUpdate(flowId, {
      enrollment: {
        status: "enrolled",
        enrolledAt: new Date()
      },
      currentStep: 4
    });

    res.json({ message: "Enrollment completed 🎉" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get full flow (resume)
exports.getFlow = async (req, res) => {
  try {
    const { studentId } = req.query;

    const flow = await EnrollmentFlow.findOne({ studentId })
      .sort({ createdAt: -1 })
      .populate("studentId");

    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// controllers/enrollmentFlowController.js

exports.getLLNDResults = async (req, res) => {
  try {
    const data = await EnrollmentFlow.find({
      status: "active",
      "llnd.status": "completed"
    })
      .populate("studentId") // 🔥 IMPORTANT
      .lean();

    const formatted = data.map((flow) => {
      const student = flow.studentId;
      const item = flow.items?.[0] || {};

      return {
        id: flow._id,

        date: flow.createdAt.toISOString().split("T")[0], // ✅ date only

        student: student?.name,
        email: student?.email,
        phone: student?.phone,

        course: item.course?.courseName,
        bookingDate: flow.createdAt.toISOString().split("T")[0],

        // 🔥 FIX HERE
        type:
          student?.enrollmentType === "company"
            ? "Company"
            : "Individual",

        score: flow.llnd?.score || 0,
        result: flow.llnd?.status === "completed" ? "Passed" : "Failed",
        status: flow.llnd?.status === "completed" ? "Approved" : "Pending",

        sections: (flow.llnd?.summary?.sections || []).map(s => ({
          name: s.name,
          score: s.score,
          correct: s.correct || 0,   // ✅ ADD
          total: s.total || 0        // ✅ ADD
        }))
      };
    });

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const enrollments = await EnrollmentFlow.find()
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    let payments = [];
    let stats = {
      pending: 0,
      success: 0,
      failed: 0,
      totalAmount: 0
    };

    enrollments.forEach(enroll => {
      enroll.items.forEach(item => {
        const payment = item.payment;
        if (!payment) return;

        payments.push({
          id: payment.paymentId,
          enrollmentId: enroll._id,   // 🔥 ADD THIS
          itemId: item._id,
          date: payment.paidAt || enroll.createdAt,
          sessionDate: enroll.sessionDate,
          student: enroll.studentId?.name,
          email: enroll.studentId?.email,

          course: item.course.courseName,
          code: item.course.courseId,

          // 🔥 price fallback
          amount: payment.amount || item.course.price || 0,

          status: payment.status,
          transId: payment.transactionId,  // ✅ paymentId இல்லை — transactionId
          method: payment.method,           // ✅ payment method
          type: enroll.enrollmentType || "Individual",  // ✅ Individual/Company
          slipUrl: payment.slipUrl || null, // ✅ image URL
        });

        if (payment.status === "pending") stats.pending++;

        if (payment.status === "success") {
          stats.success++;

          const amount = payment.amount || item.course.price || 0;

          stats.totalAmount += amount;
        }

        if (payment.status === "failed") stats.failed++;
      });
    });

    res.json({
      payments,
      stats: [
        { label: "Pending Verification", value: stats.pending, color: "#f39c12" },
        { label: "Verified Payments", value: stats.success, color: "#27ae60" },
        { label: "Rejected", value: stats.failed, color: "#e74c3c" },
        { label: "Total Verified Amount", value: `$${stats.totalAmount}`, color: "#8e44ad" }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { enrollmentId, itemId } = req.params;
    const { status, reason } = req.body;

    const enrollment = await EnrollmentFlow.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const item = enrollment.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.payment.status = status;

    // optional reject reason
    if (status === "failed") {
      item.payment.rejectionReason = reason;
    }

    await enrollment.save();

    res.json({ message: "Payment updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};