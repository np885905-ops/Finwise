const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../db');
const { Alert, Expense, Budget, FinancialGoal } = require('../models/schemas');
const { CATEGORIES } = require('../utils/mockData');

// Helper to run background alert checks and update active list in DB
const synchronizeAlerts = async (userId) => {
  const expenses = await db.find(Expense, { userId });
  const budgets = await db.find(Budget, { userId });
  const goals = await db.find(FinancialGoal, { userId });

  // 1. Calculate spending aggregates
  const categorySpending = {};
  CATEGORIES.forEach(cat => { categorySpending[cat] = 0; });
  expenses.forEach(e => {
    if (categorySpending[e.category] !== undefined) {
      categorySpending[e.category] += e.amount;
    }
  });

  const alertsToUpsert = [];

  // =========================================================================
  // A. BUDGET LIMIT ALERTS
  // =========================================================================
  budgets.forEach(b => {
    const spent = categorySpending[b.category] || 0;
    const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

    if (percent >= 100) {
      alertsToUpsert.push({
        type: 'danger',
        message: `Exceeded budget for ${b.category}! Spent ₹${spent.toLocaleString('en-IN')} of ₹${b.limit.toLocaleString('en-IN')}.`,
        severity: 'high'
      });
    } else if (percent >= 90) {
      alertsToUpsert.push({
        type: 'warning',
        message: `Critical limit: ${b.category} budget is at ${Math.round(percent)}% utilization (₹${spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')}).`,
        severity: 'medium'
      });
    } else if (percent >= 70) {
      alertsToUpsert.push({
        type: 'warning',
        message: `Approaching limit: ${b.category} budget is at ${Math.round(percent)}% utilization (₹${spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')}).`,
        severity: 'low'
      });
    }
  });

  // =========================================================================
  // B. UNUSUAL SPENDING DETECTION (55%+ higher than history)
  // =========================================================================
  CATEGORIES.forEach(cat => {
    const catExpenses = expenses.filter(e => e.category === cat);
    if (catExpenses.length >= 3) {
      // Find the most recent expense
      const sorted = [...catExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];
      
      // Calculate average of previous expenses in this category
      const historicalList = sorted.slice(1);
      const avgAmt = historicalList.reduce((sum, e) => sum + e.amount, 0) / historicalList.length;

      // Check if latest transaction is 55% higher than historical average
      if (latest.amount >= avgAmt * 1.55) {
        alertsToUpsert.push({
          type: 'warning',
          message: `Unusual transaction in ${cat}: Spent ₹${latest.amount.toLocaleString('en-IN')} on '${latest.description}', which is 55% higher than your category average (₹${Math.round(avgAmt).toLocaleString('en-IN')}).`,
          severity: 'medium'
        });
      }
    }
  });

  // =========================================================================
  // C. GOAL SCHEDULE CHECKS
  // =========================================================================
  goals.forEach(g => {
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining > 0) {
      const daysLeft = (new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24);
      const monthsLeft = daysLeft / 30;

      // If goal date has passed but not completed
      if (daysLeft <= 0) {
        alertsToUpsert.push({
          type: 'danger',
          message: `Goal Behind Schedule: Target date for '${g.name}' was reached, but it is only ${Math.round((g.currentAmount/g.targetAmount)*100)}% funded.`,
          severity: 'high'
        });
      } else {
        // If monthly funding rate required is extremely high compared to current savings
        const monthlyRateRequired = remaining / Math.max(monthsLeft, 1);
        if (monthlyRateRequired > 40000) { // arbitrary threshold for high rate warning
          alertsToUpsert.push({
            type: 'info',
            message: `Milestone advice: '${g.name}' requires saving ₹${Math.round(monthlyRateRequired).toLocaleString('en-IN')}/month. Increase savings to stay on track.`,
            severity: 'low'
          });
        }
      }
    }
  });

  // Fetch current database alerts
  const existingAlerts = await db.find(Alert, { userId });

  // Sync logic: Add if not present, keep if already exists
  for (let alert of alertsToUpsert) {
    const isDuplicate = existingAlerts.some(e => e.message === alert.message);
    if (!isDuplicate) {
      await db.create(Alert, {
        userId,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        dismissed: false
      });
    }
  }

  // Retrieve current active (not dismissed) alerts from the DB
  return await db.find(Alert, { userId, dismissed: false });
};

// @route   GET api/alerts
// @desc    Retrieve and sync user active alerts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const activeAlerts = await synchronizeAlerts(req.userId);
    res.json(activeAlerts);
  } catch (err) {
    console.error('Fetch alerts error:', err);
    res.status(500).json({ message: 'Server error retrieving alerts.' });
  }
});

// @route   PUT api/alerts/:id/dismiss
// @desc    Dismiss a specific alert
// @access  Private
router.put('/:id/dismiss', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const alert = await db.findOne(Alert, { _id: id, userId: req.userId });
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or unauthorized.' });
    }

    const updated = await db.findByIdAndUpdate(Alert, id, { dismissed: true });
    res.json(updated);
  } catch (err) {
    console.error('Dismiss alert error:', err);
    res.status(500).json({ message: 'Server error dismissing alert.' });
  }
});

// @route   POST api/alerts/clear
// @desc    Dismiss all active alerts
// @access  Private
router.post('/clear', auth, async (req, res) => {
  try {
    const active = await db.find(Alert, { userId: req.userId, dismissed: false });
    for (let item of active) {
      await db.findByIdAndUpdate(Alert, item._id, { dismissed: true });
    }
    res.json({ message: 'All active alerts cleared successfully.' });
  } catch (err) {
    console.error('Clear alerts error:', err);
    res.status(500).json({ message: 'Server error clearing alerts.' });
  }
});

module.exports = router;
