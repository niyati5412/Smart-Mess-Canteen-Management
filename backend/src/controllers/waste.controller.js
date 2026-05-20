const Waste = require("../models/waste.model");

exports.getWaste = async (req, res) => {
  try {
    const waste = await Waste.find();
    res.json(waste);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addWaste = async (req, res) => {
  try {
    const { mealType, foodItem, quantity, reason } = req.body;
    const newWaste = await Waste.create({ mealType, foodItem, quantity, reason });
    res.status(201).json(newWaste);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteWaste = async (req, res) => {
  try {
    await Waste.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};