const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../db');
const { FinancialGoal } = require('../models/schemas');
const { INITIAL_GOALS } = require('../utils/mockData');

// Helper to seed goals for new users
const ensureDefaultGoals = async (userId) => {
  const existing = await db.find(FinancialGoal, { userId });
  if (existing.length === 0) {
    const listToCreate = INITIAL_GOALS.map(g => ({
      userId,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate
    }));

    const created = [];
    for (let item of listToCreate) {
      const doc = await db.create(FinancialGoal, item);
      created.push(doc);
    }
    return created;
  }
  return existing;
};

// @route   GET api/goals
// @desc    Get user goals
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const goalsList = await ensureDefaultGoals(req.userId);
    res.json(goalsList);
  } catch (err) {
    console.error('Fetch goals error:', err);
    res.status(500).json({ message: 'Server error fetching goals.' });
  }
});

// @route   POST api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Goal name is required.' });
  }
  if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
    return res.status(400).json({ message: 'Target amount must be a positive number.' });
  }
  if (currentAmount !== undefined && (isNaN(currentAmount) || parseFloat(currentAmount) < 0)) {
    return res.status(400).json({ message: 'Initial savings cannot be negative.' });
  }
  if (!targetDate || !targetDate.trim()) {
    return res.status(400).json({ message: 'Target achievement date is required.' });
  }

  try {
    const newGoal = await db.create(FinancialGoal, {
      userId: req.userId,
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      targetDate: targetDate.trim()
    });

    res.status(201).json(newGoal);
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ message: 'Server error saving financial goal.' });
  }
});

// @route   PUT api/goals/:id
// @desc    Update a financial goal (including adding savings contribution)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  const { id } = req.params;

  // Validation
  if (targetAmount && (isNaN(targetAmount) || parseFloat(targetAmount) <= 0)) {
    return res.status(400).json({ message: 'Target amount must be a positive number.' });
  }
  if (currentAmount !== undefined && (isNaN(currentAmount) || parseFloat(currentAmount) < 0)) {
    return res.status(400).json({ message: 'Saved savings cannot be negative.' });
  }

  try {
    // Verify ownership
    const goal = await db.findOne(FinancialGoal, { _id: id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Financial goal not found or unauthorized.' });
    }

    const updatedData = {};
    if (name) updatedData.name = name.trim();
    if (targetAmount) updatedData.targetAmount = parseFloat(targetAmount);
    if (currentAmount !== undefined) {
      // Check if saving exceeds target
      const targetVal = targetAmount ? parseFloat(targetAmount) : goal.targetAmount;
      if (parseFloat(currentAmount) > targetVal) {
        return res.status(400).json({ message: `Total savings cannot exceed target amount of ₹${targetVal.toLocaleString('en-IN')}` });
      }
      updatedData.currentAmount = parseFloat(currentAmount);
    }
    if (targetDate) updatedData.targetDate = targetDate.trim();

    const updatedGoal = await db.findByIdAndUpdate(FinancialGoal, id, updatedData);
    res.json(updatedGoal);
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ message: 'Server error updating goal.' });
  }
});

// @route   DELETE api/goals/:id
// @desc    Delete a financial goal
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const goal = await db.findOne(FinancialGoal, { _id: id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Financial goal not found or unauthorized.' });
    }

    await db.findByIdAndDelete(FinancialGoal, id);
    res.json({ message: 'Goal record deleted successfully.' });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ message: 'Server error deleting goal.' });
  }
});

module.exports = router;
