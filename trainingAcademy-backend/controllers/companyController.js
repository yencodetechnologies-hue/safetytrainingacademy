const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── GET ALL COMPANIES ───────────────────────────────────────────
exports.getAllCompanies = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All Status") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [companies, total] = await Promise.all([
      Company.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Company.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: companies,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE COMPANY ──────────────────────────────────────────
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE COMPANY ──────────────────────────────────────────────
exports.createCompany = async (req, res) => {
  try {
    const { companyName, email, password, mobileNumber } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ success: false, message: "Company name, email and password are required" });
    }

    const existing = await Company.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      mobileNumber: mobileNumber || null,
      status: "Active",
      role:"Company"
    });

    const { password: _, ...companyData } = company.toObject();

    res.status(201).json({ success: true, data: companyData, message: "Company created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE COMPANY ──────────────────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    const { companyName, email, mobileNumber, password } = req.body;

    const updateData = {};
    if (companyName) updateData.companyName = companyName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber || null;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.status(200).json({ success: true, data: company, message: "Company updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE STATUS (ACTIVATE / DEACTIVATE) ───────────────────────
exports.toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    company.status = company.status === "Active" ? "Inactive" : "Active";
    await company.save();

    res.status(200).json({
      success: true,
      data: { status: company.status },
      message: `Company ${company.status === "Active" ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE COMPANY ──────────────────────────────────────────────
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── COMPANY LOGIN ───────────────────────────────────────────────
exports.companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const company = await Company.findOne({ email: email.toLowerCase() });
    if (!company) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (company.status === "Inactive") {
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update last login
    company.lastLogin = new Date();
    await company.save();

    const token = jwt.sign(
      { id: company._id, email: company.email, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...companyData } = company.toObject();

    res.status(200).json({ success: true, token, data: companyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};