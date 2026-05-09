const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");
const Course = require("../models/Course");

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!studentId || studentId === "null") {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    let flow = await EnrollmentFlow.findOne({
      studentId,
      "llnd.status": "completed"
    })
      .sort({ createdAt: -1 })
      .populate("studentId");

    if (!flow) {
      flow = await EnrollmentFlow.findOne({ studentId })
        .sort({ createdAt: -1 })
        .populate("studentId");
    }

    if (!flow) {
      return res.status(200).json({
        studentName: null,
        assessmentScore: 0,
        paymentVerified: false,
        assessmentPassed: false,
        enrollmentFormApproved: false,
        paymentMethod: "",
        enrollmentType: "Individual",
        enrolledCourses: []
      });
    }

    const isAgentEnrollment = flow.enrollmentType === "agent" || flow.enrollmentType === "Agent" || flow.source === "Enrollment Link";
    const paymentVerified = isAgentEnrollment || flow.items?.some(
      item => item.payment?.status === "success"
    ) || false;

    const llndScore = flow.llnd?.score || 0;
    const llndStatus = flow.llnd?.status;
    const assessmentPassed = llndStatus === "completed";

    const firstItem = flow.items?.[0];
    const paymentMethod = firstItem?.payment?.method || "";

    let enrollmentType = flow.enrollmentType;

    if (!enrollmentType) {
      enrollmentType = flow.companyId ? "Company" : "Individual";
    }

    if (!enrollmentType && flow.studentId?.enrollmentType) {
      const studentEnrollmentType = flow.studentId.enrollmentType;
      enrollmentType = studentEnrollmentType.charAt(0).toUpperCase() +
        studentEnrollmentType.slice(1).toLowerCase();
    }

    enrollmentType = enrollmentType || "Individual";

    // ✅ Course image + student selected session only
    const enrolledCourses = await Promise.all(
      (flow.items || []).map(async (item) => {
        const course = await Course.findById(item.course?.courseId)
          .select("image").lean();

        return {
          courseId: item.course?.courseId,
          courseName: item.course?.courseName,
          price: item.course?.price,
          paymentStatus: item.payment?.status || "Pending",
          image: course?.image || null,
          sessionDate: flow.sessionDate || null,
          startTime: flow.startTime || null,
          endTime: flow.endTime || null,
        };
      })
    );

    const response = {
      studentName: flow.studentId?.name,
      assessmentScore: llndScore,
      paymentVerified,
      assessmentPassed,
      enrollmentFormApproved: flow.currentStep >= 4,
      paymentMethod,
      enrollmentType,
      enrolledCourses
    };

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await StudentMain.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const totalCourses = student.courses?.length || 0;
    const completedCourses = student.courses?.filter(c => c.status === "completed").length || 0;
    const activeCourses = totalCourses - completedCourses;

    const flows = await EnrollmentFlow.find({ studentId: id }).lean();
    const certCount = flows.filter(f =>
      f.items?.[0]?.payment?.status === "success" && f.enrollmentFormId
    ).length;

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentId: `STU-${new Date(student.createdAt).getFullYear()}-${String(student._id).slice(-6).toUpperCase()}`,
      createdAt: student.createdAt,
      dob: student.dob || "",
      bio: student.bio || "",
      address: {
        street: student.address?.street || "",
        city: student.address?.city || "",
        state: student.address?.state || "",
        zip: student.address?.zip || "",
      },
      emergencyContact: {
        name: student.emergencyContact?.name || "",
        phone: student.emergencyContact?.phone || "",
      },
      stats: {
        total: totalCourses,
        active: activeCourses,
        completed: completedCourses,
        certificates: certCount,
      },
    });
  } catch (err) {
    console.error("getStudentProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};