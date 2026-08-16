require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/alerts', require('./routes/alerts'));

// Demo Reset Endpoint
const auth = require('./middleware/auth');
const { db } = require('./db');
const { Expense, Income, Budget, FinancialGoal, Alert } = require('./models/schemas');
const { INITIAL_INCOME, INITIAL_EXPENSES, INITIAL_BUDGETS, INITIAL_GOALS } = require('./utils/mockData');

app.post('/api/settings/seed-demo', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Delete existing entries
    if (global.useFileDb) {
      const fileDb = require('./utils/fileDb');
      
      const filterCollection = (col, uid) => {
        const list = fileDb.find(col, {});
        const filtered = list.filter(item => item.userId !== uid);
        fileDb.overwrite(col, filtered);
      };

      filterCollection('income', userId);
      filterCollection('expenses', userId);
      filterCollection('budgets', userId);
      filterCollection('goals', userId);
      filterCollection('alerts', userId);
    } else {
      await Expense.deleteMany({ userId });
      await Income.deleteMany({ userId });
      await Budget.deleteMany({ userId });
      await FinancialGoal.deleteMany({ userId });
      await Alert.deleteMany({ userId });
    }

    // Insert seeds scoped to current user
    for (let inc of INITIAL_INCOME) {
      await db.create(Income, { ...inc, userId, _id: undefined, id: undefined });
    }

    for (let exp of INITIAL_EXPENSES) {
      await db.create(Expense, { ...exp, userId, _id: undefined, id: undefined });
    }

    for (let bud of INITIAL_BUDGETS) {
      await db.create(Budget, { ...bud, userId, _id: undefined });
    }

    for (let goal of INITIAL_GOALS) {
      await db.create(FinancialGoal, { ...goal, userId, _id: undefined, id: undefined });
    }

    console.log(`[DEMO SEED] Successfully seeded data for user: ${userId}`);
    res.json({ message: 'Demo data re-seeded successfully.' });
  } catch (err) {
    console.error('Demo seeding error:', err);
    res.status(500).json({ message: 'Failed to seed demo data.' });
  }
});

// App test root
app.get('/', (req, res) => {
  res.send('FinWise API Server running.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] FinWise backend server running on port: ${PORT}`);
});
