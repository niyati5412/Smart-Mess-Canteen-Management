const { readData, writeData } = require("../utils/file.util");

// "0" key corruption fix
function cleanBudget(raw) {
  if (!raw) return {};
  const { "0": _discard, ...clean } = raw;
  return clean;
}

// GET /api/budget
exports.getBudget = (req, res) => {
  try {
    const budget   = cleanBudget(readData("budget.json"));
    const mealCost = budget.mealCostPerMeal || budget.perMealCostTarget || 67;
    const fee      = budget.semesterFeePerStudent || 0;
    const students = budget.totalStudents || 0;
    const totalFeeCollected = students * fee;

    res.json({
      ...budget,
      mealCostPerMeal:    mealCost,
      totalFeeCollected,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/budget
exports.updateBudget = (req, res) => {
  try {
    const budget  = cleanBudget(readData("budget.json"));
    const updated = {
      ...budget,
      ...req.body,
    };
    writeData("budget.json", updated);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};