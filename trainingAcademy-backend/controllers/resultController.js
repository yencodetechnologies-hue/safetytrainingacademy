const Result = require("../models/Result");

// ✅ Student-ஓட results எடு
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ studentId }).sort({ assessmentDate: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — result create பண்ணு
exports.createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — result update பண்ணு
exports.updateResult = async (req, res) => {
  try {
    const updated = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Result not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — result delete பண்ணு
exports.deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};