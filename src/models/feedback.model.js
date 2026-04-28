const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, default: "Anonymous" },
  meal: { type: String, default: "general" },
  rating: { type: Number, min: 1, max: 5, default: null },
  category: { type: String, default: "General" },
  priority: { type: String, default: "low" },
  comment: { type: String, required: true },
  date: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);