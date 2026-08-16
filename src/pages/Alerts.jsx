import React from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, Trash2, X } from 'lucide-react';

const Alerts = ({ alerts = [], onDismissAlert }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={18} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#f97316' }} />;
      case 'success':
        return <CheckCircle size={18} style={{ color: '#10b981' }} />;
      default:
        return <Info size={18} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Active System Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Inspect budget warnings, anomaly detections, and savings milestone schedules.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          <Bell size={16} />
          <span>{alerts.length} active alerts</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={24} />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Your portfolio is healthy!</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              No budget overruns, transactional anomalies, or savings delays detected.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                className={`alert-item ${alert.type}`}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                  <div style={{ marginTop: '2px' }}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'capitalize', marginBottom: '4px' }}>
                      {alert.type === 'danger' ? 'Critical Overrun' : alert.type === 'warning' ? 'Budget Warning' : 'System Notification'}
                    </h4>
                    <p style={{ fontSize: '13px', opacity: 0.95, lineHeight: '1.4' }}>{alert.message}</p>
                    <span style={{ fontSize: '10px', opacity: 0.6, display: 'block', marginTop: '6px' }}>
                      Detected on {new Date(alert.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => onDismissAlert && onDismissAlert(alert._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    opacity: 0.7,
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Alerts;
