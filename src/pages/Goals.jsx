import React, { useState } from 'react';
import { Plus, Target, Calendar, Award, Trash2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

const Goals = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  // New Goal states
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [error, setError] = useState('');

  // Open modal for new goal
  const handleAddClick = () => {
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setError('');
    setIsModalOpen(true);
  };

  // Open modal to add deposit
  const handleDepositClick = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setError('');
    setIsDepositOpen(true);
  };

  // Create new goal
  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setError('Please enter a goal name.');
      return;
    }
    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    if (parseFloat(currentAmount) < 0 || isNaN(currentAmount)) {
      setError('Current amount cannot be negative.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target date.');
      return;
    }

    onAddGoal({
      name: goalName.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate
    });

    setIsModalOpen(false);
  };

  // Save goal deposit
  const handleSaveDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }

    const updatedCurrent = selectedGoal.currentAmount + parseFloat(depositAmount);
    if (updatedCurrent > selectedGoal.targetAmount) {
      setError(`Deposit exceeds target amount by ₹${(updatedCurrent - selectedGoal.targetAmount).toLocaleString('en-IN')}`);
      return;
    }

    onUpdateGoal({
      ...selectedGoal,
      currentAmount: updatedCurrent
    });

    setIsDepositOpen(false);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Financial Goals</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Fund your dreams. Allocate money towards long term plans and milestones.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {goals.map((goal) => {
          const percent = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal._id} className="glass-card hoverable" style={{ 
              borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)',
              background: isCompleted ? 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'var(--bg-card)'
            }}>
              
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isCompleted ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                    color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isCompleted ? <Award size={18} /> : <Target size={18} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{goal.name}</h3>
                    {isCompleted && (
                      <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: '600' }}>
                        GOAL ACHIEVED
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  className="icon-btn delete-btn" 
                  onClick={() => onDeleteGoal(goal._id)}
                  style={{ padding: '6px' }}
                  aria-label={`Delete ${goal.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Goal Progress metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex-between" style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Saved: <strong>₹{goal.currentAmount.toLocaleString('en-IN')}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Target: <strong>₹{goal.targetAmount.toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <ProgressBar percentage={percent} colorClass={isCompleted ? 'var(--color-success)' : 'var(--color-primary)'} />

                <div className="flex-between" style={{ fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    <span>By {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span style={{ fontWeight: '600', color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }}>
                    {Math.round(percent)}% Complete
                  </span>
                </div>

                {!isCompleted && (
                  <div className="flex-between" style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Need: ₹{remaining.toLocaleString('en-IN')}
                    </span>
                    <button 
                      onClick={() => handleDepositClick(goal)}
                      className="btn btn-secondary btn-small"
                      style={{ padding: '6px 12px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                    >
                      + Add Savings
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add New Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Financial Milestone"
      >
        {error && (
          <div className="alert-item danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateGoal}>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-name">Goal Target Name</label>
            <input
              id="goal-name"
              type="text"
              className="form-input"
              placeholder="e.g. Travel to Switzerland, Emergency Fund"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="goal-target">Target Amount (₹)</label>
              <input
                id="goal-target"
                type="number"
                className="form-input"
                placeholder="e.g. 150000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-current">Initial Savings (₹)</label>
              <input
                id="goal-current"
                type="number"
                className="form-input"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="goal-date">Target Achievement Date</label>
            <input
              id="goal-date"
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div className="flex-between">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Goal Deposit Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title={`Deposit towards: ${selectedGoal?.name}`}
      >
        {error && (
          <div className="alert-item danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveDeposit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="deposit-amount-input">Contribution Amount (₹)</label>
            <input
              id="deposit-amount-input"
              type="number"
              className="form-input"
              placeholder="e.g. 5000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Remaining to fund: ₹{selectedGoal ? (selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString('en-IN') : 0}
            </span>
          </div>

          <div className="flex-between">
            <button type="button" className="btn btn-secondary" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Deposit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
