import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Percent,
  Activity,
  CheckCircle,
  Info,
  Calendar,
  FileText,
  DollarSign,
  Plus,
  Upload
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { CATEGORIES } from '../utils/mockData';

const Dashboard = ({ 
  income, 
  expenses, 
  budgets, 
  goals, 
  insights, 
  alerts, 
  setActivePage,
  onAddExpense,
  onAddIncome,
  onRefresh
}) => {

  // Calculations
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = totalIncome - totalExpenses;
  const balance = totalSavings;

  // Chart 1: Monthly expenses grouped by date
  const getExpenseChartData = () => {
    const dates = {};
    expenses.forEach(e => {
      const dateStr = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dates[dateStr] = (dates[dateStr] || 0) + e.amount;
    });

    return Object.entries(dates)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
  };

  const expenseChartData = getExpenseChartData().length > 0 
    ? getExpenseChartData() 
    : [{ date: 'No Data', amount: 0 }];

  // Donut chart category data
  const categoryBreakdownData = useMemo(() => {
    const categoryTotals = {};
    let total = 0;
    expenses.forEach(e => {
      let cat = e.category;
      if (cat === 'Food') cat = 'Food & Dining';
      if (cat === 'Travel') cat = 'Transport';
      if (cat === 'Bills') cat = 'Bills & Utilities';

      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
      total += e.amount;
    });

    return {
      total,
      list: Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
    };
  }, [expenses]);

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#f97316'];

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    return [
      ...income.map(i => ({ ...i, type: 'income', category: 'Salary', method: 'Bank' })),
      ...expenses.map(e => ({ ...e, type: 'expense', method: 'UPI' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 5);
  }, [income, expenses]);

  // Overall Budget calculations
  const budgetProgress = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const percentage = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0;
    
    let warningState = 'normal'; // normal, approaching, near, exceeded
    if (percentage >= 100) warningState = 'exceeded';
    else if (percentage >= 90) warningState = 'near';
    else if (percentage >= 70) warningState = 'approaching';

    return {
      totalBudget,
      percentage: percentage.toFixed(1),
      warningState,
      remaining: Math.max(totalBudget - totalExpenses, 0)
    };
  }, [budgets, totalExpenses]);

  // =========================================================================
  // QUICK ACTIONS MODALS STATES
  // =========================================================================
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isGstOpen, setIsGstOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Salary Shortcut State
  const [salaryAmount, setSalaryAmount] = useState('30000');
  const [salarySource, setSalarySource] = useState('Salary Credit');
  const [salaryDate, setSalaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [salaryDesc, setSalaryDesc] = useState('Tech Corp salary payout');

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!salaryAmount || isNaN(salaryAmount) || parseFloat(salaryAmount) <= 0) return;
    await onAddIncome({
      amount: parseFloat(salaryAmount),
      source: salarySource,
      date: salaryDate,
      description: salaryDesc
    });
    setIsSalaryOpen(false);
  };

  // GST State
  const [gstInput, setGstInput] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [gstCalcType, setGstCalcType] = useState('Exclusive');
  const [gstTaxType, setGstTaxType] = useState('CGST_SGST');
  const [gstError, setGstError] = useState('');

  const gstResults = useMemo(() => {
    const amt = parseFloat(gstInput);
    if (isNaN(amt) || amt <= 0) {
      return { base: 0, gst: 0, cgst: 0, sgst: 0, igst: 0, final: 0 };
    }
    let gst = 0;
    let base = 0;
    let final = 0;
    if (gstCalcType === 'Exclusive') {
      gst = amt * (gstRate / 100);
      base = amt;
      final = amt + gst;
    } else {
      gst = amt * (gstRate / (100 + gstRate));
      base = amt - gst;
      final = amt;
    }
    let cgst = 0, sgst = 0, igst = 0;
    if (gstTaxType === 'CGST_SGST') {
      cgst = gst / 2;
      sgst = gst / 2;
    } else {
      igst = gst;
    }
    return { base, gst, cgst, sgst, igst, final };
  }, [gstInput, gstRate, gstCalcType, gstTaxType]);

  const handleGstReset = () => {
    setGstInput('');
    setGstRate(18);
    setGstCalcType('Exclusive');
    setGstTaxType('CGST_SGST');
    setGstError('');
  };

  // AI Smart Import Quick Paste State
  const [smartText, setSmartText] = useState('');
  const [smartPreview, setSmartPreview] = useState(null);
  const [smartError, setSmartError] = useState('');
  const [isSmartAnalyzing, setIsSmartAnalyzing] = useState(false);

  const handleSmartAnalyze = async (e) => {
    e.preventDefault();
    if (!smartText.trim()) return;
    setIsSmartAnalyzing(true);
    setSmartError('');
    setSmartPreview(null);

    try {
      const token = localStorage.getItem('finwise_token');
      const lowercaseText = smartText.toLowerCase();
      
      let amt = 0;
      const amtMatch = lowercaseText.match(/(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)/i) || lowercaseText.match(/([\d,]+(?:\.\d+)?)\s*(?:rupees|rs|inr)/i) || lowercaseText.match(/\b(\d{3,6})\b/);
      if (amtMatch) {
        amt = parseFloat(amtMatch[1].replace(/,/g, ''));
      }

      let type = 'expense';
      if (lowercaseText.includes('receive') || lowercaseText.includes('credit') || lowercaseText.includes('salary') || lowercaseText.includes('earn') || lowercaseText.includes('refund')) {
        type = 'income';
      }

      const res = await fetch('http://localhost:5000/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: smartText })
      });

      let suggestedCategory = 'Other';
      if (res.ok) {
        const catData = await res.json();
        suggestedCategory = catData.suggestedCategory || 'Other';
      }

      setSmartPreview({
        amount: amt || 500,
        description: smartText.length > 40 ? smartText.substring(0, 40) + '...' : smartText,
        type,
        category: suggestedCategory,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      setSmartError('Failed to parse text snippet.');
    } finally {
      setIsSmartAnalyzing(false);
    }
  };

  const handleSmartImportSubmit = async () => {
    if (!smartPreview) return;
    if (smartPreview.type === 'income') {
      await onAddIncome({
        amount: smartPreview.amount,
        source: smartPreview.description,
        date: smartPreview.date,
        description: 'Imported via Smart AI'
      });
    } else {
      await onAddExpense({
        amount: smartPreview.amount,
        category: smartPreview.category,
        date: smartPreview.date,
        description: smartPreview.description
      });
    }
    setIsSmartImportOpen(false);
    setSmartText('');
    setSmartPreview(null);
  };

  // PDF Statement Import State
  const [statementFile, setStatementFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState(null);
  const [importTransactions, setImportTransactions] = useState([]);
  const [importPeriod, setImportPeriod] = useState({ startDate: '', endDate: '' });
  const [importError, setImportError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setImportError('');
    if (file.type !== "application/pdf") {
      setImportError("Invalid format. Please upload a PDF.");
      return;
    }
    setStatementFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!statementFile) return;
    setIsImporting(true);
    setImportError('');
    setUploadProgress(10);

    const progressTimer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 350);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(statementFile);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        const token = localStorage.getItem('finwise_token');

        const res = await fetch('http://localhost:5000/api/ai/import-statement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            base64Data,
            fileName: statementFile.name
          })
        });

        clearInterval(progressTimer);
        setUploadProgress(100);

        if (res.ok) {
          const data = await res.json();
          const mappedTx = (data.transactions || []).map((t, idx) => ({
            ...t,
            importChecked: true,
            _tempId: `temp-${idx}`
          }));

          setImportTransactions(mappedTx);
          setImportPeriod(data.period || { startDate: '', endDate: '' });
          
          const totalCredits = mappedTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const totalDebits = mappedTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
          
          setImportSummary({
            totalCount: mappedTx.length,
            totalIncome: totalCredits,
            totalExpenses: totalDebits,
            openingBalance: data.openingBalance,
            closingBalance: data.closingBalance,
            warning: data.warning
          });
        } else {
          const err = await res.json();
          setImportError(err.message || 'Gemini PDF processing failed.');
          setIsImporting(false);
        }
      };
    } catch (err) {
      clearInterval(progressTimer);
      console.error(err);
      setImportError('Failed to parse statement file.');
      setIsImporting(false);
    }
  };

  const checkIsDuplicate = (tx) => {
    const txDateStr = new Date(tx.date).toISOString().split('T')[0];
    if (tx.type === 'income') {
      return income.some(i => i.amount === parseFloat(tx.amount) && (i.date === txDateStr || i.source.toLowerCase().includes(tx.description.toLowerCase())));
    } else {
      return expenses.some(e => e.amount === parseFloat(tx.amount) && (e.date === txDateStr || e.description.toLowerCase().includes(tx.description.toLowerCase())));
    }
  };

  const handleEditRow = (tempId, field, value) => {
    setImportTransactions(prev => 
      prev.map(tx => {
        if (tx._tempId === tempId) {
          const updated = { ...tx, [field]: value };
          if (field === 'type') updated.category = value === 'income' ? 'Salary' : 'Other';
          return updated;
        }
        return tx;
      })
    );
  };

  const handleToggleRowSelect = (tempId) => {
    setImportTransactions(prev => 
      prev.map(tx => tx._tempId === tempId ? { ...tx, importChecked: !tx.importChecked } : tx)
    );
  };

  const handleRejectRow = (tempId) => {
    setImportTransactions(prev => prev.filter(tx => tx._tempId !== tempId));
  };

  const handleBatchImportSave = async () => {
    const selected = importTransactions.filter(t => t.importChecked);
    if (selected.length === 0) return;
    setIsImporting(true);
    try {
      for (let tx of selected) {
        if (tx.type === 'income') {
          await onAddIncome({
            amount: parseFloat(tx.amount),
            source: tx.description,
            date: tx.date,
            description: tx.referenceId || 'Imported statement transaction'
          });
        } else {
          await onAddExpense({
            amount: parseFloat(tx.amount),
            category: tx.category,
            date: tx.date,
            description: tx.description
          });
        }
      }
      await onRefresh();
      alert(`Successfully imported ${selected.length} transactions.`);
      handleResetStatementUploader();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
      setIsImportModalOpen(false);
    }
  };

  const handleResetStatementUploader = () => {
    setStatementFile(null);
    setUploadProgress(0);
    setIsImporting(false);
    setImportSummary(null);
    setImportTransactions([]);
    setImportPeriod({ startDate: '', endDate: '' });
    setImportError('');
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* 1. Four Large Redesigned Summary Cards */}
      <div className="metrics-row">
        
        {/* Card 1: Income */}
        <div className="glass-card metric-card hoverable" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <ArrowUpRight size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Income</span>
            <span className="metric-value">₹{totalIncome.toLocaleString('en-IN')}</span>
            <span className="metric-trend" style={{ color: 'var(--color-success)' }}>+12.5% from last month ↑</span>
          </div>
        </div>

        {/* Card 2: Expenses */}
        <div className="glass-card metric-card hoverable" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            <ArrowDownLeft size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Expenses</span>
            <span className="metric-value">₹{totalExpenses.toLocaleString('en-IN')}</span>
            <span className="metric-trend" style={{ color: 'var(--color-danger)' }}>+8.3% from last month ↑</span>
          </div>
        </div>

        {/* Card 3: Savings */}
        <div className="glass-card metric-card hoverable" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Savings</span>
            <span className="metric-value">₹{totalSavings.toLocaleString('en-IN')}</span>
            <span className="metric-trend" style={{ color: 'var(--color-primary)' }}>+18.9% from last month ↑</span>
          </div>
        </div>

        {/* Card 4: Available Balance */}
        <div className="glass-card metric-card hoverable" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-icon-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
            <Wallet size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Available Balance</span>
            <span className="metric-value">₹{balance.toLocaleString('en-IN')}</span>
            <span className="metric-trend" style={{ color: 'var(--text-secondary)' }}>Updated just now</span>
          </div>
        </div>

      </div>

      {/* 2. Visually Prominent Quick Actions Panel */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          
          <button 
            onClick={() => setIsSalaryOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'left' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--color-success)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Enter Salary</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Add salary details</span>
            </div>
          </button>

          <button 
            onClick={() => setIsGstOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'left' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={18} />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Quick GST</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Calculate GST instantly</span>
            </div>
          </button>

          <button 
            onClick={() => setIsSmartImportOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'left' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--color-info)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>AI Smart Import</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Import from PDF / Image</span>
            </div>
          </button>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'left' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Bank Statement</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Upload PDF statement</span>
            </div>
          </button>

        </div>
      </div>

      {/* 3. Main Analytics Area (Two Column Layout) */}
      <div className="dashboard-grid">
        
        {/* LEFT: Income vs Expenses area chart */}
        <div className="glass-card" style={{ gridColumn: 'span 8', minHeight: '380px' }} id="chart-trend-card">
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Income vs Expenses Flows</h3>
            <button 
              onClick={() => setActivePage('analytics')} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            >
              Configure filters →
            </button>
          </div>
          
          <div style={{ width: '100%', height: '280px' }}>
            {expenseChartData.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No transaction data found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
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
                  <Area type="monotone" dataKey="amount" stroke="var(--color-danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT: Expense by Category Donut Chart */}
        <div className="glass-card" style={{ gridColumn: 'span 4', minHeight: '380px' }} id="chart-pie-card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Expense by Category</h3>
          <div style={{ width: '100%', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryBreakdownData.list.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No expense records logged.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData.list}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryBreakdownData.list.map((entry, index) => (
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
                
                {/* Responsive Donut center total text */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total</span>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{categoryBreakdownData.total.toLocaleString('en-IN')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Grid of secondary detail widgets */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        
        {/* Left Column: Recent Transactions & Goals */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }} className="dashboard-left-col">
          
          {/* Recent Transactions Table */}
          <div className="glass-card">
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Recent Transactions</h3>
              <button 
                onClick={() => setActivePage('expenses')} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}
              >
                View All →
              </button>
            </div>
            
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, idx) => (
                    <tr key={tx._id || idx}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <strong style={{ fontWeight: '600' }}>{tx.source || tx.description}</strong>
                      </td>
                      <td>
                        <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '10px' }}>
                          {tx.type === 'income' ? 'Salary' : tx.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        {tx.method || 'UPI'}
                      </td>
                      <td style={{ 
                        fontWeight: '700', 
                        textAlign: 'right',
                        color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Goals Widgets */}
          <div className="glass-card">
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Financial Goals</h3>
              <button 
                onClick={() => setActivePage('goals')} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}
              >
                View All →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {goals.slice(0, 2).map(goal => {
                const percent = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                return (
                  <div key={goal._id || goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <div className="flex-between">
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{goal.name}</strong>
                      <span className="badge badge-success" style={{ fontSize: '9px', background: isCompleted ? 'var(--color-success-light)' : 'rgba(99,102,241,0.08)', color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {isCompleted ? 'Completed' : 'On Track'}
                      </span>
                    </div>
                    
                    <div className="flex-between" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                      <strong>{Math.round(percent)}%</strong>
                    </div>

                    <ProgressBar percentage={percent} colorClass={isCompleted ? 'var(--color-success)' : 'var(--color-primary)'} />
                    
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Budgets, AI Insights, Alerts */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }} className="dashboard-right-col">
          
          {/* Budget Overview circular metric */}
          <div className="glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Budget Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Basic circular CSS gauge */}
                <svg width="90" height="90" viewBox="0 0 36 36">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${budgetProgress.percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      budgetProgress.warningState === 'exceeded' ? 'var(--color-danger)' :
                      budgetProgress.warningState === 'near' ? 'var(--color-warning)' :
                      budgetProgress.warningState === 'approaching' ? 'var(--color-warning)' : 'var(--color-success)'
                    }
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{budgetProgress.percentage}%</span>
                  <span style={{ fontSize: '8px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Used</span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Monthly Budget</span>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{budgetProgress.totalBudget.toLocaleString('en-IN')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px', fontSize: '12px' }}>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Spent:</span>
                    <strong style={{ color: 'var(--color-danger)' }}>₹{totalExpenses.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
                    <strong style={{ color: 'var(--color-success)' }}>₹{budgetProgress.remaining.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div 
            className="glass-card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              boxShadow: '0 4px 18px rgba(168, 85, 247, 0.05)'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> AI Insight
              </h3>
              <button 
                onClick={() => setActivePage('ai-insights')}
                style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
              >
                View All
              </button>
            </div>
            
            <p style={{ fontSize: '12.5px', lineHeight: '1.4', color: 'var(--text-primary)', fontWeight: '500' }}>
              "{insights[0]?.message || 'Start tracking your spending to receive customized wealth recommendations.'}"
            </p>
            
            <button 
              onClick={() => setActivePage('ai-insights')}
              className="btn btn-secondary btn-small"
              style={{ width: '100%', marginTop: '16px', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.2)', color: '#7c3aed', fontWeight: '700', padding: '6px 12px', backgroundColor: 'rgba(124, 58, 237, 0.05)' }}
            >
              View Full Analysis →
            </button>
          </div>

          {/* Active alerts center */}
          <div className="glass-card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <AlertTriangle size={15} style={{ color: 'var(--color-warning)' }} /> Alerts
              </h3>
              <button 
                onClick={() => setActivePage('alerts')} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                View All →
              </button>
            </div>

            <div className="alerts-list">
              {alerts.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
                  No active warnings detected.
                </p>
              ) : (
                alerts.slice(0, 2).map((alert, idx) => {
                  let alertColorClass = 'info';
                  if (alert.type === 'danger') alertColorClass = 'danger';
                  if (alert.type === 'warning') alertColorClass = 'warning';
                  return (
                    <div key={alert._id || idx} className={`alert-item ${alertColorClass}`} style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '12px' }}>{alert.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          MODALS RENDERS
          ========================================================================= */}

      {/* 1. Enter Salary Modal */}
      <Modal isOpen={isSalaryOpen} onClose={() => setIsSalaryOpen(false)} title="💰 Record Monthly Salary">
        <form onSubmit={handleSalarySubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="salary-amount-input">Amount (₹)</label>
            <input 
              id="salary-amount-input"
              type="number"
              className="form-input"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="salary-source-input">Income Source</label>
            <input 
              id="salary-source-input"
              type="text"
              className="form-input"
              value={salarySource}
              onChange={(e) => setSalarySource(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="salary-date-input">Date Received</label>
              <input 
                id="salary-date-input"
                type="date"
                className="form-input"
                value={salaryDate}
                onChange={(e) => setSalaryDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="salary-desc-input">Description</label>
              <input 
                id="salary-desc-input"
                type="text"
                className="form-input"
                value={salaryDesc}
                onChange={(e) => setSalaryDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-between" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSalaryOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-success">Record Income</button>
          </div>
        </form>
      </Modal>

      {/* 2. GST Modal */}
      <Modal isOpen={isGstOpen} onClose={() => setIsGstOpen(false)} title="🧾 Quick GST Calculator">
        {gstError && <div className="alert-item danger" style={{ marginBottom: '16px', padding: '8px 12px' }}>{gstError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="gst-amount-input">Amount (₹)</label>
            <input 
              id="gst-amount-input"
              type="number"
              className="form-input"
              placeholder="e.g. 1000"
              value={gstInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val && parseFloat(val) < 0) {
                  setGstError('Amount cannot be negative.');
                } else {
                  setGstError('');
                }
                setGstInput(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!gstInput || parseFloat(gstInput) <= 0) {
                    setGstError('Please enter a valid positive amount.');
                  }
                }
              }}
              min="0"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="gst-rate-select">GST Rate</label>
              <select
                id="gst-rate-select"
                className="form-input"
                value={gstRate}
                onChange={(e) => setGstRate(parseInt(e.target.value))}
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gst-calc-type">Calculation Type</label>
              <select
                id="gst-calc-type"
                className="form-input"
                value={gstCalcType}
                onChange={(e) => setGstCalcType(e.target.value)}
              >
                <option value="Exclusive">GST Exclusive</option>
                <option value="Inclusive">GST Inclusive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="gst-tax-type">Tax Type</label>
            <select
              id="gst-tax-type"
              className="form-input"
              value={gstTaxType}
              onChange={(e) => setGstTaxType(e.target.value)}
            >
              <option value="CGST_SGST">CGST + SGST</option>
              <option value="IGST">IGST Only</option>
            </select>
          </div>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Tax Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Base Amount</span>
                <span style={{ fontWeight: '600' }}>₹{gstResults.base.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total GST</span>
                <span style={{ fontWeight: '600', color: 'var(--color-warning)' }}>₹{gstResults.gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {gstTaxType === 'CGST_SGST' ? (
                <>
                  <div className="flex-between" style={{ paddingLeft: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>CGST ({gstRate/2}%)</span>
                    <span>₹{gstResults.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex-between" style={{ paddingLeft: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>SGST ({gstRate/2}%)</span>
                    <span>₹{gstResults.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex-between" style={{ paddingLeft: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>IGST ({gstRate}%)</span>
                  <span>₹{gstResults.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '15px', fontWeight: '700' }}>
                <span>Final Amount</span>
                <span style={{ color: 'var(--color-success)' }}>₹{gstResults.final.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <div className="flex-between" style={{ marginTop: '16px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                if (!gstInput || parseFloat(gstInput) <= 0) {
                  setGstError('Please enter a valid positive amount.');
                }
              }}
            >
              Calculate
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleGstReset}>Reset</button>
              <button type="button" className="btn btn-primary" onClick={() => setIsGstOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. AI Smart Import Modal */}
      <Modal isOpen={isSmartImportOpen} onClose={() => setIsSmartImportOpen(false)} title="📄 AI Smart Import">
        {smartError && <div className="alert-item danger" style={{ marginBottom: '16px', padding: '8px 12px' }}>{smartError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="smart-text-area">Paste transaction detail text</label>
            <textarea
              id="smart-text-area"
              className="form-input"
              rows={4}
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="e.g. Spent Rs. 450 at Swiggy for lunch"
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              disabled={isSmartAnalyzing}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={handleSmartAnalyze}
            disabled={isSmartAnalyzing || !smartText.trim()}
          >
            {isSmartAnalyzing ? 'Analyzing with AI...' : 'Analyze Transaction'}
          </button>

          {smartPreview && (
            <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Extracted Preview</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Description</span>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: '180px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                    value={smartPreview.description}
                    onChange={(e) => setSmartPreview(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: '180px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                    value={smartPreview.amount}
                    onChange={(e) => setSmartPreview(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                  <select 
                    className="form-input" 
                    style={{ width: '180px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                    value={smartPreview.type}
                    onChange={(e) => setSmartPreview(prev => ({ ...prev, type: e.target.value, category: e.target.value === 'income' ? 'Salary' : 'Other' }))}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                {smartPreview.type === 'expense' && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Category</span>
                    <select 
                      className="form-input" 
                      style={{ width: '180px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                      value={smartPreview.category}
                      onChange={(e) => setSmartPreview(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                  <input 
                    type="date" 
                    className="form-input" 
                    style={{ width: '180px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                    value={smartPreview.date}
                    onChange={(e) => setSmartPreview(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={handleSmartImportSubmit}
                >
                  Import Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 4. PDF Statement Import Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => {
          setIsImportModalOpen(false);
          handleResetStatementUploader();
        }} 
        title="🏦 Import Bank Statement"
      >
        {importError && <div className="alert-item danger" style={{ marginBottom: '16px', padding: '8px 12px' }}>{importError}</div>}
        
        {!importSummary ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-primary)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('dash-pdf-picker').click()}
            >
              <input 
                id="dash-pdf-picker"
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Upload size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Drop PDF bank statement here</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>or click to choose file</p>
            </div>

            {statementFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{statementFile.name}</p>
                </div>
              </div>
            )}

            {isImporting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <ProgressBar percentage={uploadProgress} colorClass="var(--color-primary)" />
              </div>
            )}

            <button 
              type="button" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={handleUploadSubmit}
              disabled={!statementFile || isImporting}
            >
              Parse Statement
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '12.5px' }}>
              <div>Credits: <strong style={{ color: 'var(--color-success)' }}>₹{importSummary.totalIncome.toLocaleString('en-IN')}</strong></div>
              <div>Debits: <strong style={{ color: 'var(--color-danger)' }}>₹{importSummary.totalExpenses.toLocaleString('en-IN')}</strong></div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importTransactions.map((tx) => {
                    const isDup = checkIsDuplicate(tx);
                    return (
                      <tr key={tx._tempId} style={{ opacity: tx.importChecked ? 1 : 0.5 }}>
                        <td>{tx.date}</td>
                        <td>{tx.description}</td>
                        <td style={{ fontWeight: '700' }}>₹{tx.amount}</td>
                        <td>
                          {isDup ? <span className="badge badge-danger">⚠ Dup</span> : <span className="badge badge-success">New</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex-between" style={{ marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleResetStatementUploader}>Clear</button>
              <button type="button" className="btn btn-primary" onClick={handleBatchImportSave}>Import Transactions</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Responsive layout overrides CSS */}
      <style>{`
        @media (max-width: 1024px) {
          #chart-trend-card, #chart-pie-card, .dashboard-left-col, .dashboard-right-col, .dashboard-grid > div {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
