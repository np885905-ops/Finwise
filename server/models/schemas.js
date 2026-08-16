const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currency: { type: String, default: '₹' },
  enableAlerts: { type: Boolean, default: true },
  threshold: { type: Number, default: 80 },
  theme: { type: String, default: 'dark' },
  createdAt: { type: Date, default: Date.now }
});

// Income Schema
const IncomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  source: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Budget Schema
const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 }
});

// Financial Goal Schema
const FinancialGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  currentAmount: { type: Number, default: 0, min: 0 },
  targetDate: { type: String, required: true }, // Format: YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

// Alert Schema
const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['warning', 'danger', 'success', 'info'] }, // UI indicator type
  message: { type: String, required: true },
  severity: { type: String, default: 'medium', enum: ['high', 'medium', 'low'] },
  dismissed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Income: mongoose.models.Income || mongoose.model('Income', IncomeSchema),
  Expense: mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema),
  Budget: mongoose.models.Budget || mongoose.model('Budget', BudgetSchema),
  FinancialGoal: mongoose.models.FinancialGoal || mongoose.model('FinancialGoal', FinancialGoalSchema),
  Alert: mongoose.models.Alert || mongoose.model('Alert', AlertSchema)
};
