const EnrollmentLink = require("../models/EnrollmentLink");

// GET /api/enrollment-links
const getAll = async (req, res) => {
  try {
    const links = await EnrollmentLink.find().sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/enrollment-links/:id
const getOne = async (req, res) => {
  try {
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/enrollment-links
const create = async (req, res) => {
  try {
    const { name, description, course, maxUses, expires, payLater, agent } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Link name is required" });
    }
    const link = await EnrollmentLink.create({
      name: name.trim(),
      description: description || "",
      course: course || "Any course",
      maxUses: maxUses ? parseInt(maxUses) : null,
      expires: expires || null,
      payLater: !!payLater,
      agent: !!agent,
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/enrollment-links/:id
const update = async (req, res) => {
  try {
    const { expires, maxUses } = req.body;
    const link = await EnrollmentLink.findByIdAndUpdate(
      req.params.id,
      {
        expires: expires || null,
        maxUses: maxUses ? parseInt(maxUses) : null,
      },
      { new: true }
    );
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/enrollment-links/:id/toggle-status
const toggleStatus = async (req, res) => {
  try {
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    link.status = link.status === "Active" ? "Inactive" : "Active";
    await link.save();
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/enrollment-links/:id
const remove = async (req, res) => {
  try {
    const link = await EnrollmentLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/enrollment-links/:id/enroll  (public — student enrolls via link)
const enroll = async (req, res) => {
  try {
    const { name, email } = req.body;
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Link not found" });
    if (link.status !== "Active") return res.status(400).json({ success: false, message: "Link is inactive" });
    if (link.maxUses && link.usage >= link.maxUses) {
      return res.status(400).json({ success: false, message: "Link has reached max uses" });
    }
    const today = new Date().toLocaleDateString("en-AU");
    link.students.push({ name, email, date: today });
    link.usage += 1;
    await link.save();
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, toggleStatus, remove, enroll };