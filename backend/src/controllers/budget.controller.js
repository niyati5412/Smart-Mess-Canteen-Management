const Budget = require("../models/budget.model");

function deriveFields(budget) {
  const fee = budget.semesterFeePerStudent || 0;
  const students = budget.totalStudents || 0;
  const target = budget.perMealCostTarget || 0;
  const items = budget.items || [];

  const totalFeeCollected = fee * students;

  const expensesTotal = items.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const perMealCostAvg = budget.mealCostPerMeal || target || 0;

  const semesterDays = budget.semesterDays || 120;

  const now = new Date();
  const currentMonth =
    budget.month ||
    now.toLocaleString("en-IN", { month: "short" });

  const semesterYear = now.getFullYear();

  const monthlyBreakdown = buildMonthlyBreakdown(
    expensesTotal,
    now
  );

  const categoryBreakdown = buildCategoryBreakdown(
    items,
    expensesTotal
  );

  const mealCosts = buildMealCosts(perMealCostAvg);

  const dailyLog = buildDailyLog(
    items,
    students,
    perMealCostAvg
  );

  return {
    semesterFeePerStudent: fee,
    totalStudents: students,
    perMealCostTarget: target,
    semesterDays,

    totalFeeCollected,
    expensesTotal,
    currentMonth,
    semesterYear,
    perMealCostAvg,
    monthlyBreakdown,
    categoryBreakdown,
    mealCosts,
    dailyLog,
  };
}

function buildMonthlyBreakdown(expensesTotal, now) {
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const currentMonthIdx = now.getMonth();

  const perMonth =
    expensesTotal > 0
      ? Math.round(expensesTotal / 2)
      : 0;

  const breakdown = {};

  for (let i = 2; i >= 1; i--) {
    const idx =
      ((currentMonthIdx - i) + 12) % 12;

    const key = monthNames[idx];

    breakdown[key] = perMonth;
  }

  for (let i = 0; i <= 1; i++) {
    const idx = (currentMonthIdx + i) % 12;

    const key =
      monthNames[idx] +
      (i === 0 ? "Proj" : "Proj");

    breakdown[key] = perMonth;
  }

  return breakdown;
}

function buildCategoryBreakdown(items, expensesTotal) {
  if (items && items.length > 0) {
    return items.map((item) => ({
      label: item.name || "Expense",
      amount: item.amount || 0,
      color: "",
    }));
  }

  if (expensesTotal > 0) {
    return [
      {
        label: "General expenses",
        amount: expensesTotal,
        color: "",
      },
    ];
  }

  return [];
}

function buildMealCosts(perMealCostAvg) {
  if (!perMealCostAvg) return [];

  const weights = {
    Breakfast: 0.25,
    Lunch: 0.4,
    Dinner: 0.25,
    Snacks: 0.1,
  };

  const colors = {
    Breakfast: "",
    Lunch: "",
    Dinner: "",
    Snacks: "",
  };

  return Object.entries(weights).map(
    ([label, w]) => ({
      label,
      cost: Math.round(perMealCostAvg * w * 4),
      color: colors[label],
    })
  );
}

function buildDailyLog(items, students, perMealCostAvg) {
  const dated = items.filter((item) => item.date);

  if (!dated.length) return [];

  return dated.map((item) => {
    const total = item.amount || 0;

    const perHead =
      students > 0
        ? Math.round(total / students)
        : 0;

    const dateStr = new Date(item.date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );

    return [
      dateStr,
      students,
      null,
      null,
      null,
      null,
      total,
      perHead,
      null,
    ];
  });
}

exports.getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne();

    if (!budget) {
      budget = await Budget.create({});
    }

    res.json(deriveFields(budget));
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const allowed = [
      "semesterFeePerStudent",
      "totalStudents",
      "perMealCostTarget",
      "mealCostPerMeal",
      "semesterDays",
      "month",
      "items",
    ];

    let budget = await Budget.findOne();

    if (!budget) {
      budget = await Budget.create(
        Object.fromEntries(
          Object.entries(req.body).filter(([k]) =>
            allowed.includes(k)
          )
        )
      );
    } else {
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) {
          budget[key] = req.body[key];
        }
      });

      await budget.save();
    }

    res.json(deriveFields(budget));
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};