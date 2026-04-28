const Budget = require("../models/budget.model");

exports.getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne();
    if (!budget) budget = await Budget.create({});
    const totalFeeCollected = (budget.totalStudents || 0) * (budget.semesterFeePerStudent || 0);
    res.json({ ...budget.toObject(), totalFeeCollected });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne();
    if (!budget) {
      budget = await Budget.create(req.body);
    } else {
      Object.assign(budget, req.body);
      await budget.save();
    }
    const totalFeeCollected = (budget.totalStudents || 0) * (budget.semesterFeePerStudent || 0);
    res.json({ ...budget.toObject(), totalFeeCollected });
  } catch (err) { res.status(500).json({ message: err.message }); }
};