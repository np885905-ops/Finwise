export const INITIAL_INCOME = [
  { id: 'inc-1', source: 'Monthly Salary', amount: 85000, date: '2026-08-01', description: 'Tech Corp monthly salary payout' },
  { id: 'inc-2', source: 'Freelance Design', amount: 15000, date: '2026-08-10', description: 'Web UI landing page design contract' },
  { id: 'inc-3', source: 'Stock Dividend', amount: 3500, date: '2026-08-12', description: 'Quarterly dividend from index funds' }
];

export const INITIAL_EXPENSES = [
  { id: 'exp-1', amount: 12000, category: 'Bills', date: '2026-08-02', description: 'Apartment Monthly Rent' },
  { id: 'exp-2', amount: 4500, category: 'Food', date: '2026-08-03', description: 'Weekly groceries at Reliance Fresh' },
  { id: 'exp-3', amount: 2500, category: 'Travel', date: '2026-08-04', description: 'Uber rides and fuel' },
  { id: 'exp-4', amount: 6000, category: 'Shopping', date: '2026-08-05', description: 'New running shoes and shirt' },
  { id: 'exp-5', amount: 1500, category: 'Entertainment', date: '2026-08-07', description: 'Netflix subscription and movie tickets' },
  { id: 'exp-6', amount: 3000, category: 'Health', date: '2026-08-09', description: 'Monthly pharmacy prescription' },
  { id: 'exp-7', amount: 1200, category: 'Food', date: '2026-08-11', description: 'Dinner with friends at restaurant' },
  { id: 'exp-8', amount: 8000, category: 'Education', date: '2026-08-13', description: 'Online UI/UX Design Certification Course' },
  { id: 'exp-9', amount: 800, category: 'Other', date: '2026-08-14', description: 'Laundry and house cleaning items' }
];

export const INITIAL_BUDGETS = [
  { category: 'Food', limit: 12000 },
  { category: 'Travel', limit: 6000 },
  { category: 'Shopping', limit: 10000 },
  { category: 'Bills', limit: 15000 },
  { category: 'Education', limit: 10000 },
  { category: 'Health', limit: 5000 },
  { category: 'Entertainment', limit: 4000 },
  { category: 'Other', limit: 3000 }
];

export const INITIAL_GOALS = [
  { id: 'goal-1', name: 'MacBook Pro M4', targetAmount: 180000, currentAmount: 85000, targetDate: '2026-12-31' },
  { id: 'goal-2', name: 'Emergency Fund', targetAmount: 150000, currentAmount: 110000, targetDate: '2027-03-31' },
  { id: 'goal-3', name: 'Europe Summer Trip', targetAmount: 250000, currentAmount: 90000, targetDate: '2027-05-15' },
  { id: 'goal-4', name: 'Machine Learning Course', targetAmount: 25000, currentAmount: 20000, targetDate: '2026-09-30' }
];

export const SAMPLE_INSIGHTS = [
  {
    id: 'ins-1',
    type: 'warning',
    message: 'Your shopping expenses increased by 15% this month compared to July.',
    suggestion: 'Consider putting shopping items on a 48-hour wishlist before purchasing.'
  },
  {
    id: 'ins-2',
    type: 'danger',
    message: 'You are approaching your Food budget limits (used 47.6% of ₹12,000).',
    suggestion: 'Try cooking at home more often for the next week to save about ₹2,500.'
  },
  {
    id: 'ins-3',
    type: 'success',
    message: 'Your overall savings rate improved to 61% from 54% last month!',
    suggestion: 'Excellent work! Consider transferring the surplus of ₹10,000 directly to your emergency fund.'
  },
  {
    id: 'ins-4',
    type: 'info',
    message: 'Unusual spending detected: An educational charge of ₹8,000 on August 13.',
    suggestion: 'This is within your annual education allocation, but make sure to log tax deductions.'
  }
];

export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other'
];
