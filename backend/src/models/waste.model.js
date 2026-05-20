const mongoose = require("mongoose");

const wasteSchema = new mongoose.Schema({
  date:     { type: String, default: () => new Date().toISOString().split("T")[0] },
  mealType: { type: String },
  foodItem: { type: String },
  quantity: { type: Number },
  reason:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Waste", wasteSchema);