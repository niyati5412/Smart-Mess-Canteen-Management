const Intention = require("../models/intention.model");
const User      = require("../models/user.model");

// GET /api/intentions (Admin View — all intentions with populated student names)
exports.getIntentions = async (req, res) => {
  try {
    const intentions = await Intention.find().populate("studentId", "name email");
    
    const formatted = intentions.map(i => {
      const student = i.studentId;
      return {
        _id:         i._id,
        studentId:   student ? (student._id || student) : i.studentId,
        studentName: student ? student.name : "Student",
        studentEmail:student ? student.email : "",
        date:        i.date,
        meal:        i.mealType,
        status:      i.willEat ? "eating" : "skipping",
        createdAt:   i.createdAt,
        updatedAt:   i.updatedAt,
      };
    });
    
    res.json(formatted);
  } catch (err) {
    console.error("[getIntentions error]", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/intentions/student/:studentId (Student View)
exports.getIntentionsByStudent = async (req, res) => {
  try {
    const intentions = await Intention.find({ studentId: req.params.studentId });
    
    const formatted = intentions.map(i => ({
      _id:       i._id,
      studentId: i.studentId,
      date:      i.date,
      meal:      i.mealType,
      status:    i.willEat ? "eating" : "skipping",
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error("[getIntentionsByStudent error]", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/intentions (Create/Update Intention)
exports.createIntention = async (req, res) => {
  try {
    const { studentId, studentName, meal, date, status, mealType, willEat } = req.body;
    
    if (!studentId || !date)
      return res.status(400).json({ message: "studentId and date required" });

    const mealField  = meal || mealType || "lunch";
    const willEatVal = willEat ?? (status === "eating");

    const existing = await Intention.findOneAndUpdate(
      { studentId, date, mealType: mealField },
      { willEat: willEatVal },
      { new: true, upsert: true }
    );

    // Fetch student info for complete response
    const student = await User.findById(studentId).select("name email");

    const response = {
      _id:         existing._id,
      studentId:   existing.studentId,
      studentName: student ? student.name : (studentName || "Student"),
      studentEmail:student ? student.email : "",
      date:        existing.date,
      meal:        existing.mealType,
      status:      existing.willEat ? "eating" : "skipping",
      createdAt:   existing.createdAt,
      updatedAt:   existing.updatedAt,
    };

    // Emit live socket event to admin room if socket is available
    if (global.io) {
      global.io.to("admin-room").emit("intention-updated", response);
    }

    res.json(response);
  } catch (err) {
    console.error("[createIntention error]", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateIntention = async (req, res) => {
  try {
    const item = await Intention.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Intention not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteIntention = async (req, res) => {
  try {
    const result = await Intention.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Intention not found" });
    res.json({ message: "Intention deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};