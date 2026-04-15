const mongoose = require("mongoose");

const EnrollmentFlowSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentMain",
    required: true,
    index: true
  },

  items: [
    {
      course: {
        courseId: mongoose.Schema.Types.ObjectId,
        courseName: String,
        courseCategory: String,
        price: Number
      },

      payment: {
        status: {
          type: String,
          enum: ["pending", "success", "failed"],
          default: "pending"
        },
        paymentId: String,
        amount: Number,
        paidAt: Date, method: String,        // ✅ add
        transactionId: String, // ✅ add
        slipUrl: String,       // ✅ add
        rejectionReason: String
      },

      status: {
        type: String,
        enum: ["selected", "paid", "completed"],
        default: "selected"
      }
    }
  ],

  llnd: {
    answers: [{
      questionId: String, // 🔥 FIXED
      answer: String
    }],

    summary: {
      total: Number,
      correct: Number,
      percentage: Number,
      sections: [{
        name: String,
        score: Number,
        correct: Number,  // ✅ add
        total: Number,
        status: String
      }]
    },

    score: Number,

    status: {
      type: String,
      enum: ["not_started", "completed"],
      default: "not_started"
    }
  },
  sessionDate: Date,
  startTime: String,
  endTime: String,
  enrollmentFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnrollmentForm"
  },

  currentStep: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 1,
    index: true
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    index: true
  },

  meta: {
    createdFromIP: String,
    userAgent: String
  }

}, { timestamps: true });

module.exports = mongoose.model("EnrollmentFlow", EnrollmentFlowSchema);