const Intention = require("../models/intention.model");

exports.getIntentions = async (req, res) => {
  try {
    const intentions = await Intention.find();
    res.json(intentions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getIntentionsByStudent = async (req, res) => {
  try {
    const intentions = await Intention.find({ studentId: req.params.studentId });
    
    // Frontend ke liye format karo
    const formatted = intentions.map(i => ({
      ...i.toObject(),
      meal:   i.mealType,
      status: i.willEat ? "eating" : "skipping",
      date:   i.date,
    }));
    
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

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
      { new: true, upsert: true } // ← upsert add kiya
    );

    // Format karke bhejo
    const response = {
      ...existing.toObject(),
      meal:   existing.mealType,
      status: existing.willEat ? "eating" : "skipping",
    };

    res.json(response);
  } catch (err) { res.status(500).json({ message: err.message }); }
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