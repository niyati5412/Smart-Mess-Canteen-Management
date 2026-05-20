const mongoose = require("mongoose");

const intentionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date:      { type: String, required: true },
  mealType:  { type: String, enum: ["breakfast", "lunch", "dinner", "snacks"], required: true }, // ← add snacks
  willEat:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Intention", intentionSchema);