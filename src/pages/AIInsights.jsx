import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Brain, Bot, User, AlertOctagon, TrendingUp, HelpCircle, Trash2 } from 'lucide-react';

const AIInsights = ({ income, expenses, budgets, goals, insights }) => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your FinWise AI Assistant. I can help analyze your logged cash flows, category budgets, and financial targets. How can I help you optimize your wealth today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Suggested questions
  const suggestions = [
    "Where am I spending the most?",
    "How much did I save this month?",
    "Am I close to exceeding my budget?",
    "How much remains for my laptop goal?"
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend.trim();
    if (!prompt) return;

    // Add user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('finwise_token');
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: prompt })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const err = await res.json();
        alert(err.message || 'Chatbot error.');
      }
    } catch (err) {
      console.error(err);
      // Fallback response on connection error
      const aiMsg = {
        id: `msg-ai-error-${Date.now()}`,
        sender: 'ai',
        text: 'FinWise AI engine connection failed. Please ensure the backend server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation logs?')) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'ai',
          text: "Logs cleared. Ask me another question about your personal cash flows!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <TrendingUp style={{ color: 'var(--color-success)' }} />;
      case 'danger': return <AlertOctagon style={{ color: 'var(--color-danger)' }} />;
      case 'warning': return <AlertOctagon style={{ color: 'var(--color-warning)' }} />;
      default: return <HelpCircle style={{ color: 'var(--color-info)' }} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div style={{ gridColumn: 'span 12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Brain size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>AI Financial Analysis</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>REAL AI INTEGRATED</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Analyzing actual incomes, budgets, alerts, and goal milestones dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="glass-card" style={{ gridColumn: 'span 7', height: 'fit-content' }} id="ai-insights-list">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--color-primary)' }} /> Live Recommendations & Anomalies
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {insights.map((ins, index) => (
            <div 
              key={ins.id || index} 
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: ins.type === 'success' ? 'var(--color-success-light)' : ins.type === 'danger' ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getInsightIcon(ins.type)}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.4' }}>{ins.message}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  💡 <strong>Optimization:</strong> {ins.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="glass-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', height: '540px', padding: '20px' }} id="ai-chat-card">
        
        {/* Chat Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700' }}>FinWise AI Assistant</h4>
              <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="status-indicator status-online" style={{ margin: 0 }} /> Active
              </span>
            </div>
          </div>
          <button onClick={handleClearChat} className="icon-btn delete-btn" title="Clear chat history" aria-label="Clear chat">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  display: 'flex',
                  gap: '8px',
                  flexDirection: isAI ? 'row' : 'row-reverse'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isAI ? 'var(--color-primary-light)' : 'rgba(255, 255, 255, 0.05)',
                  color: isAI ? 'var(--color-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  {isAI ? <Bot size={12} /> : <User size={12} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isAI ? 'var(--bg-input)' : 'var(--color-primary)',
                    color: isAI ? 'var(--text-primary)' : '#fff',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    border: isAI ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={12} />
              </div>
              <div style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span className="dot-typing" />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion questions chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginTop: 'auto' }} className="chat-suggestions-row">
          {suggestions.map((sug, i) => (
            <button 
              key={i} 
              onClick={() => handleSendMessage(sug)}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                borderRadius: '99px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <input
            type="text"
            className="form-input"
            style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}
            placeholder="Ask about spending, budgets, savings rate..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isTyping}>
            <Send size={16} />
          </button>
        </form>

      </div>

      <style>{`
        .dot-typing {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          animation: bounce 1.2s infinite ease-in-out;
          display: inline-block;
          position: relative;
        }
        .dot-typing::before, .dot-typing::after {
          content: '';
          display: inline-block;
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          animation: bounce 1.2s infinite ease-in-out;
        }
        .dot-typing::before {
          left: -10px;
          animation-delay: -0.4s;
        }
        .dot-typing::after {
          left: 10px;
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .chat-suggestions-row::-webkit-scrollbar {
          height: 4px;
        }
        @media (max-width: 1024px) {
          #ai-insights-list, #ai-chat-card {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AIInsights;
