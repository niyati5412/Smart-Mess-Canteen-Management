const { readData, writeData } = require("../utils/file.util");

// GET BUDGET
exports.getBudget = (req, res) => {
  const budget = readData("budget.json");

  const totalFeeCollected =
    budget.totalStudents * budget.semesterFeePerStudent;

  const expenses =
    budget.expenses.vegetables +
    budget.expenses.grains +
    budget.expenses.dairy +
    budget.expenses.spices +
    budget.expenses.utilities;

  const surplus = totalFeeCollected - expenses;

  res.json({
    ...budget,
    totalFeeCollected,
    expensesTotal: expenses,
    surplus
  });
};

// UPDATE BUDGET
exports.updateBudget = (req, res) => {
  const budget = readData("budget.json");

  const updated = {
    ...budget,
    ...req.body
  };

  writeData("budget.json", updated);

  res.json(updated);
};