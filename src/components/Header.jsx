import React, { useState } from 'react';
import { Menu, Bell, Search, X, Sun, ChevronDown } from 'lucide-react';

const Header = ({ title, user, alerts = [], setIsMobileOpen, onDismissAlert }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isDashboard = title === 'dashboard';
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 12px',
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--bg-secondary)',
      zIndex: 80,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        {/* Mobile menu trigger */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'none'
          }}
          className="mobile-menu-btn"
          aria-label="Open mobile menu"
        >
          <Menu size={22} />
        </button>

        {isDashboard ? (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Good evening, {user?.name || 'User'} 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
              Here's your financial overview for {currentMonthYear}
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {title === 'ai-insights' ? 'AI Insights Hub' : title === 'ai-smart-import' ? 'AI Smart Import' : title === 'goals' ? 'Financial Goals' : title}
            </h2>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Top Search Bar */}
        <div className="header-search" style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="form-input" 
            style={{ 
              padding: '8px 12px 8px 36px', 
              fontSize: '13px', 
              width: '180px',
              borderRadius: '10px',
              height: '36px',
              backgroundColor: 'var(--bg-primary)'
            }}
          />
        </div>

        {/* Notifications / Alerts Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '36px',
              height: '36px'
            }}
            aria-label="Open notifications dropdown"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--color-danger)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 85 }} 
                onClick={() => setShowNotifications(false)}
              />
              <div className="glass-card" style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                padding: '16px',
                zIndex: 90,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <h4 style={{ fontSize: '13px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
                  Notifications & Alerts ({alerts.length})
                </h4>
                {alerts.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
                    All budgets healthy! No alerts detected.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                    {alerts.map((alert, idx) => (
                      <div 
                        key={alert._id || idx} 
                        style={{
                          fontSize: '12px',
                          padding: '10px 24px 10px 10px',
                          borderRadius: '8px',
                          backgroundColor: alert.type === 'danger' ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
                          border: `1px solid ${alert.type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)'}`,
                          color: alert.type === 'danger' ? '#991b1b' : '#9a3412',
                          position: 'relative'
                        }}
                      >
                        <button
                          onClick={() => onDismissAlert && onDismissAlert(alert._id)}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '6px',
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            opacity: 0.8,
                            padding: '2px'
                          }}
                          title="Dismiss alert"
                          aria-label="Dismiss notification"
                        >
                          <X size={12} />
                        </button>
                        <strong style={{ textTransform: 'capitalize', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                          {alert.type === 'danger' ? 'Critical Alert' : 'System Warning'}
                        </strong>
                        <p style={{ opacity: 0.9, lineHeight: '1.3' }}>{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Visual Theme Toggle */}
        <button 
          onClick={() => alert("Theme changing triggered (FinWise is locked in light dashboard and navy sidebar mode as requested).")}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px'
          }}
          title="Toggle Theme"
          aria-label="Toggle theme mode"
        >
          <Sun size={16} />
        </button>

        {/* User Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="header-username">
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.1' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                Premium
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {showUserDropdown && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 85 }} 
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="glass-card" style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '160px',
                padding: '8px',
                zIndex: 90,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                    Signed in as <strong style={{ color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</strong>
                  </div>
                  <span style={{ display: 'block', padding: '6px 10px', fontSize: '12px', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'default' }}>
                    Plan: <strong style={{ color: 'var(--color-primary)' }}>Premium</strong>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <style>{`
        .mobile-menu-btn {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .header-search, .header-username {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
