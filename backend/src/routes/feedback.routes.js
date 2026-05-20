const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");

// GET    /api/feedback
router.get("/", feedbackController.getFeedback);

// GET    /api/feedback/:id
router.get("/:id", feedbackController.getFeedbackById);

// POST   /api/feedback
router.post("/", feedbackController.createFeedback);

// DELETE /api/feedback/:id
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;