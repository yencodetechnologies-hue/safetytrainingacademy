const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // BASIC INFO
    companyName: {
      type: String,
      required: true, 

      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      default: null,
    },

    // STATUS
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    role:{
      type:String,
      default :"Company"
    },

    // LOGIN TRACKING
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);