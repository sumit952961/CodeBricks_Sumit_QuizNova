import React, { useState } from 'react';
import { User, Lock, Sparkles, UserPlus, LogIn, CheckCircle, Mail, Phone, Calendar, ClipboardList, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, forgotPassword } from '../../services/api';

export default function AuthScreen({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration specific states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [year, setYear] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        if (!usernameOrEmail.trim() || !password) {
          setError('Please enter your username/email and password.');
          setLoading(false);
          return;
        }
        const res = await loginUser({ usernameOrEmail: usernameOrEmail.trim(), password });
        onAuthSuccess(res.data);
      } else if (authMode === 'register') {
        if (!name.trim() || !username.trim() || !email.trim() || !password || !mobileNumber.trim() || !year) {
          setError('All fields are required for registration.');
          setLoading(false);
          return;
        }

        // Regex Validations
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        const mobileRegex = /^[0-9]{10}$/;

        if (!nameRegex.test(name.trim())) {
          setError("Full Name must contain only letters and spaces (2-50 chars).");
          setLoading(false);
          return;
        }
        if (!usernameRegex.test(username.trim())) {
          setError("Username must start with a letter, contain alphanumeric/underscores, and be 3-20 chars.");
          setLoading(false);
          return;
        }
        if (!emailRegex.test(email.trim().toLowerCase())) {
          setError("Invalid email format.");
          setLoading(false);
          return;
        }
        if (!passwordRegex.test(password)) {
          setError("Password must be at least 6 characters, containing at least one letter and one number.");
          setLoading(false);
          return;
        }
        if (!mobileRegex.test(mobileNumber.trim())) {
          setError("Mobile Number must be exactly 10 digits.");
          setLoading(false);
          return;
        }

        await registerUser({ 
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          mobileNumber: mobileNumber.trim(),
          year: year.trim()
        });
        setSuccessMsg('Account created successfully! Please sign in.');
        setAuthMode('login');
        setPassword('');
        setUsernameOrEmail(username.trim());
      } else if (authMode === 'forgot') {
        if (!username.trim() || !email.trim()) {
          setError('Please fill in both fields.');
          setLoading(false);
          return;
        }
        const res = await forgotPassword(username.trim(), email.trim().toLowerCase());
        setSuccessMsg(res.message);
        setUsername('');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '3rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="animate-float" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              marginBottom: '1rem', 
              border: '2px solid rgba(99, 102, 241, 0.4)', 
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
              objectFit: 'cover'
            }} 
          />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>QuizNova Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {authMode === 'forgot' ? 'Request Password Reset' : 'MERN Developer Assessment Platform'}
          </p>
        </div>

        {/* Tab Selection (Only for login and register) */}
        {authMode !== 'forgot' && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: authMode === 'login' ? 'var(--primary)' : 'transparent',
                color: authMode === 'login' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: authMode === 'register' ? 'var(--primary)' : 'transparent',
                color: authMode === 'register' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Message Notifications */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {authMode === 'login' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter username or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} color="var(--text-dim)" /> : <Eye size={16} color="var(--text-dim)" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {authMode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <ClipboardList size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Username & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Mobile & Year Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Year
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                      className="select-field"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} color="var(--text-dim)" /> : <Eye size={16} color="var(--text-dim)" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {authMode === 'forgot' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter registered username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Registered Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : authMode === 'login' ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : authMode === 'register' ? (
              <>
                <UserPlus size={18} /> Create Account
              </>
            ) : (
              <>
                Request Reset
              </>
            )}
          </button>

          {authMode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem' }}
            >
              Back to Login
            </button>
          )}
        </form>

      </div>
    </div>
  );
}
