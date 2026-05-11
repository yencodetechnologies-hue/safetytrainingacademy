const StudentMain = require("../models/student_main");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CompanyPayment = require("../models/CompanyPayment");
const Company = require("../models/Company");
const CourseLink = require("../models/CourseLink");
const Course = require("../models/Course");
const EnrollmentLink = require("../models/EnrollmentLink");
const Schedule = require("../models/schedule");

exports.createStudent = async (req, res) => {
  try {
    const data = req.body;
    const paymentSlipUrl = req.file ? req.file.path : null;

    let student = await StudentMain.findOne({ email: data.email });

    const rawPassword =
      data.password && data.password.trim() !== ""
        ? data.password
        : "123456";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    if (!student) {
      student = new StudentMain({
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyId: data.companyId || null,
        enrollmentType: data.enrollmentType || "individual",
        password: hashedPassword,
        courses: [
          {
            courseId: data.courseId,
            sessionId: data.sessionId,
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId,
            slipUrl: paymentSlipUrl,
            step: 2
          }
        ]
      });
    } else {
      // If a student record already exists (matched by email) and this new
      // enrolment is happening via a company link, attach the company tag —
      // otherwise the student stays "Individual" forever even though they're
      // booking through a company. This also keeps enrollmentType in sync.
      if (data.companyId && !student.companyId) {
        student.companyId = data.companyId;
      }
      if (data.enrollmentType && data.enrollmentType !== student.enrollmentType) {
        // Only escalate to "company"/"agent"; never silently downgrade a
        // company student back to "individual".
        const incoming = String(data.enrollmentType).toLowerCase();
        if (incoming === "company" || incoming === "agent") {
          student.enrollmentType = incoming;
        }
      }

      const alreadyExists = student.courses.find(
        c => c.courseId.toString() === data.courseId
      );
      if (!alreadyExists) {
        student.courses.push({
          courseId: data.courseId,
          sessionId: data.sessionId,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          slipUrl: paymentSlipUrl,
          step: 2
        });
      }
    }

    await student.save();

    if (!data.skipFlow) {
      // ✅ Fetch session details if sessionId is provided
      const course = await Course.findById(data.courseId).lean();
      let sessionData = {};
      if (data.sessionId) {
        const schedule = await Schedule.findOne({ "sessions._id": data.sessionId });
        if (schedule) {
          const session = schedule.sessions.id(data.sessionId);
          if (session) {
            sessionData = {
              sessionDate: schedule.date,
              startTime: session.startTime,
              endTime: session.endTime
            };
          }
        }
      }

      // ✅ Create EnrollmentFlow so the student shows up in the Admin table
      const newFlow = new EnrollmentFlow({
        studentId: student._id,
        enrollmentType: data.enrollmentType || "individual",
        companyId: data.companyId || null,
        source: "Manual Admin Add",
        ...sessionData,
        items: [{
          course: {
            courseId: course?._id,
            courseName: course?.title,
            courseCategory: course?.courseCategory,
            price: course?.sellingPrice || 0
          },
          payment: {
            method: data.paymentMethod || "Bank Transfer",
            status: data.paymentMethod === "Pay Later" ? "unpaid" : "pending",
            transactionId: data.transactionId || `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount: course?.sellingPrice || 0
          }
        }],
        status: "active",
        currentStep: 4
      });

      await newFlow.save();
    }

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudentCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await StudentMain.findOneAndUpdate(
      {
        _id: studentId,
        "courses.courseId": new mongoose.Types.ObjectId(courseId)
      },
      {
        $set: {
          "courses.$.paymentMethod": req.body.paymentMethod,
          "courses.$.transactionId": req.body.transactionId,
          "courses.$.status": "completed",
          "courses.$.step": 4
        }
      },
      { returnDocument: "after" }
    );

    if (!student) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentMain.findById(id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const courses = student.courses || [];
    const total = courses.length;
    const completed = courses.filter(c => c.status === "completed").length;
    const active = courses.filter(c =>
      c.status !== "completed" && c.status !== "cancelled"
    ).length;
    const certificates = completed;

    res.json({
      ...student,
      stats: { total, active, completed, certificates }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StudentMain.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const data = await EnrollmentFlow.find({
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = await Promise.all(data.map(async (flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};

      // The flow itself is the source of truth for which company an enrolment
      // belongs to (the booking link / company link writes this). We prefer
      // flow.companyId over student.companyId so the student card shows the
      // company even when the student record was created earlier without a
      // company tag (e.g. they first registered as an individual and later
      // enrolled via a company link).
      const resolvedCompanyId = flow.companyId || student.companyId;
      let companyName = "";
      if (resolvedCompanyId) {
        try {
          const company = await Company.findById(resolvedCompanyId).lean();
          companyName = company?.name || company?.companyName || "";
        } catch (e) {}
      }

      let agentName = "";
      if (flow.enrollmentType && flow.enrollmentType.toLowerCase() === "agent" && flow.sourceToken) {
        try {
          const link = await EnrollmentLink.findById(flow.sourceToken).lean();
          agentName = link?.name || "";
        } catch (e) {}
      }

      return {
        id: student._id,
        flowId: flow._id,
        registerDate: student.createdAt
          ? new Date(student.createdAt).toLocaleDateString("en-GB")
          : "—",
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        type: flow.enrollmentType
          ? flow.enrollmentType.charAt(0).toUpperCase() + flow.enrollmentType.slice(1)
          : "Individual",
        companyName,
        agentName,
        courseCategory: item.course?.courseCategory || "",
        courseTitle: item.course?.courseName || "",
        course: item.course?.courseName || "",
        paymentMethod: item.payment?.method || "—",
        transactionId: item.payment?.transactionId || "—",
        slipUrl: item.payment?.slipUrl || "—",
        courseBookingDate: flow.sessionDate
          ? `${new Date(flow.sessionDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            })} | ${flow.startTime} - ${flow.endTime}`
          : "-",
        llndStatus: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        enrollmentForm: flow.enrollmentFormId ? "Completed" : "Not Completed",
        paymentStatus: item.payment?.method === "Card Payment"
          ? (item.payment?.status === "success" || item.payment?.status === "completed") ? "Paid" : "Unpaid"
          : item.payment?.method === "Bank Transfer"
            ? item.payment?.status === "success" ? "Verified" : "Not Verified"
            : item.payment?.method === "Pay Later"
              ? "Unpaid"
              : "—",
        status: flow.status === "active" ? "Active" : "Inactive",
        lastLogin: student.lastLogin || "Never",
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const flow = await EnrollmentFlow.findById(req.params.id);

    if (!flow) {
      return res.status(404).json({ message: "Flow not found" });
    }

    await EnrollmentFlow.findByIdAndDelete(req.params.id);
    await StudentMain.findByIdAndDelete(flow.studentId);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudentStatus = async (req, res) => {
  try {
    const updated = await EnrollmentFlow.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status.toLowerCase() },
      { returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const data = await EnrollmentFlow.find({
      companyId,
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    // Bulk-fetch course prices to fill in when flow doesn't store them
    const courseIds = [...new Set(
      data.flatMap(f => f.items?.map(i => i.course?.courseId).filter(Boolean) || [])
    )];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("sellingPrice")
      .lean();
    const coursePriceMap = Object.fromEntries(
      courses.map(c => [c._id.toString(), c.sellingPrice || 0])
    );

    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};
      const payment = item.payment || {};
      const source = flow.source || "individual";

      const storedPrice = Number(payment.amount) > 0
        ? Number(payment.amount)
        : Number(item.course?.price) > 0
          ? Number(item.course.price)
          : coursePriceMap[item.course?.courseId?.toString()] || 0;

      const price = storedPrice;

      // Payment method display
      const paymentMethod = source === "Booking Link"
        ? "Link Ref"
        : payment.method || "—";

      // Derived payment status — Booking Link seats are always pre-paid
      let paymentStatus;
      if (source === "Booking Link") {
        paymentStatus = "paid";
      } else if (payment.status === "success" || payment.status === "completed") {
        paymentStatus = "paid";
      } else if (payment.status === "failed") {
        paymentStatus = "failed";
      } else if (payment.slipUrl || payment.transactionId) {
        paymentStatus = "pending";
      } else {
        paymentStatus = "not_paid";
      }

      return {
        id: student._id || flow._id,
        flowId: flow._id,
        name: student.name || "—",
        email: student.email || "—",
        phone: student.phone || "—",
        course: item.course?.courseName || "—",
        amount: `$${price}`,
        amountNum: price,
        paymentMethod,
        paymentStatus,
        source,
        llnd: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        form: flow.enrollmentFormId ? "Submitted" : "Not Submitted",
        training: flow.status === "active" ? "Active" : "Inactive",
        enrolled: new Date(flow.createdAt).toLocaleString("en-AU"),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // ✅ CompanyPayment-லிருந்து எடு
    const companyPayments = await CompanyPayment.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();

    const payments = [];

    for (const payment of companyPayments) {
      const isPaid = payment.status === "success" || payment.confirmed === true;

      if (payment.courses?.length > 0) {
        // ✅ Per course row
        for (const course of payment.courses) {
          const total = (course.pricePerPerson || 0) * (course.quantity || 1);

          // ✅ CourseLink-லிருந்து usage எடு
          const link = await CourseLink.findOne({
            companyPaymentId: payment._id,
            courseId: course.courseId
          }).lean();

          const usedCount = link?.usedCount || 0;
          const maxUses = link?.maxUses || course.quantity || 1;

          payments.push({
            id: `${payment._id}_${course.courseId}`,
            date: new Date(payment.createdAt).toLocaleDateString("en-AU"),
            student: `${usedCount}/${maxUses} enrolled`,
            course: course.courseName || "—",
            payment: isPaid ? "paid" : "pending",
            total,
            paid: isPaid ? total : 0,
            balance: isPaid ? 0 : total,
          });
        }
      } else {
        // ✅ Fallback
        payments.push({
          id: payment._id,
          date: new Date(payment.createdAt).toLocaleDateString("en-AU"),
          student: "—",
          course: "—",
          payment: isPaid ? "paid" : "pending",
          total: payment.amount || 0,
          paid: isPaid ? payment.amount || 0 : 0,
          balance: isPaid ? 0 : payment.amount || 0,
        });
      }
    }

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.paySelected = async (req, res) => {
  try {
    const { flowIds, amount, method, companyId, transactionId } = req.body;
    const receiptUrl = req.file?.path || "";
    const ids = JSON.parse(flowIds || "[]");

    await Promise.all(ids.map(id =>
      EnrollmentFlow.findByIdAndUpdate(id, {
        $set: {
          "items.0.payment.method": method,
          "items.0.payment.transactionId": transactionId || "",
          "items.0.payment.slipUrl": receiptUrl,
          "items.0.payment.status": method === "Card Payment" ? "success" : "pending",
        }
      })
    ));

    if (companyId && companyId.length === 24) {
      const company = await Company.findById(companyId).lean();
      await CompanyPayment.create({
        companyId,
        companyName: company?.companyName || "",
        email: company?.email || "",
        mobile: company?.mobileNumber || "",
        amount: Number(amount),
        paymentMethod: method === "Card Payment" ? "Card" : "Bank Transfer",
        courseCount: ids.length,
        receiptUrl,
        transactionReference: transactionId || "",
        status: method === "Card Payment" ? "success" : "pending",
        confirmed: method === "Card Payment",
      });
    }

    res.json({ success: true, message: "Payment submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentsByLink = async (req, res) => {
  try {
    const { companyId, token } = req.params;

    const data = await EnrollmentFlow.find({
      companyId,
      sourceToken: token,
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = [...new Set(
      data.flatMap(f => f.items?.map(i => i.course?.courseId).filter(Boolean) || [])
    )];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("sellingPrice")
      .lean();
    const coursePriceMap = Object.fromEntries(
      courses.map(c => [c._id.toString(), c.sellingPrice || 0])
    );

    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};
      const payment = item.payment || {};

      const price = Number(payment.amount) > 0
        ? Number(payment.amount)
        : Number(item.course?.price) > 0
          ? Number(item.course.price)
          : coursePriceMap[item.course?.courseId?.toString()] || 0;

      // All students in getStudentsByLink came via a Booking Link — always paid
      let paymentStatus;
      if (payment.status === "success" || payment.status === "completed" || flow.source === "Booking Link") {
        paymentStatus = "paid";
      } else if (payment.status === "failed") {
        paymentStatus = "failed";
      } else if (payment.slipUrl || payment.transactionId) {
        paymentStatus = "pending";
      } else {
        paymentStatus = "not_paid";
      }

      return {
        id: student._id || flow._id,
        name: student.name || "—",
        email: student.email || "—",
        course: item.course?.courseName || "—",
        amount: `$${price}`,
        paymentStatus,
        llnd: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        enrolled: new Date(flow.createdAt).toLocaleString("en-AU"),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
