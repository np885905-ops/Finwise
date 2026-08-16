import React, { useState } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Sparkles } from 'lucide-react';
import Modal from '../components/Modal';
import { CATEGORIES } from '../utils/mockData';

const Expenses = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState('');

  // Handle Edit click
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setDescription(expense.description);
    setIsModalOpen(true);
  };

  // Open modal for new expense
  const handleAddClick = () => {
    setEditingExpense(null);
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  // Dynamic category suggestion helper (AI suggestion)
  const handleDescriptionBlur = async () => {
    if (!description.trim() || editingExpense) return; // Only suggest for new items when text is entered
    setIsCategorizing(true);
    try {
      const token = localStorage.getItem('finwise_token');
      const res = await fetch('http://localhost:5000/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestedCategory) {
          setCategory(data.suggestedCategory);
        }
      }
    } catch (err) {
      console.error('Categorize error:', err);
    } finally {
      setIsCategorizing(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description.');
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim()
    };

    if (editingExpense) {
      onEditExpense({ ...editingExpense, ...expenseData });
    } else {
      onAddExpense(expenseData);
    }

    setIsModalOpen(false);
  };

  // Filter & Search logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Manage Expenses</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Record, sort, and organize your monthly expense outflows.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="form-input"
            style={{ width: '180px', padding: '10px 14px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card" style={{ marginTop: '20px', padding: '0px' }}>
        <div className="table-wrapper">
          {filteredExpenses.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
              No expenses matching the criteria found.
            </p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{exp.description}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{exp.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-danger)' }}>
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="icon-btn edit-btn" 
                          onClick={() => handleEditClick(exp)}
                          aria-label="Edit expense"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="icon-btn delete-btn" 
                          onClick={() => onDeleteExpense(exp._id)}
                          aria-label="Delete expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        {error && (
          <div className="alert-item danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              className="form-input"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="expense-description">
              Description {isCategorizing && <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>(categorizing...)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="expense-description"
                type="text"
                className="form-input"
                placeholder="e.g. Reliance Fresh groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                required
              />
              {!editingExpense && description.trim() && (
                <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <Sparkles size={12} /> Auto-suggest
                </div>
              )}
            </div>
          </div>

          <div className="flex-between">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
