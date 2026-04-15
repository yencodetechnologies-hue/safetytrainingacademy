const User = require("../models/User");
const Company = require ("../models/Company")
const StudentMain = require("../models/student_main");
const EnrollmentFlows = require("../models/EnrollmentFlows");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req,res)=>{
 try{

 const {name,email,phone,password,role} = req.body;

 const userExists = await User.findOne({email});

 if(userExists){
   return res.status(400).json({message:"User already exists"});
 }

 const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password || "123456", salt);
 const user = await User.create({
   name,
   email,
   phone,
   password:hashedPassword,
   role,
 });

res.json({
message:"Register success",

});

 }catch(err){
   res.status(500).json({message:"Server Error"});
 }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 FIRST check StudentMain
    let student = await StudentMain.findOne({ email });

    if (student) {
      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign(
        { id: student._id, role: "Student" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          id: student._id,   // 🔥 IMPORTANT
          name: student.name,
          email: student.email,
          role: "Student"
        }
      });
    }

    // 🔥 fallback → User
    let user = await User.findOne({ email });

    if (!user) {
      user = await Company.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.companyName || user.email,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
// POST /api/auth/auto-login

exports.autoLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔥 1. Check StudentMain first
    let student = await StudentMain.findOne({ email });

    if (student) {
      const token = jwt.sign(
        { id: student._id, role: "Student" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: "Student"
        }
      });
    }

    // 🔥 2. fallback → User
    let user = await User.findOne({ email });

    if (!user) {
      user = await Company.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.companyName || user.email,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};