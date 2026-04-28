const mongoose = require("mongoose");

const canteenItemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, default: "Other" },
  price:     { type: Number, required: true, default: 0 },
  stock:     { type: Number, default: 50 },
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("CanteenItem", canteenItemSchema);