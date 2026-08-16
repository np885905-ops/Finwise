import React, { useState } from 'react';
import { Upload, FileText, Trash2, AlertCircle, Sparkles, Check } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { CATEGORIES } from '../utils/mockData';

const AISmartImport = ({ income, expenses, onAddExpense, onAddIncome, onRefresh }) => {
  const [statementFile, setStatementFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [importTransactions, setImportTransactions] = useState([]);
  const [importPeriod, setImportPeriod] = useState({ startDate: '', endDate: '' });
  const [importError, setImportError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImportError("Unsupported file type. Please upload a PDF statement or a PNG/JPG/WEBP transaction screenshot.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImportError("File size exceeds 10MB limit.");
      return;
    }
    setStatementFile(file);
  };

  // Convert file and hit backend parse route
  const handleUploadSubmit = async () => {
    if (!statementFile) return;
    setIsImporting(true);
    setImportError('');
    setUploadProgress(10);
    setProcessingStatus('Reading document contents...');

    // Rotate status messages during Gemini call to simulate deep processing
    let currentStep = 0;
    const progressTimer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        
        // Dynamic status mapping
        currentStep++;
        if (currentStep === 3) setProcessingStatus('Analyzing document structure...');
        if (currentStep === 6) setProcessingStatus('Extracting transactions via Gemini AI...');
        if (currentStep === 9) setProcessingStatus('Categorizing expenses...');
        
        return prev + 10;
      });
    }, 450);

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
            fileName: statementFile.name,
            mimeType: statementFile.type
          })
        });

        clearInterval(progressTimer);
        setUploadProgress(100);
        setProcessingStatus('Completed analysis!');

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
          setImportError(err.message || 'Gemini document analysis failed.');
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

  // Duplicate Check logic comparing with active database
  const checkIsDuplicate = (tx) => {
    const txDateStr = new Date(tx.date).toISOString().split('T')[0];
    if (tx.type === 'income') {
      return income.some(i => 
        i.amount === parseFloat(tx.amount) && 
        (i.date === txDateStr || i.source.toLowerCase().includes(tx.description.toLowerCase()) || tx.description.toLowerCase().includes(i.source.toLowerCase()))
      );
    } else {
      return expenses.some(e => 
        e.amount === parseFloat(tx.amount) && 
        (e.date === txDateStr || e.description.toLowerCase().includes(tx.description.toLowerCase()) || tx.description.toLowerCase().includes(e.description.toLowerCase()))
      );
    }
  };

  const handleEditRow = (tempId, field, value) => {
    setImportTransactions(prev => 
      prev.map(tx => {
        if (tx._tempId === tempId) {
          const updated = { ...tx, [field]: value };
          if (field === 'type') {
            updated.category = value === 'income' ? 'Salary' : 'Other';
          }
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
    setProcessingStatus('Saving imported transactions...');
    
    try {
      for (let tx of selected) {
        if (tx.type === 'income') {
          await onAddIncome({
            amount: parseFloat(tx.amount),
            source: tx.description,
            date: tx.date,
            description: tx.referenceId || 'Imported via AI Smart Import'
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
      handleReset();
    } catch (err) {
      console.error(err);
      alert('Error saving transactions.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStatementFile(null);
    setUploadProgress(0);
    setProcessingStatus('');
    setImportSummary(null);
    setImportTransactions([]);
    setImportPeriod({ startDate: '', endDate: '' });
    setImportError('');
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>AI Smart Import Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Upload a payment screenshot or statement and let FinWise extract your transactions.
        </p>
      </div>

      <div style={{ marginTop: '24px' }}>
        
        {importError && (
          <div className="alert-item danger" style={{ marginBottom: '20px', padding: '10px 14px' }}>
            <AlertCircle size={16} style={{ marginRight: '6px' }} />
            <span>{importError}</span>
          </div>
        )}

        {!importSummary ? (
          <div className="glass-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 30px' }}>
            
            {/* Drag & Drop uploader zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '50px 20px',
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onClick={() => document.getElementById('ai-file-picker').click()}
            >
              <input 
                id="ai-file-picker"
                type="file"
                accept="application/pdf,image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Upload size={28} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Drop PDF or image here
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Supports PDF, PNG, JPG, JPEG, WEBP (Max 10MB)
              </p>
              <button className="btn btn-secondary btn-small" style={{ marginTop: '16px' }}>
                Choose File
              </button>
            </div>

            {statementFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', marginTop: '20px' }}>
                <FileText size={28} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {statementFile.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(statementFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setStatementFile(null); }}
                  className="icon-btn delete-btn"
                  title="Remove file"
                  aria-label="Remove statement file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {isImporting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
                <div className="flex-between" style={{ fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} className="animate-pulse" /> {processingStatus}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar percentage={uploadProgress} colorClass="var(--color-primary)" />
              </div>
            )}

            <button 
              type="button" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px', borderRadius: '10px' }}
              onClick={handleUploadSubmit}
              disabled={!statementFile || isImporting}
            >
              Analyze & Extract Transactions
            </button>
          </div>
        ) : (
          
          /* Review extraction results screen */
          <div className="glass-card" style={{ padding: '24px' }}>
            
            {importSummary.warning && (
              <div className="alert-item warning" style={{ padding: '10px 14px', fontSize: '12px', marginBottom: '20px' }}>
                <AlertCircle size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
                <span>{importSummary.warning}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Detected Period</span>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {importPeriod.startDate ? `${new Date(importPeriod.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(importPeriod.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'N/A'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Income Credits</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
                    +₹{importSummary.totalIncome.toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Expense Debits</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-danger)', marginTop: '4px' }}>
                    -₹{importSummary.totalExpenses.toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Extracted Count</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)', marginTop: '4px' }}>
                    {importTransactions.length} items
                  </p>
                </div>
              </div>
            </div>

            {/* Adjust start/end period details override */}
            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="period-start">Start Period</label>
                <input 
                  id="period-start"
                  type="date" 
                  className="form-input" 
                  style={{ height: '36px', padding: '6px 12px', fontSize: '13px' }}
                  value={importPeriod.startDate || ''}
                  onChange={(e) => setImportPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="period-end">End Period</label>
                <input 
                  id="period-end"
                  type="date" 
                  className="form-input" 
                  style={{ height: '36px', padding: '6px 12px', fontSize: '13px' }}
                  value={importPeriod.endDate || ''}
                  onChange={(e) => setImportPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Review Extracted Transactions
            </h4>

            {/* Checklist table */}
            <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Import</th>
                    <th style={{ width: '130px' }}>Date</th>
                    <th>Description</th>
                    <th style={{ width: '120px' }}>Amount (₹)</th>
                    <th style={{ width: '100px' }}>Type</th>
                    <th style={{ width: '150px' }}>Category</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {importTransactions.map((tx) => {
                    const isDup = checkIsDuplicate(tx);
                    return (
                      <tr key={tx._tempId} style={{ opacity: tx.importChecked ? 1 : 0.45 }}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={tx.importChecked}
                            onChange={() => handleToggleRowSelect(tx._tempId)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="date" 
                            className="form-input" 
                            style={{ height: '28px', padding: '2px 6px', fontSize: '12px' }}
                            value={tx.date}
                            onChange={(e) => handleEditRow(tx._tempId, 'date', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ height: '28px', padding: '2px 6px', fontSize: '12px' }}
                            value={tx.description}
                            onChange={(e) => handleEditRow(tx._tempId, 'description', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ height: '28px', padding: '2px 6px', fontSize: '12px', fontWeight: '700' }}
                            value={tx.amount}
                            onChange={(e) => handleEditRow(tx._tempId, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <select 
                            className="form-input"
                            style={{ height: '28px', padding: '2px 6px', fontSize: '11px' }}
                            value={tx.type}
                            onChange={(e) => handleEditRow(tx._tempId, 'type', e.target.value)}
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                        </td>
                        <td>
                          <select 
                            className="form-input"
                            style={{ height: '28px', padding: '2px 6px', fontSize: '11px' }}
                            value={tx.category}
                            onChange={(e) => handleEditRow(tx._tempId, 'category', e.target.value)}
                          >
                            {tx.type === 'income' ? (
                              <>
                                <option value="Salary">Salary</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Refund">Refund</option>
                                <option value="Interest">Interest</option>
                                <option value="Transfer Received">Transfer Received</option>
                                <option value="Other Income">Other Income</option>
                              </>
                            ) : (
                              CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                            )}
                          </select>
                        </td>
                        <td>
                          {isDup ? (
                            <span className="badge badge-danger" style={{ fontSize: '9px' }}>⚠ Duplicate</span>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '9px' }}>New</span>
                          )}
                        </td>
                        <td>
                          <button 
                            onClick={() => handleRejectRow(tx._tempId)} 
                            className="icon-btn delete-btn"
                            title="Reject item"
                            aria-label="Reject item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex-between">
              <button className="btn btn-secondary" onClick={handleReset}>
                Clear & Upload Another
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleBatchImportSave}
                  disabled={importTransactions.filter(t => t.importChecked).length === 0}
                >
                  Import Selected ({importTransactions.filter(t => t.importChecked).length})
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default AISmartImport;
