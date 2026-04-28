const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  month:                 { type: String },
  totalStudents:         { type: Number, default: 0 },
  semesterFeePerStudent: { type: Number, default: 0 },
  mealCostPerMeal:       { type: Number, default: 67 },
  perMealCostTarget:     { type: Number, default: 67 },
  items:                 [{ name: String, amount: Number }],
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);