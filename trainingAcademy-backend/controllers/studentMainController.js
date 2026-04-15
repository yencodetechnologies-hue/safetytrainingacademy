const StudentMain = require("../models/student_main");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // 🔥 ADD THIS

exports.createStudent = async (req, res) => {
  try {
    const data = req.body;

    // ✅ Cloudinary image URL
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
        password: hashedPassword,
        courses: [
          {
            courseId: data.courseId,
            sessionId: data.sessionId,
            paymentMethod: data.paymentMethod,   // ✅
            transactionId: data.transactionId,   // ✅
            slipUrl: paymentSlipUrl,              // ✅
            step: 2
          }
        ]
      });

    } else {
      const alreadyExists = student.courses.find(
        c => c.courseId.toString() === data.courseId
      );

      if (!alreadyExists) {
        student.courses.push({
          courseId: data.courseId,
          sessionId: data.sessionId,
          paymentMethod: data.paymentMethod,   // ✅
          transactionId: data.transactionId,   // ✅
          slipUrl: paymentSlipUrl,              // ✅
          step: 2
        });
      }
    }

    await student.save();
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
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET (resume flow later use)
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentMain.findById(id);

    res.json(student);
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
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const data = await EnrollmentFlow.find()
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};

      return {
        id: student._id,
        flowId: flow._id,

        registerDate: student.createdAt? new Date(student.createdAt).toLocaleDateString("en-GB") : "—",
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        type: student.enrollmentType
          ? student.enrollmentType.charAt(0).toUpperCase() + student.enrollmentType.slice(1)
          : "Individual",

        courseCategory: item.course?.courseCategory || "",  // ✅ "Short Courses"
        courseTitle: item.course?.courseName || "",         // ✅ "Rigging Course"
        course: item.course?.courseName || "", 
        paymentMethod: item.payment?.method || "—",
        transactionId: item.payment?.transactionId || "—",
        slipUrl: item.payment?.slipUrl || "—",
        courseBookingDate: flow.sessionDate
          ? `${new Date(flow.sessionDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })} | ${flow.startTime} - ${flow.endTime}`
          : "-",

        llndStatus:
          flow.llnd?.status === "completed"
            ? "Completed"
            : "Not Completed",

        enrollmentForm: flow.enrollmentFormId
          ? "Completed"
          : "Not Completed",

        
paymentStatus: item.payment?.method === "Card Payment"
  ? item.payment?.status === "success"
    ? "Paid"
    : "Unpaid"
  : item.payment?.method === "Bank Transfer"
    ? item.payment?.status === "success"
      ? "Verified"
      :  "Not Verified"
    : "—",

        status: flow.status === "active" ? "Active" : "Inactive",

        lastLogin: student.lastLogin || "Never",
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("ERROR:", err); // 👈 MUST
    res.status(500).json({ error: err.message });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const flow = await EnrollmentFlow.findById(req.params.id);

    if (!flow) {
      return res.status(404).json({ message: "Flow not found" });
    }

    // 🔥 delete flow
    await EnrollmentFlow.findByIdAndDelete(req.params.id);

    // 🔥 delete student also
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
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};