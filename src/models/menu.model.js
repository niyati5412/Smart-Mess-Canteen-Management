const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  day:      { type: String, required: true },
  mealType: { 
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snacks"],  // ← added snacks
    required: true 
  },
  items:    [{ type: String }],
  price:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);