const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../db');
const { Budget, Expense } = require('../models/schemas');
const { INITIAL_BUDGETS, CATEGORIES } = require('../utils/mockData');
const aiHelper = require('../utils/aiHelper');

// Helper to seed default budgets for a user if none exist
const ensureDefaultBudgets = async (userId) => {
  const existing = await db.find(Budget, { userId });
  if (existing.length === 0) {
    const listToCreate = INITIAL_BUDGETS.map(b => ({
      userId,
      category: b.category,
      limit: b.limit
    }));

    const created = [];
    for (let item of listToCreate) {
      const doc = await db.create(Budget, item);
      created.push(doc);
    }
    return created;
  }
  return existing;
};

// @route   GET api/budgets
// @desc    Get user category budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgetsList = await ensureDefaultBudgets(req.userId);
    res.json(budgetsList);
  } catch (err) {
    console.error('Fetch budgets error:', err);
    res.status(500).json({ message: 'Server error fetching budgets.' });
  }
});

// @route   PUT api/budgets
// @desc    Update a specific category budget limit
// @access  Private
router.put('/', auth, async (req, res) => {
  const { category, limit } = req.body;

  // Validation
  if (!category || !category.trim()) {
    return res.status(400).json({ message: 'Category is required.' });
  }
  if (limit === undefined || isNaN(limit) || parseFloat(limit) < 0) {
    return res.status(400).json({ message: 'Limit must be a non-negative number.' });
  }

  try {
    // Find if budget exists
    let budget = await db.findOne(Budget, { userId: req.userId, category: category.trim() });
    
    if (budget) {
      // Update
      const updated = await db.findByIdAndUpdate(Budget, budget._id, { limit: parseFloat(limit) });
      res.json(updated);
    } else {
      // Create new
      const created = await db.create(Budget, {
        userId: req.userId,
        category: category.trim(),
        limit: parseFloat(limit)
      });
      res.status(201).json(created);
    }
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ message: 'Server error updating budget.' });
  }
});

// @route   GET api/budgets/recommend
// @desc    Get AI-driven budget recommendations
// @access  Private
router.get('/recommend', auth, async (req, res) => {
  try {
    const expenses = await db.find(Expense, { userId: req.userId });
    const budgets = await db.find(Budget, { userId: req.userId });

    // Aggregate spending by category
    const spendingMap = {};
    CATEGORIES.forEach(cat => { spendingMap[cat] = 0; });
    expenses.forEach(e => {
      if (spendingMap[e.category] !== undefined) {
        spendingMap[e.category] += e.amount;
      } else {
        spendingMap[e.category] = e.amount;
      }
    });

    // Generate context for AI helper
    const context = {
      expensesCount: expenses.length,
      spendingMap,
      currentBudgets: budgets.reduce((map, b) => {
        map[b.category] = b.limit;
        return map;
      }, {})
    };

    // Call AI helper for recommendations
    const recommendations = await aiHelper.generateBudgetRecommendations(context);
    res.json(recommendations);
  } catch (err) {
    console.error('AI recommendations error:', err);
    res.status(500).json({ message: 'Server error generating recommendations.' });
  }
});

module.exports = router;
