const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");

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
 
    // Stats — courses array-இல் இருந்து எடுக்கிறோம்
    const totalCourses    = student.courses?.length || 0
    const completedCourses = student.courses?.filter(c => c.status === "completed").length || 0
    const activeCourses   = totalCourses - completedCourses
 
    // EnrollmentFlow-இல் இருந்து certificates count
    const flows = await EnrollmentFlow.find({ studentId: id }).lean()
    const certCount = flows.filter(f =>
      f.items?.[0]?.payment?.status === "success" && f.enrollmentFormId
    ).length
 
    res.json({
      _id:       student._id,
      name:      student.name,
      email:     student.email,
      phone:     student.phone,
      studentId: `STU-${new Date(student.createdAt).getFullYear()}-${String(student._id).slice(-6).toUpperCase()}`,
      createdAt: student.createdAt,
      dob:       student.dob  || "",
      bio:       student.bio  || "",
      address: {
        street: student.address?.street || "",
        city:   student.address?.city   || "",
        state:  student.address?.state  || "",
        zip:    student.address?.zip    || "",
      },
      emergencyContact: {
        name:  student.emergencyContact?.name  || "",
        phone: student.emergencyContact?.phone || "",
      },
      stats: {
        total:        totalCourses,
        active:       activeCourses,
        completed:    completedCourses,
        certificates: certCount,
      },
    })
  } catch (err) {
    console.error("getStudentProfile error:", err)
    res.status(500).json({ message: err.message })
  }
}