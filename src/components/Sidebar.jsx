import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  PieChart, 
  Target, 
  Sparkles, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, onLogout, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'ai-smart-import', label: 'AI Smart Import', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
          transition: 'transform var(--transition-normal)',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="app-sidebar"
      >
        {/* Sidebar Logo */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
              FinWise
            </h1>
            <span style={{ fontSize: '10px', color: 'var(--sidebar-text-muted)', fontWeight: '500', display: 'block', marginTop: '2px' }}>
              "Your Money, Your Future"
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--sidebar-text-muted)',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#fff' : 'var(--sidebar-text-muted)' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Premium Upgrade Bottom Card */}
        <div style={{ padding: '16px', margin: '0 16px 16px 16px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#fff' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>Upgrade to Premium</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--sidebar-text-muted)', marginBottom: '10px' }}>
            <span>✓ Unlimited AI Insights</span>
            <span>✓ Advanced Analytics</span>
            <span>✓ Priority Support</span>
          </div>
          <button 
            onClick={() => alert("Premium upgrade option triggered (Demo mode).")}
            className="btn btn-primary btn-small"
            style={{ width: '100%', borderRadius: '8px', fontSize: '11px', padding: '6px 12px', background: 'var(--color-primary)' }}
          >
            Upgrade Now →
          </button>
        </div>

        {/* Logout bottom row */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-danger)',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: '500',
              textAlign: 'left',
              transition: 'background var(--transition-fast)',
              width: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1025px) {
          .app-sidebar {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
