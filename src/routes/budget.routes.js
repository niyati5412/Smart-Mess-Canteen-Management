const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller");

// GET budget
router.get("/", budgetController.getBudget);

// UPDATE budget
router.put("/", budgetController.updateBudget);

module.exports = router;