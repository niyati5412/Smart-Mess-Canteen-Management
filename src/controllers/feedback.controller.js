const Feedback = require("../models/feedback.model");

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const item = await Feedback.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Feedback not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { studentId, studentName, meal, rating, comment, date, category, priority } = req.body;

    if (!studentId || !comment) {
      return res.status(400).json({ message: "studentId and comment are required" });
    }

    const newFeedback = await Feedback.create({
      studentId, studentName, meal, rating, comment,
      date: date || new Date().toISOString().split("T")[0],
      category, priority
    });

    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const result = await Feedback.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};