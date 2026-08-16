import React, { useState } from 'react';
import { Edit2, DollarSign, Target, Activity } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

const Budget = ({ expenses, budgets, onUpdateBudget }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [error, setError] = useState('');

  // Calculate actual spending per category from current expenses list
  const getCategorySpending = (catName) => {
    return expenses
      .filter(exp => exp.category === catName)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Grand totals
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalRemaining = Math.max(totalLimit - totalSpent, 0);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Handle Edit Limit click
  const handleEditLimit = (budget) => {
    setSelectedCategory(budget.category);
    setNewLimit(budget.limit.toString());
    setError('');
    setIsModalOpen(true);
  };

  // Handle Limit Update Save
  const handleSaveLimit = (e) => {
    e.preventDefault();
    if (!newLimit || isNaN(newLimit) || parseFloat(newLimit) <= 0) {
      setError('Please enter a valid positive budget limit.');
      return;
    }
    onUpdateBudget(selectedCategory, parseFloat(newLimit));
    setIsModalOpen(false);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Smart Budgets</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Set limits across categories to track and curtail excessive monthly spending.
        </p>
      </div>

      {/* Global Monthly Summary Card */}
      <div className="glass-card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Total Monthly Budget Progress</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Budgeted Limit</span>
            <h4 style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px' }}>₹{totalLimit.toLocaleString('en-IN')}</h4>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Spent</span>
            <h4 style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: totalSpent > totalLimit ? 'var(--color-danger)' : 'var(--text-primary)' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </h4>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Remaining</span>
            <h4 style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: 'var(--color-success)' }}>₹{totalRemaining.toLocaleString('en-IN')}</h4>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Utilization</span>
            <h4 style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary)' }}>{Math.round(totalPercent)}%</h4>
          </div>
        </div>

        <ProgressBar percentage={totalPercent} />
      </div>

      {/* Category Budgets Grid */}
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '20px' }}>Category Allocations</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {budgets.map((b) => {
          const spent = getCategorySpending(b.category);
          const remaining = Math.max(b.limit - spent, 0);
          const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          const isOver = spent > b.limit;

          return (
            <div key={b.category} className="glass-card hoverable" style={{ padding: '20px' }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{b.category}</h4>
                <button 
                  className="icon-btn edit-btn" 
                  onClick={() => handleEditLimit(b)}
                  style={{ padding: '4px' }}
                  aria-label={`Edit ${b.category} limit`}
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex-between" style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: '600' }}>Limit: ₹{b.limit.toLocaleString('en-IN')}</span>
                </div>

                <ProgressBar percentage={percent} />

                <div className="flex-between" style={{ fontSize: '12px', marginTop: '4px' }}>
                  <span style={{ 
                    color: isOver ? 'var(--color-danger)' : 'var(--text-muted)',
                    fontWeight: isOver ? '700' : 'normal'
                  }}>
                    {isOver ? `Over budget by ₹${Math.abs(b.limit - spent).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')} remaining`}
                  </span>
                  <span style={{ 
                    fontWeight: '700', 
                    color: percent >= 100 ? 'var(--color-danger)' : percent >= 80 ? 'var(--color-warning)' : 'var(--color-success)' 
                  }}>
                    {Math.round(percent)}% used
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adjust Budget: ${selectedCategory}`}
      >
        {error && (
          <div className="alert-item danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveLimit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="budget-limit-input">Budget Limit (₹)</label>
            <input
              id="budget-limit-input"
              type="number"
              className="form-input"
              placeholder="Enter limit"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              required
            />
          </div>

          <div className="flex-between">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;
