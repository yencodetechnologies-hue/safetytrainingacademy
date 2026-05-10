const Company = require("../models/Company");
const CourseLink = require("../models/CourseLink");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/sendEmail");

const PORTAL_URL = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() || "https://safetytrainingacademy.edu.au";

const buildCompanyWelcomeHtml = ({ companyName, email, password }) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Your company portal is ready</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 20px;font-size:15px;color:#555;">Hello <strong>${companyName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#555;">Your company account has been created with Safety Training Academy. You can now log in to the company portal to manage employee enrolments.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your sign-in details</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#334155;">
            <tr><td style="padding:6px 0;color:#64748b;width:140px;">Company name</td><td style="padding:6px 0;font-weight:600;">${companyName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Email (login)</td><td style="padding:6px 0;font-weight:600;">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Password</td><td style="padding:6px 0;font-family:monospace;font-weight:600;background-color:#fef3c7;padding:4px 10px;border-radius:4px;">${password}</td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:13px;color:#64748b;">Keep this email confidential.</p>
    </td></tr></table>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Company Portal Login</p>
    <p style="margin:0 0 24px;"><a href="${PORTAL_URL}/company/login" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Log in to portal</a></p>
    <p style="margin:0;font-size:14px;color:#64748b;">Questions? Contact us at <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a> or call 1300 976 097.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong>Safety Training Academy</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;

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

    const companyIds = companies.map(c => c._id);

    // Get all course links for these companies
    const [linkAgg, allCompanyLinks] = await Promise.all([
      CourseLink.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } }
      ]),
      CourseLink.find({ companyId: { $in: companyIds } }).select("token companyId").lean()
    ]);

    // Build token → companyId map for fallback enrollment count
    const tokenToCompanyId = {};
    allCompanyLinks.forEach(l => { tokenToCompanyId[l.token] = String(l.companyId); });
    const allTokens = allCompanyLinks.map(l => l.token);

    // Count enrollments: by companyId (new) + by sourceToken (existing null-companyId flows)
    const [enrollByCompanyId, enrollByToken] = await Promise.all([
      EnrollmentFlow.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } }
      ]),
      allTokens.length > 0
        ? EnrollmentFlow.aggregate([
            { $match: { sourceToken: { $in: allTokens }, companyId: null } },
            { $group: { _id: "$sourceToken", count: { $sum: 1 } } }
          ])
        : Promise.resolve([])
    ]);

    const linkMap = Object.fromEntries(linkAgg.map(l => [String(l._id), l.count]));
    const enrollMap = Object.fromEntries(enrollByCompanyId.map(e => [String(e._id), e.count]));
    enrollByToken.forEach(e => {
      const cId = tokenToCompanyId[e._id];
      if (cId) enrollMap[cId] = (enrollMap[cId] || 0) + e.count;
    });

    const enriched = companies.map(c => ({
      ...c.toObject(),
      linkCount: linkMap[String(c._id)] || 0,
      enrollmentCount: enrollMap[String(c._id)] || 0
    }));

    res.status(200).json({
      success: true,
      data: enriched,
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
    const { companyName, email, password, mobileNumber, contactPerson, payLater } = req.body;

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
      contactPerson: typeof contactPerson === "string" ? contactPerson.trim() : "",
      payLater: !!payLater,
      status: "Active",
      role: "Company"
    });

    // Send welcome email — fire and forget (don't block response on failure)
    sendEmail({
      to: company.email,
      subject: "Welcome — your company portal is ready | Safety Training Academy",
      html: buildCompanyWelcomeHtml({ companyName: company.companyName, email: company.email, password })
    }).catch(err => console.error("Company welcome email failed:", err.message));

    const { password: _, ...companyData } = company.toObject();

    res.status(201).json({ success: true, data: companyData, message: "Company created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE COMPANY ──────────────────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    const { companyName, email, mobileNumber, password, contactPerson, payLater } = req.body;

    const updateData = {};
    if (companyName) updateData.companyName = companyName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber || null;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (contactPerson !== undefined) {
      updateData.contactPerson = typeof contactPerson === "string" ? contactPerson.trim() : "";
    }
    if (payLater !== undefined) updateData.payLater = !!payLater;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.status(200).json({ success: true, data: company, message: "Company updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE PAY LATER ────────────────────────────────────────────
exports.togglePayLater = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    company.payLater = !company.payLater;
    await company.save();

    res.status(200).json({
      success: true,
      data: { payLater: company.payLater },
      message: `Pay Later ${company.payLater ? "enabled" : "disabled"} for this company`,
    });
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

// ─── COMPANY DETAILS (admin) ─────────────────────────────────────
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const links = await CourseLink.find({ companyId: req.params.id }).sort({ createdAt: -1 }).lean();

    const linkTokens = links.map(l => l.token);
    const flows = await EnrollmentFlow.find({
      $or: [
        { companyId: req.params.id },
        ...(linkTokens.length > 0 ? [{ sourceToken: { $in: linkTokens } }] : [])
      ]
    })
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const students = flows.map(flow => {
      const student = flow.studentId;
      const item = flow.items?.[0];
      const payStatus = item?.payment?.status;
      const payLabel = payStatus === "success" ? "Paid" : payStatus === "failed" ? "Failed" : "Pending";
      const llndStatus = flow.llnd?.status === "completed" ? "Completed" : "Not Started";
      const formStatus = flow.enrollmentFormId ? "Submitted" : "Pending";
      const trainingStatus = flow.currentStep >= 4 ? "Completed" : flow.currentStep >= 2 ? "In Progress" : "Not Started";
      return {
        name: student?.name || "—",
        email: student?.email || "—",
        phone: student?.phone || "",
        course: item?.course?.courseName || "—",
        amount: item?.payment?.amount ? `$${item.payment.amount}` : "N/A",
        payment: payLabel,
        llnd: llndStatus,
        form: formStatus,
        training: trainingStatus,
        enrolled: new Date(flow.createdAt).toLocaleDateString("en-GB"),
        bill: "N/A",
        sourceToken: flow.sourceToken || ""
      };
    });

    res.json({
      success: true,
      data: {
        ...company.toObject(),
        courseLinks: links,
        courseLinksCount: links.length,
        enrolmentsCount: flows.length,
        students
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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