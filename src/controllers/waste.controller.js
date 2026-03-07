const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

exports.getWaste = (req, res) => {
  const waste = readData("waste.json");
  res.json(waste);
};

exports.addWaste = (req, res) => {
  const { mealType, foodItem, quantity, reason } = req.body;

  const waste = readData("waste.json");

  const newWaste = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    mealType,
    foodItem,
    quantity,
    reason
  };

  waste.push(newWaste);

  writeData("waste.json", waste);

  res.status(201).json(newWaste);
};

exports.deleteWaste = (req, res) => {
  const waste = readData("waste.json");

  const updated = waste.filter(w => w.id !== req.params.id);

  writeData("waste.json", updated);

  res.json({ message: "Deleted" });
};