const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ["admin", "student", "guardian"], required: true },
  profilePic:    { type: String, default: "" },
  wardStudentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  wardName:      { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);