const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../db');
const { Expense, Income } = require('../models/schemas');

// =========================================================================
// EXPENSES ROUTES (All Scoped to req.userId)
// =========================================================================

// @route   GET api/transactions/expenses
// @desc    Get all user expenses
// @access  Private
router.get('/expenses', auth, async (req, res) => {
  try {
    const list = await db.find(Expense, { userId: req.userId });
    // Sort descending by date
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(list);
  } catch (err) {
    console.error('Fetch expenses error:', err);
    res.status(500).json({ message: 'Server error fetching expenses.' });
  }
});

// @route   POST api/transactions/expenses
// @desc    Add an expense
// @access  Private
router.post('/expenses', auth, async (req, res) => {
  const { amount, category, date, description } = req.body;

  // Validation
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }
  if (!category || !category.trim()) {
    return res.status(400).json({ message: 'Category is required.' });
  }
  if (!date || !date.trim()) {
    return res.status(400).json({ message: 'Date is required.' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ message: 'Description is required.' });
  }

  try {
    const newExpense = await db.create(Expense, {
      userId: req.userId,
      amount: parseFloat(amount),
      category: category.trim(),
      date: date.trim(),
      description: description.trim()
    });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ message: 'Server error saving expense.' });
  }
});

// @route   PUT api/transactions/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/expenses/:id', auth, async (req, res) => {
  const { amount, category, date, description } = req.body;
  const { id } = req.params;

  // Validation
  if (amount && (isNaN(amount) || parseFloat(amount) <= 0)) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }

  try {
    // Verify ownership
    const expense = await db.findOne(Expense, { _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found or unauthorized.' });
    }

    const updatedData = {};
    if (amount) updatedData.amount = parseFloat(amount);
    if (category) updatedData.category = category.trim();
    if (date) updatedData.date = date.trim();
    if (description) updatedData.description = description.trim();

    const updatedExpense = await db.findByIdAndUpdate(Expense, id, updatedData);
    res.json(updatedExpense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Server error updating expense.' });
  }
});

// @route   DELETE api/transactions/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/expenses/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const expense = await db.findOne(Expense, { _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found or unauthorized.' });
    }

    await db.findByIdAndDelete(Expense, id);
    res.json({ message: 'Expense record deleted successfully.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Server error deleting expense.' });
  }
});

// =========================================================================
// INCOME ROUTES (All Scoped to req.userId)
// =========================================================================

// @route   GET api/transactions/income
// @desc    Get all user incomes
// @access  Private
router.get('/income', auth, async (req, res) => {
  try {
    const list = await db.find(Income, { userId: req.userId });
    // Sort descending by date
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(list);
  } catch (err) {
    console.error('Fetch income error:', err);
    res.status(500).json({ message: 'Server error fetching income.' });
  }
});

// @route   POST api/transactions/income
// @desc    Add an income
// @access  Private
router.post('/income', auth, async (req, res) => {
  const { amount, source, date, description } = req.body;

  // Validation
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }
  if (!source || !source.trim()) {
    return res.status(400).json({ message: 'Source is required.' });
  }
  if (!date || !date.trim()) {
    return res.status(400).json({ message: 'Date is required.' });
  }

  try {
    const newIncome = await db.create(Income, {
      userId: req.userId,
      amount: parseFloat(amount),
      source: source.trim(),
      date: date.trim(),
      description: description ? description.trim() : ''
    });

    res.status(201).json(newIncome);
  } catch (err) {
    console.error('Add income error:', err);
    res.status(500).json({ message: 'Server error saving income.' });
  }
});

// @route   PUT api/transactions/income/:id
// @desc    Update an income
// @access  Private
router.put('/income/:id', auth, async (req, res) => {
  const { amount, source, date, description } = req.body;
  const { id } = req.params;

  // Validation
  if (amount && (isNaN(amount) || parseFloat(amount) <= 0)) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }

  try {
    // Verify ownership
    const income = await db.findOne(Income, { _id: id, userId: req.userId });
    if (!income) {
      return res.status(404).json({ message: 'Income record not found or unauthorized.' });
    }

    const updatedData = {};
    if (amount) updatedData.amount = parseFloat(amount);
    if (source) updatedData.source = source.trim();
    if (date) updatedData.date = date.trim();
    if (description !== undefined) updatedData.description = description.trim();

    const updatedIncome = await db.findByIdAndUpdate(Income, id, updatedData);
    res.json(updatedIncome);
  } catch (err) {
    console.error('Update income error:', err);
    res.status(500).json({ message: 'Server error updating income.' });
  }
});

// @route   DELETE api/transactions/income/:id
// @desc    Delete an income
// @access  Private
router.delete('/income/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const income = await db.findOne(Income, { _id: id, userId: req.userId });
    if (!income) {
      return res.status(404).json({ message: 'Income record not found or unauthorized.' });
    }

    await db.findByIdAndDelete(Income, id);
    res.json({ message: 'Income record deleted successfully.' });
  } catch (err) {
    console.error('Delete income error:', err);
    res.status(500).json({ message: 'Server error deleting income.' });
  }
});

module.exports = router;
