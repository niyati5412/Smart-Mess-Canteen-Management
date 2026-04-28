const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price:    { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // ── Student info (denormalised for fast display) ──
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName:   { type: String, default: "" },
  roll:          { type: String, default: "" },
  dept:          { type: String, default: "" },

  // ── Order details ──
  orderId:       { type: String, unique: true },   // human-readable e.g. ORD-00042
  items:         { type: [orderItemSchema], default: [] },
  meal:          { type: String, enum: ["Breakfast","Lunch","Dinner","Snacks"], default: "Lunch" },
  totalAmount:   { type: Number, required: true },
  time:          { type: String, default: "" },    // display string e.g. "1:45 PM"

  // ── Status ──
  status: {
    type: String,
    enum: ["pending","preparing","ready","delivered","cancelled"],
    default: "pending"
  },
  paymentStatus: { type: String, enum: ["paid","unpaid"], default: "unpaid" },

  // ── Legacy fields (kept for backward compat) ──
  menuId:     { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
  quantity:   { type: Number, default: 1 },
  totalPrice: { type: Number },

}, { timestamps: true });

// Auto-generate a short human-readable orderId before saving
orderSchema.pre("save", async function () {  // ← remove (next)
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(5, "0")}`;
  }
  if (this.totalAmount) this.totalPrice = this.totalAmount;
  // ← remove next()
});
module.exports = mongoose.model("Order", orderSchema);