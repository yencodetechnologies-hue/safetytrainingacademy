const mongoose = require("mongoose");

const studentMainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    enrollmentType: {
      type: String,
      enum: ["individual", "company","agent"],
      default: "individual"
    },
    password: {
      type: String,
      required: true,
    },

   courses: [
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule"
    },

    paymentMethod: String,
    transactionId: String,
    slipUrl: String,  // ✅ add

    step: {
      type: Number,
      default: 1
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
],
     assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LLNDAssessment"
    },

    // 🔥 Payment
    paymentMethod: String,
    transactionId: String,

    cardName: String,
    cardNumber: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String,

    agreed: Boolean,

    // 🔥 Flow tracking
    step: {
      type: Number,
      default: 2
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft"
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("StudentMain", studentMainSchema);