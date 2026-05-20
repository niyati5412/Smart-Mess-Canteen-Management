const express = require("express");
const router = express.Router();
const intentionController = require("../controllers/intention.controller");

// GET    /api/intentions
router.get("/", intentionController.getIntentions);

// GET    /api/intentions/student/:studentId
router.get("/student/:studentId", intentionController.getIntentionsByStudent);

// POST   /api/intentions
router.post("/", intentionController.createIntention);

// PUT    /api/intentions/:id
router.put("/:id", intentionController.updateIntention);

// DELETE /api/intentions/:id
router.delete("/:id", intentionController.deleteIntention);

module.exports = router;