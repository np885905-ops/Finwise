import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AISmartImport from './pages/AISmartImport';
import Alerts from './pages/Alerts';

const API_BASE = '/api';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('finwise_token') || null);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // States fetched from backend
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);

  // Fetch headers helper
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  // Handle Token state and Local Storage Sync
  useEffect(() => {
    if (token) {
      localStorage.setItem('finwise_token', token);
    } else {
      localStorage.removeItem('finwise_token');
      setUser(null);
    }
  }, [token]);

  // Fetch Profile if Token exists
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: getHeaders()
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          setToken(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchProfile();
  }, [token, getHeaders]);

  // Master Fetch function to synchronize all metrics
  const fetchAllData = useCallback(async () => {
    if (!token) return;
    try {
      // Run queries in parallel
      const [incRes, expRes, budRes, goalRes, alertRes, insRes] = await Promise.all([
        fetch(`${API_BASE}/transactions/income`, { headers: getHeaders() }),
        fetch(`${API_BASE}/transactions/expenses`, { headers: getHeaders() }),
        fetch(`${API_BASE}/budgets`, { headers: getHeaders() }),
        fetch(`${API_BASE}/goals`, { headers: getHeaders() }),
        fetch(`${API_BASE}/alerts`, { headers: getHeaders() }),
        fetch(`${API_BASE}/ai/insights`, { headers: getHeaders() })
      ]);

      if (incRes.ok) setIncome(await incRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (budRes.ok) setBudgets(await budRes.json());
      if (goalRes.ok) setGoals(await goalRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
      if (insRes.ok) setInsights(await insRes.json());
    } catch (err) {
      console.error('Error synchronizing database metrics:', err);
    }
  }, [token, getHeaders]);

  // Fetch data whenever user logs in or refreshes
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Auth Operations
  const handleLogin = (data) => {
    setToken(data.token);
    setUser(data.user);
    setActivePage('dashboard');
  };

  const handleRegister = (data) => {
    setToken(data.token);
    setUser(data.user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIncome([]);
    setExpenses([]);
    setBudgets([]);
    setGoals([]);
    setAlerts([]);
    setInsights([]);
    setAuthView('login');
  };

  // =========================================================================
  // TRANSACTION CRUD HANDLERS
  // =========================================================================
  const handleAddExpense = async (expenseData) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        await fetchAllData(); // Refresh calculations and alerts
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save expense.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditExpense = async (updatedExp) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/expenses/${updatedExp._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedExp)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update expense.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense transaction permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete expense.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddIncome = async (incomeData) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/income`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(incomeData)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save income.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditIncome = async (updatedInc) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/income/${updatedInc._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedInc)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update income.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Delete this income record permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/income/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete income.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================
  // BUDGETS, GOALS & ALERTS HANDLERS
  // =========================================================================
  const handleUpdateBudget = async (category, limit) => {
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ category, limit })
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to adjust budget.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (goalData) => {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to set savings goal.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      const res = await fetch(`${API_BASE}/goals/${updatedGoal._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedGoal)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update goal.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Remove this savings goal milestone?')) return;
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to remove goal.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================
  // DATA SEEDING AND CUSTOMIZATION
  // =========================================================================
  const handleResetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/seed-demo`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        alert('Failed to re-seed defaults on server.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearData = async () => {
    try {
      // Clear local database entries on server via endpoint actions
      // Simply deleting them sequentially
      await Promise.all([
        ...income.map(item => fetch(`${API_BASE}/transactions/income/${item._id}`, { method: 'DELETE', headers: getHeaders() })),
        ...expenses.map(item => fetch(`${API_BASE}/transactions/expenses/${item._id}`, { method: 'DELETE', headers: getHeaders() })),
        ...goals.map(item => fetch(`${API_BASE}/goals/${item._id}`, { method: 'DELETE', headers: getHeaders() }))
      ]);

      // Set budgets limits to 0
      await Promise.all(
        budgets.map(b => fetch(`${API_BASE}/budgets`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ category: b.category, limit: 0 })
        }))
      );

      await fetchAllData();
    } catch (err) {
      console.error('Error clearing workspace tables:', err);
    }
  };

  // Dynamic profile updates
  const handleUpdateUser = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { // mock update on profile fields
        headers: getHeaders()
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, ...profileData }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE}/alerts/${alertId}/dismiss`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (res.ok) {
        // Remove locally from state immediately
        setAlerts(prev => prev.filter(a => a._id !== alertId));
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  // State-based SPA Router Rendering
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            income={income}
            expenses={expenses}
            budgets={budgets}
            goals={goals}
            insights={insights}
            alerts={alerts}
            setActivePage={setActivePage}
            onAddExpense={handleAddExpense}
            onAddIncome={handleAddIncome}
            onRefresh={fetchAllData}
          />
        );
      case 'expenses':
        return (
          <Expenses
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'income':
        return (
          <Income
            income={income}
            onAddIncome={handleAddIncome}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        );
      case 'budget':
        return (
          <Budget
            expenses={expenses}
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'ai-insights':
        return (
          <AIInsights
            income={income}
            expenses={expenses}
            budgets={budgets}
            goals={goals}
            insights={insights}
          />
        );
      case 'settings':
        return (
          <Settings
            user={user}
            onUpdateUser={handleUpdateUser}
            onResetData={handleResetData}
            onClearData={handleClearData}
          />
        );
      case 'analytics':
        return (
          <Analytics
            income={income}
            expenses={expenses}
          />
        );
      case 'ai-smart-import':
        return (
          <AISmartImport
            income={income}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onAddIncome={handleAddIncome}
            onRefresh={fetchAllData}
          />
        );
      case 'alerts':
        return (
          <Alerts
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
          />
        );
      default:
        return <Dashboard income={income} expenses={expenses} budgets={budgets} goals={goals} insights={insights} alerts={alerts} setActivePage={setActivePage} onAddExpense={handleAddExpense} onAddIncome={handleAddIncome} onRefresh={fetchAllData} />;
    }
  };

  if (!user) {
    return authView === 'login' ? (
      <Login 
        onLogin={handleLogin} 
        navigateToRegister={() => setAuthView('register')} 
        apiBase={API_BASE} 
      />
    ) : (
      <Register 
        onRegister={handleRegister} 
        navigateToLogin={() => setAuthView('login')} 
        apiBase={API_BASE} 
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="main-content">
        <Header
          title={activePage}
          user={user}
          alerts={alerts}
          setIsMobileOpen={setIsMobileOpen}
          onDismissAlert={handleDismissAlert}
        />
        <div style={{ marginTop: '16px' }}>
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}

export default App;
