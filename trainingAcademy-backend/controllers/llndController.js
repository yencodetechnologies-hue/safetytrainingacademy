const LLN = require("../models/LLNAssessment");
const StudentMain = require("../models/student_main");

exports.saveLLN = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // 🔥 create LLN
    const savedLLN = await LLN.create({
      student: studentId,
      course: courseId,
      answers: req.body.answers,
      result: req.body.result,
      status: req.body.result.status
    });

    // 🔥 link to studentMain
    await StudentMain.findOneAndUpdate(
      {
        _id: studentId,
        "courses.courseId": courseId
      },
      {
        $set: {
          "courses.$.assessmentId": LLN._id,
          "courses.$.step": 3
        }
      }
    );

    res.json(savedLLN);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllLLN = async (req, res) => {
  try {
    const data = await LLN.find()
      .populate("student", "name email phone mobileNumber mobile enrollmentType")
      .populate("course", "title courseName")
      .sort({ createdAt: -1 });

    // Format data to match what the frontend expects
    const formatted = data.map(item => ({
      id: item._id,
      date: item.createdAt,
      rawDate: item.createdAt,
      student: item.student?.name || item.name || "Unknown",
      email: item.student?.email || item.email || "N/A",
      phone: item.student?.phone || item.student?.mobileNumber || item.phone || "N/A",
      course: item.course?.title || item.course?.courseName || "Unknown",
      score: item.percentage || item.score || 0,
      result: item.status || "N/A",
      status: item.approved ? "Approved" : "Pending",
      sections: item.sections || [],
      type: item.student?.enrollmentType || "Individual"
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};