const mongoose = require("mongoose");
const slugify = require("slugify")
const courseSchema = new mongoose.Schema({

  // BASIC INFO
  courseCode: String,
  title: {
    type: String,
  },

  category: {
    type: String,
    ref: "Category"
  },

  duration: String,
  certificateValidity: String,
  deliveryMethod: String,
  location: String,
  image: String,

  // PRICING
  originalPrice: Number,
  sellingPrice: Number,
  slblStrikePrice: Number,
  slblPrice: Number,

  // DETAILS
  description: [String],
  trainingOverview: [String],
  vocationalOutcome: [String],
  feesCharges: [String],
  optionalCharges: [String],
  outcomePoints: [String],

  // REQUIREMENTS
  requirements: [String],

  handbook: {
    title: String,
    pdf: String,
    url: String
  },

  // PATHWAYS
  pathways: [String],

  // COMBO


  comboType: {
    type: String,
    enum: ["Premium", "Standard"]
  },

  studentsEnrolled: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  experienceBasedBooking: {
    type: Boolean,
    default: false
  },
  comboEnabled: { type: Boolean, default: false },
  comboDescription: String,
  comboPrice: Number,
  comboDuration: String,
  comboType: { type: String, enum: ["Premium", "Standard"] },
  slug: {
    type: String,
    required: true
  },

  withExperiencePrice: Number,
  withExperienceOriginal: Number,
  withoutExperiencePrice: Number,
  withoutExperienceOriginal: Number,

}, { timestamps: true },)
module.exports = mongoose.model("Course", courseSchema) 