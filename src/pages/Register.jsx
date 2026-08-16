import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = ({ onRegister, navigateToLogin, apiBase }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        onRegister(data);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      setError('Network connection error. Check if the server is running.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%), var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Start tracking and growing your wealth today.
          </p>
        </div>

        {error && (
          <div className="alert-item danger" style={{ marginBottom: '20px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="register-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Nikhil Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="register-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="register-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginBottom: '24px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Get Started'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button 
            onClick={navigateToLogin} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-primary)', 
              fontWeight: '600', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
