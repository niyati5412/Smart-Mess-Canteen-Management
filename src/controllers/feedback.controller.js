const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// ─────────────────────────────────────────
// GET /api/feedback
// Returns all feedback
// ─────────────────────────────────────────
exports.getFeedback = (req, res) => {
  const feedback = readData("feedback.json");
  res.json(feedback);
};

// ─────────────────────────────────────────
// GET /api/feedback/:id
// Returns one feedback by ID
// ─────────────────────────────────────────
exports.getFeedbackById = (req, res) => {
  const feedback = readData("feedback.json");
  const item = feedback.find((f) => f.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  res.json(item);
};

// ─────────────────────────────────────────
// POST /api/feedback
// Body: { studentId, studentName, meal, rating, comment, date }
// rating: 1 to 5
// ─────────────────────────────────────────
exports.createFeedback = (req, res) => {

  const {
    studentId,
    studentName,
    meal,
    rating,
    comment,
    date,
    category,
    priority
  } = req.body;

  if (!studentId || !comment) {
    return res.status(400).json({
      message: "studentId and comment are required"
    });
  }

  const feedback = readData("feedback.json");

  const newFeedback = {
    id: crypto.randomUUID(),
    studentId,
    studentName: studentName || "Anonymous",
    meal: meal || "general",
    rating: rating ? Number(rating) : null,
    category: category || "General",
    priority: priority || "low",
    comment,
    date: date || new Date().toISOString().split("T")[0],
    submittedAt: new Date().toISOString()
  };

  feedback.push(newFeedback);
  writeData("feedback.json", feedback);

  res.status(201).json(newFeedback);
};

// ─────────────────────────────────────────
// DELETE /api/feedback/:id
// ─────────────────────────────────────────
exports.deleteFeedback = (req, res) => {
  const feedback = readData("feedback.json");
  const filtered = feedback.filter((f) => f.id !== req.params.id);

  if (filtered.length === feedback.length) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  writeData("feedback.json", filtered);
  res.json({ message: "Feedback deleted successfully" });
};