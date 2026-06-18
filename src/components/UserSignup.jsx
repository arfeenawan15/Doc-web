import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserAuth.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function UserSignup() {
  const [name, setName] = useState('');
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
    if (!name || !email || !password) {
      return setError('Please fill all fields.');
    }
    
    if (!validateEmail(email)) {
      return setError('Please enter a valid email address.');
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (data.success) {
        login({ ...data.user, token: data.token });
        navigate('/');
      } else {
        setError(data.message || 'Signup failed.');
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
            <h2>Dr. Waqas Ahmad Awan</h2>
            <p className="brand-subtitle">Pediatric Surgeon</p>
            <p className="brand-description">
              Join our patient portal to seamlessly book appointments, manage your consultations, and receive dedicated medical support.
            </p>
          </div>
          <div className="brand-decor-circle"></div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <div className="auth-form-inner">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join to easily book and manage appointments</p>

            {error && <div className="auth-error-banner">{error}</div>}

            <form className="auth-form-styled" onSubmit={handleSubmit}>
              <div className="input-group-styled">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <i className="fas fa-user icon-left"></i>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="auth-footer-styled">
              Already have an account? <Link to="/login" className="auth-link-styled">Sign in</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
