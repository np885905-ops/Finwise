const INITIAL_INCOME = [
  { source: 'Monthly Salary', amount: 85000, date: '2026-08-01', description: 'Tech Corp monthly salary payout' },
  { source: 'Freelance Design', amount: 15000, date: '2026-08-10', description: 'Web UI landing page design contract' },
  { source: 'Stock Dividend', amount: 3500, date: '2026-08-12', description: 'Quarterly dividend from index funds' }
];

const INITIAL_EXPENSES = [
  { amount: 12000, category: 'Bills', date: '2026-08-02', description: 'Apartment Rent' },
  { amount: 4500, category: 'Food', date: '2026-08-03', description: 'Groceries' },
  { amount: 2500, category: 'Travel', date: '2026-08-04', description: 'Uber and Petrol' },
  { amount: 6000, category: 'Shopping', date: '2026-08-05', description: 'New Shoes and Shirt' },
  { amount: 1500, category: 'Entertainment', date: '2026-08-07', description: 'Netflix and Movie Tickets' },
  { amount: 3000, category: 'Health', date: '2026-08-09', description: 'Pharmacy' },
  { amount: 1200, category: 'Food', date: '2026-08-11', description: 'Dinner with friends' },
  { amount: 8000, category: 'Education', date: '2026-08-13', description: 'UI/UX Design Certification Course' },
  { amount: 800, category: 'Other', date: '2026-08-14', description: 'Laundry' }
];

const INITIAL_BUDGETS = [
  { category: 'Food', limit: 12000 },
  { category: 'Travel', limit: 6000 },
  { category: 'Shopping', limit: 10000 },
  { category: 'Bills', limit: 15000 },
  { category: 'Education', limit: 10000 },
  { category: 'Health', limit: 5000 },
  { category: 'Entertainment', limit: 4000 },
  { category: 'Other', limit: 3000 }
];

const INITIAL_GOALS = [
  { name: 'MacBook Pro M4', targetAmount: 180000, currentAmount: 85000, targetDate: '2026-12-31' },
  { name: 'Emergency Fund', targetAmount: 150000, currentAmount: 110000, targetDate: '2027-03-31' },
  { name: 'Europe Summer Trip', targetAmount: 250000, currentAmount: 90000, targetDate: '2027-05-15' },
  { name: 'Machine Learning Course', targetAmount: 25000, currentAmount: 20000, targetDate: '2026-09-30' }
];

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other'
];

module.exports = {
  INITIAL_INCOME,
  INITIAL_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  CATEGORIES
};
