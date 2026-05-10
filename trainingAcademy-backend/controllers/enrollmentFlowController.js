const EnrollmentFlow = require("../models/EnrollmentFlows");
const CourseLink = require("../models/CourseLink");
const Course = require("../models/Course");
const Schedule = require("../models/schedule");
const mongoose = require("mongoose");
const sendEmail = require("../config/sendEmail");
const { sendLLNCompletionNotification, sendEnrollmentFormCompletionNotification } = require("./bookingEmailController");

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
      sessionId,
      quantity,
      paymentMethod,
      transactionId,
      slipUrl,
      companyId,
      source,
      sourceToken
    } = req.body;

    const seats = Math.max(Number(quantity) || 1, 1);

    // Check available slots and decrement atomically
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      const updated = await Schedule.findOneAndUpdate(
        { "sessions._id": sessionId, "sessions.availableSlots": { $gte: seats } },
        { $inc: { "sessions.$.availableSlots": -seats } }
      );
      if (!updated) {
        return res.status(400).json({ error: "This session is full or does not have enough available slots." });
      }
    }

    // ── Booking Link: look up the CourseLink to get the actual price per person
    //    and auto-mark payment as success (company already paid in bulk)
    let resolvedPrice = Number(price) || 0;
    let resolvedPaymentStatus = "pending";
    let resolvedMethod = paymentMethod || "";

    let resolvedCompanyId = companyId || null;

    if (source === "Booking Link" && sourceToken) {
      const link = await CourseLink.findOne({ token: sourceToken }).lean();
      if (link) {
        resolvedPaymentStatus = "success";   // pre-paid by company
        resolvedMethod = "Link Ref";
        if (!resolvedCompanyId && link.companyId) {
          resolvedCompanyId = link.companyId;
        }
      }
    }

    if (source === "Enrollment Link" && sourceToken) {
      resolvedPaymentStatus = "pending";
      resolvedMethod = "Pay Later";
    }

    // If price is still 0, look up the course's price as fallback
    if (!resolvedPrice && courseId) {
      const course = await Course.findById(courseId)
        .select("pricingType sellingPrice slSinglePrice withExperiencePrice withoutExperiencePrice")
        .lean();
      if (course) {
        if (course.pricingType === "experience") {
          resolvedPrice = course.withoutExperiencePrice || course.withExperiencePrice || 0;
        } else if (course.pricingType === "slbl") {
          resolvedPrice = course.slSinglePrice || course.slblPrice || 0;
        } else {
          resolvedPrice = course.sellingPrice || 0;
        }
      }
    }

    const flowData = {
      enrollmentType: enrollmentType || "Individual",
      companyId:      resolvedCompanyId,
      source:         source || "individual",
      sourceToken:    sourceToken || "",
      sessionDate,
      startTime,
      endTime,
      items: [{
        course: {
          courseId,
          price:        resolvedPrice,
          courseCategory,
          courseName,
        },
        payment: {
          amount:        resolvedPrice,
          method:        resolvedMethod,
          transactionId: transactionId || "",
          slipUrl:       slipUrl || "",
          status:        resolvedPaymentStatus,
        }
      }],
      meta: {
        createdFromIP: req.ip,
        userAgent:     req.headers["user-agent"]
      }
    };

    // ✅ studentId — individual-ல valid, company-ல null → skip
    if (studentId && studentId !== "null" && studentId !== "") {
      flowData.studentId = studentId;
    }

    const flow = await EnrollmentFlow.create(flowData);

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });
    }

    res.json(flow);

  } catch (err) {
    console.error("createFlow error:", err);
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

    // ✅ Send Notifications (Non-blocking)
    try {
      const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
      if (populated && populated.studentId) {
        // We call the controller function with a mock req/res or just manually
        // But since we want it to be clean, we'll just call the logic
        const student = populated.studentId;
        const score = updated.llnd?.score || 0;
        const isPassed = score >= 70; // Assuming 70 is pass mark as per system logic

        // Call the email function (we pass a mock object that mimics req.body)
        sendLLNCompletionNotification({
          body: {
            studentEmail: student.email,
            studentName: student.name,
            score: score,
            isPassed: isPassed
          }
        }, null); // pass null for res since we already sent response
      }
    } catch (emailErr) {
      console.error("Failed to trigger LLN emails:", emailErr.message);
    }

  } catch (err) {
    console.error("saveLLND error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateLLNDDate = async (req, res) => {
  try {
    const { flowId, newDate } = req.body;
    if (!flowId || !newDate) {
      return res.status(400).json({ error: "Flow ID and new date are required" });
    }

    const updated = await EnrollmentFlow.findByIdAndUpdate(
      flowId,
      { $set: { "llnd.completedAt": new Date(newDate) } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Flow not found" });
    }

    res.json({ message: "Date updated successfully", updated });
  } catch (err) {
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

    // ✅ Send Notifications (Non-blocking)
    try {
      const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
      if (populated && populated.studentId) {
        const student = populated.studentId;
        sendEnrollmentFormCompletionNotification({
          body: {
            studentEmail: student.email,
            studentName: student.name
          }
        }, null);
      }
    } catch (emailErr) {
      console.error("Failed to trigger Enrollment emails:", emailErr.message);
    }
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

exports.getWeeklyBookings = async (req, res) => {
  try {
    const dateParam = req.query.date ? new Date(req.query.date) : new Date()
    const start = new Date(dateParam)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    // Build keys from local calendar fields (YYYY-MM-DD) instead of
    // toISOString() — which converts to UTC and shifts the date by a day on
    // any non-UTC server (e.g. IST +05:30), causing real bookings to land in
    // a key that the frontend never asks for.
    const localDateKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    const counts = {}
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      counts[localDateKey(date)] = 0
    }

    const flows = await EnrollmentFlow.find({
      sessionDate: { $gte: start, $lte: end }
    }).lean()

    flows.forEach((flow) => {
      if (!flow.sessionDate) return
      const key = localDateKey(new Date(flow.sessionDate))
      if (counts[key] !== undefined) counts[key] += 1
    })

    res.json({
      counts,
      range: `${start.getDate()} ${start.toLocaleString("en", { month: "short" })} - ${end.getDate()} ${end.toLocaleString("en", { month: "short" })} ${end.getFullYear()}`
    })
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

        date: flow.llnd?.completedAt 
          ? new Date(flow.llnd.completedAt).toISOString().split("T")[0] 
          : flow.createdAt.toISOString().split("T")[0],

        completedDate: flow.llnd?.completedAt 
          ? new Date(flow.llnd.completedAt).toLocaleString("en-AU", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
          : null,

        student: student?.name,
        email: student?.email,
        phone: student?.phone,

        course: item.course?.courseName,
        bookingDate: flow.createdAt.toISOString().split("T")[0],

        // 🔥 FIX HERE
        type:
          student?.enrollmentType === "company"
            ? "Company"
            : student?.enrollmentType === "agent"
            ? "Agent"
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

// ... existing code ...

exports.getAllPayments = async (req, res) => {
  try {
    const enrollments = await EnrollmentFlow.find({
      studentId: { $ne: null }
    })
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
      if (enroll.enrollmentType && enroll.enrollmentType.toLowerCase() === "agent") {
        return; // Agent enrollments belong in AgentPayments, not the regular payments queue
      }

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

        if (payment.status === "success" || payment.status === "completed") {
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

    const enrollment = await EnrollmentFlow.findById(enrollmentId).populate("studentId");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const item = enrollment.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.payment.status = status;

    if (status === "failed") {
      item.payment.rejectionReason = reason;
    }

    await enrollment.save();

    if (status === "success" && enrollment.studentId?.email) {
      const student = enrollment.studentId;
      const courseName = item.course?.courseName || "Your Course";
      const sessionDate = enrollment.sessionDate
        ? new Date(enrollment.sessionDate).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : "To be confirmed";
      const timeStr = enrollment.startTime && enrollment.endTime
        ? `${enrollment.startTime} - ${enrollment.endTime}`
        : "To be confirmed";

      const credentialsHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Booking Confirmed!</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${student.name}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Your payment has been verified and your booking is now <strong>confirmed</strong>. Please find your course details and login credentials below.</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <tr><td style="font-size:13px;color:#64748b;width:130px;">Course</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseName}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Date</td><td style="font-size:14px;font-weight:600;color:#334155;">${sessionDate}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Time</td><td style="font-size:14px;font-weight:600;color:#334155;">${timeStr}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Location</td><td style="font-size:14px;font-weight:600;color:#334155;">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#fffbeb;border-radius:8px;border:1px solid #fcd34d;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size:14px;color:#334155;">
            <tr><td style="width:130px;color:#64748b;">Email</td><td style="font-weight:600;">${student.email}</td></tr>
            <tr><td style="color:#64748b;">Password</td><td style="font-family:monospace;font-weight:600;font-size:15px;">123456</td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:13px;color:#92400e;">Please log in to your student dashboard and complete any pending steps (LLND assessment, enrollment form).</p>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Office: <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a></p>
        <p style="margin:0;font-size:14px;color:#334155;">Business: 1300 976 097 | M: 0483 878 887</p>
    </td></tr></table>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong style="color:#334155;">Safety Training Academy</strong><br/>Training Team | 1300 976 097</p>
</td></tr>
</table></td></tr></table></body></html>`;

      await sendEmail({
        to: student.email,
        subject: `Booking Confirmed — ${courseName} | Your Login Details`,
        html: credentialsHtml,
      });
    }

    res.json({ message: "Payment updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};