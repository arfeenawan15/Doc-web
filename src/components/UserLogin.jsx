import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserAuth.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill all fields.');
    }
    
    if (!validateEmail(email)) {
      return setError('Please enter a valid email address.');
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        login({ ...data.user, token: data.token });
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-container">
        
        {/* Left Side: Branding / Graphic */}
        <div className="auth-brand-side">
          <Link to="/" className="brand-back-nav">← Back to Home</Link>
          <div className="brand-content">
            <h2>Welcome Back</h2>
            <p className="brand-subtitle">Dr. Waqas Ahmad Awan</p>
            <p className="brand-description">
              Sign in to manage your appointments, view your history, and stay connected with our clinic securely.
            </p>
          </div>
          <div className="brand-decor-circle login-decor"></div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <div className="auth-form-inner">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Access your patient portal</p>

            {error && <div className="auth-error-banner">{error}</div>}

            <form className="auth-form-styled" onSubmit={handleSubmit}>
              <div className="input-group-styled">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope icon-left"></i>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="input-group-styled">
                <label>Password</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock icon-left"></i>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
          </div>
        </div>

      </div>
    </div>
  );
}
