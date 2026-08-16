import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

const Analytics = ({ income, expenses }) => {
  const [period, setPeriod] = useState('this-month');

  // Filter lists based on selected period dropdown
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const checkDateInPeriod = (dateStr) => {
      const d = new Date(dateStr);
      const dy = d.getFullYear();
      const dm = d.getMonth();

      if (period === 'this-month') {
        return dy === currentYear && dm === currentMonth;
      }
      if (period === 'last-month') {
        const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
        return dy === lastY && dm === lastM;
      }
      if (period === 'last-3-months') {
        const limit = new Date();
        limit.setMonth(limit.getMonth() - 3);
        return d >= limit;
      }
      if (period === 'last-6-months') {
        const limit = new Date();
        limit.setMonth(limit.getMonth() - 6);
        return d >= limit;
      }
      if (period === 'this-year') {
        return dy === currentYear;
      }
      return true;
    };

    return {
      income: income.filter(item => checkDateInPeriod(item.date)),
      expenses: expenses.filter(item => checkDateInPeriod(item.date))
    };
  }, [income, expenses, period]);

  // Income vs Expenses flow chart data parser
  const chartData = useMemo(() => {
    const datesMap = {};
    
    filteredData.income.forEach(inc => {
      const label = new Date(inc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!datesMap[label]) datesMap[label] = { label, Income: 0, Expenses: 0 };
      datesMap[label].Income += inc.amount;
    });

    filteredData.expenses.forEach(exp => {
      const label = new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!datesMap[label]) datesMap[label] = { label, Income: 0, Expenses: 0 };
      datesMap[label].Expenses += exp.amount;
    });

    return Object.values(datesMap).sort((a, b) => new Date(a.label) - new Date(b.label));
  }, [filteredData]);

  // Donut chart breakdown calculations
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = {};
    let total = 0;

    filteredData.expenses.forEach(exp => {
      // Map database categories to user-facing terms
      let cat = exp.category;
      if (cat === 'Food') cat = 'Food & Dining';
      if (cat === 'Travel') cat = 'Transport';
      if (cat === 'Bills') cat = 'Bills & Utilities';

      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
      total += exp.amount;
    });

    return {
      total,
      list: Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
    };
  }, [filteredData]);

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#f97316'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Analytics Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Compare cash flows, analyze category budgets, and inspect income trends.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-input" 
            style={{ width: '160px', height: '36px', padding: '6px 12px', fontSize: '13px', backgroundColor: '#fff', borderRadius: '8px' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Income vs Expenses Chart Card */}
        <div className="glass-card" style={{ gridColumn: 'span 8', minHeight: '400px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} /> Income vs Expenses Trend
          </h3>
          <div style={{ width: '100%', height: '320px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No transaction logs recorded in the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)', 
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`]}
                  />
                  <Area type="monotone" dataKey="Income" stroke="var(--color-success)" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="Expenses" stroke="var(--color-danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense by Category Donut Chart Card */}
        <div className="glass-card" style={{ gridColumn: 'span 4', minHeight: '400px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Expenses by Category</h3>
          
          <div style={{ width: '100%', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryBreakdown.list.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No expenses found.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.list}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryBreakdown.list.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Responsive Donut center overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{categoryBreakdown.total.toLocaleString('en-IN')}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* List display with percentages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
            {categoryBreakdown.list.map((item, idx) => (
              <div key={item.name} className="flex-between" style={{ fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong>₹{item.value.toLocaleString('en-IN')}</strong> ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;
