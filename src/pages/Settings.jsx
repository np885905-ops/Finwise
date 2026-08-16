import React, { useState } from 'react';
import { User, ShieldAlert, Database, RotateCcw, AlertTriangle } from 'lucide-react';

const Settings = ({ user, onUpdateUser, onResetData, onClearData }) => {
  const [name, setName] = useState(user?.name || 'Nikhil Kumar');
  const [email, setEmail] = useState(user?.email || 'nikhil@finwise.io');
  
  // Alert configs state
  const [threshold, setThreshold] = useState('80');
  const [enableAlerts, setEnableAlerts] = useState(true);
  
  // Notice Banner state
  const [notice, setNotice] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ name, email });
    showNotice('Profile information saved successfully!');
  };

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    showNotice(`Alert warning configurations set to trigger at ${threshold}% budget utilization.`);
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure user identity options, thresholds, warnings, and local storage variables.
        </p>
      </div>

      {notice && (
        <div className="alert-item success" style={{ marginTop: '20px', padding: '12px 16px' }}>
          {notice}
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--color-primary)' }} /> User Profile
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Full Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Warning Threshold Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-warning)' }} /> Budget Warnings
          </h3>

          <form onSubmit={handleAlertSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableAlerts}
                  onChange={(e) => setEnableAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                />
                Enable Budget Limit Alerts
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="settings-threshold">Threshold Warning Percentage (%)</label>
              <input
                id="settings-threshold"
                type="number"
                className="form-input"
                min="50"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={!enableAlerts}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Trigger warnings in header when category spending reaches this percentage.
              </span>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={!enableAlerts}>
              Save Warnings Configuration
            </button>
          </form>
        </div>

        {/* Local Data Card */}
        <div className="glass-card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: 'var(--color-danger)' }} /> Local Data Operations
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            Since database connections are not yet active in Phase 1, all entries are read and written to your browser's <code>localStorage</code>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => {
                if (window.confirm('Reset all transactions, budgets and goals to mock seed values? This overwrites current changes.')) {
                  onResetData();
                  showNotice('All data reset to defaults.');
                }
              }} 
              className="btn btn-secondary" 
              style={{ justifyContent: 'flex-start', color: 'var(--color-warning)' }}
            >
              <RotateCcw size={16} /> Reset Default Mock Data
            </button>

            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all entries? This will empty all transactions, budgets and goals.')) {
                  onClearData();
                  showNotice('Cleared all custom records.');
                }
              }} 
              className="btn btn-danger" 
              style={{ justifyContent: 'flex-start' }}
            >
              <AlertTriangle size={16} /> Clear All Local Registers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
