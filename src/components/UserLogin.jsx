import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import './UserAuth.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function UserLogin() {
  const [view, setView] = useState('login'); // 'login' | 'forgot-email' | 'forgot-code'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Common UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  /* ── 1. Handle User Login ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please provide both email and password.');
    }
    
    if (!validateEmail(email)) {
      return setError('Please enter a valid email address.');
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();
      if (data.success) {
        login({ ...data.user, token: data.token });
        navigate('/');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  /* ── 2. Handle Send Verification Code ── */
  const handleSendResetCode = async (e) => {
    e?.preventDefault();
    if (!forgotEmail) {
      return setError('Please enter your account email address.');
    }
    if (!validateEmail(forgotEmail)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setView('forgot-code');
        setResendCooldown(60);
      } else {
        setError(data.message || 'Unable to send verification code.');
      }
    } catch {
      setError('Connection error. Failed to send verification code.');
    }
    setLoading(false);
  };

  /* ── 3. Handle Verify Code & Set New Password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      return setError('Please enter the 6-digit verification code.');
    }
    if (otpCode.trim().length !== 6) {
      return setError('Verification code must be exactly 6 digits.');
    }
    if (!newPassword || newPassword.length < 6) {
      return setError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match. Please recheck.');
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          code: otpCode.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('🎉 Password reset successfully! Logging you in...');
        setTimeout(() => {
          if (data.token && data.user) {
            login({ ...data.user, token: data.token });
            navigate('/');
          } else {
            setEmail(forgotEmail);
            setView('login');
            setSuccess('Password updated! Please sign in with your new password.');
          }
        }, 1200);
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      setError('Connection error. Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <SEO title={view === 'login' ? "Sign In | Dr. Waqas Ahmad Awan" : "Reset Password | Dr. Waqas Ahmad Awan"} noIndex />
      <div className="auth-split-container">
        
        {/* Left Side: Branding */}
        <div className="auth-brand-side">
          <Link to="/" className="brand-back-nav">← Back to Home</Link>
          <div className="brand-content">
            <h2>{view === 'login' ? 'Welcome Back' : 'Account Recovery'}</h2>
            <p className="brand-subtitle">Dr. Waqas Ahmad Awan</p>
            <p className="brand-description">
              {view === 'login' 
                ? 'Sign in to access your child\'s pediatric consultation records, doctor\'s notes, and manage upcoming appointments.'
                : 'Reset your password securely using an email verification code sent directly to your registered inbox.'}
            </p>
          </div>
          <div className="brand-decor-circle login-decor"></div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <div className="auth-form-inner">

            {/* ════ VIEW 1: SIGN IN FORM ════ */}
            {view === 'login' && (
              <>
                <h2 className="auth-title">Sign In</h2>
                <p className="auth-subtitle">Access your patient portal</p>

                {error && <div className="auth-error-banner">{error}</div>}
                {success && <div className="auth-success-banner">{success}</div>}

                <form className="auth-form-styled" onSubmit={handleSubmit}>
                  <div className="input-group-styled">
                    <label htmlFor="login-email">Email Address</label>
                    <div className="input-with-icon">
                      <i className="fas fa-envelope icon-left"></i>
                      <input 
                        id="login-email"
                        type="email" 
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="input-group-styled">
                    <div className="auth-pass-label-row">
                      <label htmlFor="login-password">Password</label>
                      <button 
                        type="button" 
                        className="auth-forgot-link-btn"
                        onClick={() => {
                          setError('');
                          setSuccess('');
                          setForgotEmail(email);
                          setView('forgot-email');
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="input-with-icon">
                      <i className="fas fa-lock icon-left"></i>
                      <input 
                        id="login-password"
                        type="password" 
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner"></span> : null}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="auth-footer-styled">
                  Don't have an account? <Link to="/signup" className="auth-link-styled">Sign up</Link>
                </div>
              </>
            )}

            {/* ════ VIEW 2: FORGOT PASSWORD - STEP 1: ENTER EMAIL ════ */}
            {view === 'forgot-email' && (
              <>
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your email to receive a 6-digit verification code</p>

                {error && <div className="auth-error-banner">{error}</div>}
                {success && <div className="auth-success-banner">{success}</div>}

                <form className="auth-form-styled" onSubmit={handleSendResetCode}>
                  <div className="input-group-styled">
                    <label htmlFor="forgot-email-input">Registered Email Address</label>
                    <div className="input-with-icon">
                      <i className="fas fa-envelope icon-left"></i>
                      <input 
                        id="forgot-email-input"
                        type="email" 
                        placeholder="your.email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner"></span> : null}
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>

                <div className="auth-footer-styled">
                  <button 
                    type="button" 
                    className="auth-back-link" 
                    onClick={() => { setError(''); setSuccess(''); setView('login'); }}
                  >
                    ← Return to Sign In
                  </button>
                </div>
              </>
            )}

            {/* ════ VIEW 3: FORGOT PASSWORD - STEP 2: ENTER CODE & NEW PASSWORD ════ */}
            {view === 'forgot-code' && (
              <>
                <h2 className="auth-title">Set New Password</h2>
                <p className="auth-subtitle">
                  We sent a 6-digit code to <strong>{forgotEmail}</strong>
                </p>

                {error && <div className="auth-error-banner">{error}</div>}
                {success && <div className="auth-success-banner">{success}</div>}

                <form className="auth-form-styled" onSubmit={handleResetPassword}>
                  <div className="input-group-styled">
                    <label htmlFor="otp-input">6-Digit Verification Code</label>
                    <div className="input-with-icon">
                      <i className="fas fa-key icon-left"></i>
                      <input 
                        id="otp-input"
                        type="text" 
                        maxLength={6}
                        placeholder="123456"
                        className="auth-otp-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        required
                      />
                    </div>
                    <div className="auth-resend-row">
                      <span className="auth-resend-info">Didn't receive code?</span>
                      {resendCooldown > 0 ? (
                        <span className="auth-timer-chip">Resend in {resendCooldown}s</span>
                      ) : (
                        <button 
                          type="button" 
                          className="auth-resend-btn"
                          onClick={handleSendResetCode}
                          disabled={loading}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="input-group-styled">
                    <label htmlFor="new-password">New Password</label>
                    <div className="input-with-icon">
                      <i className="fas fa-lock icon-left"></i>
                      <input 
                        id="new-password"
                        type="password" 
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group-styled">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <div className="input-with-icon">
                      <i className="fas fa-shield-alt icon-left"></i>
                      <input 
                        id="confirm-password"
                        type="password" 
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? <span className="auth-spinner"></span> : null}
                    {loading ? 'Updating Password...' : 'Save Password & Sign In'}
                  </button>
                </form>

                <div className="auth-footer-styled">
                  <button 
                    type="button" 
                    className="auth-back-link" 
                    onClick={() => { setError(''); setSuccess(''); setView('login'); }}
                  >
                    ← Return to Sign In
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
