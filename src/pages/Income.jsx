import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Income = ({ income, onAddIncome, onEditIncome, onDeleteIncome }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleEditClick = (inc) => {
    setEditingIncome(inc);
    setAmount(inc.amount.toString());
    setSource(inc.source);
    setDate(inc.date);
    setDescription(inc.description);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingIncome(null);
    setAmount('');
    setSource('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!source.trim()) {
      setError('Please add a source name.');
      return;
    }

    const incomeData = {
      amount: parseFloat(amount),
      source: source.trim(),
      date,
      description: description ? description.trim() : ''
    };

    if (editingIncome) {
      onEditIncome({ ...editingIncome, ...incomeData });
    } else {
      onAddIncome(incomeData);
    }

    setIsModalOpen(false);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Income Logs</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Track your paychecks, freelancing profits, and dividend income streams.
          </p>
        </div>
        <button className="btn btn-success" onClick={handleAddClick}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Income Table */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '0' }}>
        <div className="table-wrapper">
          {income.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
              No income streams recorded yet.
            </p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {income.map((inc) => (
                  <tr key={inc._id}>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{inc.source}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {inc.description || 'No description'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(inc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>
                      ₹{inc.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="icon-btn edit-btn" 
                          onClick={() => handleEditClick(inc)}
                          aria-label="Edit income"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="icon-btn delete-btn" 
                          onClick={() => onDeleteIncome(inc._id)}
                          aria-label="Delete income"
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIncome ? 'Edit Income Details' : 'Record New Income Stream'}
      >
        {error && (
          <div className="alert-item danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="income-source">Income Source</label>
            <input
              id="income-source"
              type="text"
              className="form-input"
              placeholder="e.g. Monthly Salary, Freelance Work"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="income-amount">Amount (₹)</label>
              <input
                id="income-amount"
                type="number"
                className="form-input"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="income-date">Date Received</label>
              <input
                id="income-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="income-description">Description (Optional)</label>
            <input
              id="income-description"
              type="text"
              className="form-input"
              placeholder="e.g. Q3 bonus or interest payouts"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex-between">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              {editingIncome ? 'Save Changes' : 'Record Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Income;
