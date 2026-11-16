import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR, STATS, EDUCATION } from '../data';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import AppointmentForm from './AppointmentForm';
import './MobileWebsiteView.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function MobileWebsiteView() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { hospitals: siteHospitals, services: siteServices, settings } = useSite();

  // Active Bottom Tab: 'home' | 'services' | 'book' | 'hospitals' | 'records'
  const [activeTab, setActiveTab] = useState('home');

  // Triple-tap shortcut to open Admin panel
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleBrandTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      navigate('/admin');
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);
  };

  // Sync hash in URL with active tab
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('appointment') || hash.includes('book')) {
        setActiveTab('book');
      } else if (hash.includes('service')) {
        setActiveTab('services');
      } else if (hash.includes('location') || hash.includes('hospital')) {
        setActiveTab('hospitals');
      } else if (hash.includes('record') || hash.includes('patient')) {
        setActiveTab('records');
      }
    }
  }, []);

  // Services State
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  // Patient Records State (when user is logged in)
  const [userAppointments, setUserAppointments] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Patient Auth State (when user is not logged in on records tab)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authNewPass, setAuthNewPass] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  // Fetch Patient Appointments when on 'records' tab
  const fetchMyRecords = async () => {
    if (!user?.token) return;
    setRecordsLoading(true);
    try {
      const res = await fetch(`${API}/appointments/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUserAppointments(data.data);
      }
    } catch { /* silent */ }
    setRecordsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'records' && user?.token) {
      fetchMyRecords();
    }
  }, [activeTab, user]);

  // Cancel Appointment handler
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this consultation booking?')) return;
    try {
      const res = await fetch(`${API}/appointments/me/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUserAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      } else {
        alert(data.message || 'Failed to cancel appointment.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  // Auth Submit handlers for Mobile
  const handleMobileLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail.trim().toLowerCase(), password: authPassword })
      });
      const data = await res.json();
      if (data.success) {
        login({ ...data.user, token: data.token });
      } else {
        setAuthError(data.message || 'Login failed.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    }
    setAuthLoading(false);
  };

  const handleMobileSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName.trim(), email: authEmail.trim().toLowerCase(), password: authPassword })
      });
      const data = await res.json();
      if (data.success) {
        login({ ...data.user, token: data.token });
      } else {
        setAuthError(data.message || 'Signup failed.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    }
    setAuthLoading(false);
  };

  const handleMobileForgotSend = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSuccess(data.message);
        setForgotStep(2);
      } else {
        setAuthError(data.message || 'Failed to send OTP code.');
      }
    } catch {
      setAuthError('Connection error. Failed to send code.');
    }
    setAuthLoading(false);
  };

  const handleMobileResetPass = async (e) => {
    e.preventDefault();
    if (authNewPass !== authConfirmPass) {
      return setAuthError('Passwords do not match.');
    }
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail.trim().toLowerCase(),
          code: authOtp.trim(),
          newPassword: authNewPass
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSuccess('Password reset successfully! Logging you in...');
        setTimeout(() => {
          login({ ...data.user, token: data.token });
        }, 1200);
      } else {
        setAuthError(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    }
    setAuthLoading(false);
  };

  // Helper date format
  const fmtDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  // Filtered Services
  const servicesList = siteServices && siteServices.length > 0 ? siteServices : [];
  const filteredServices = servicesList.filter(s => {
    const matchesSearch = !serviceSearch.trim() || 
      (s.title || '').toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.desc || '').toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="mwa-root">
      
      {/* ── Fixed Native App Header Bar ── */}
      <header className="mwa-top-bar">
        <div className="mwa-brand-left" onClick={handleBrandTap}>
          <div className="mwa-avatar-box">
            <img src="/assets/logo.png" alt="Dr. Waqas" className="mwa-avatar-img" />
            <span className="mwa-online-pulse" title="Clinic Online"></span>
          </div>
          <div className="mwa-brand-text">
            <span className="mwa-brand-name">Dr. Waqas Ahmad</span>
            <span className="mwa-brand-role">Child Specialist &amp; Surgeon</span>
          </div>
        </div>

        <div className="mwa-header-actions">
          <a href="tel:+923098683232" className="mwa-header-icon-btn call" title="Call Clinic">
            <i className="fas fa-phone-alt"></i>
          </a>
          <a 
            href={`https://wa.me/923318034846?text=${encodeURIComponent("Assalam-o-Alaikum Dr. Waqas, I would like to inquire about consultation for my child.")}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mwa-header-icon-btn whatsapp" 
            title="Chat on WhatsApp"
          >
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </header>

      {/* ── Main App Content Panes ── */}
      <main className="mwa-main-canvas">

        {/* ════ TAB 1: HOME FEED ════ */}
        {activeTab === 'home' && (
          <div className="mwa-feed-pane">
            
            {/* Urgent Consultation Alert Pill */}
            <div className="mwa-alert-pill">
              <span className="mwa-alert-tag"><i className="fas fa-bolt"></i> Urgent Care</span>
              <span className="mwa-alert-txt">Pediatric surgery cases: <a href="tel:+923098683232">+92 309 8683232</a></span>
            </div>

            {/* Specialty Quick Bubbles (Horizontal Scroll) */}
            <div className="mwa-specialty-scroll">
              {[
                { label: 'Neonatal', icon: '👶', key: 'neonatal' },
                { label: 'Urology', icon: '🩺', key: 'urology' },
                { label: 'Hydrocephalus', icon: '💧', key: 'hydrocephalus' },
                { label: 'Circumcision', icon: '⚡', key: 'circumcision' },
                { label: 'Hernia', icon: '🩹', key: 'hernia' },
                { label: 'Cleft Lip', icon: '👄', key: 'cleft' },
              ].map(item => (
                <button
                  key={item.key}
                  className="mwa-bubble-item"
                  onClick={() => {
                    setServiceSearch(item.label);
                    setActiveTab('services');
                  }}
                >
                  <div className="mwa-bubble-circle">{item.icon}</div>
                  <span className="mwa-bubble-lbl">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Doctor Hero Touch Card */}
            <div className="mwa-hero-card">
              <div className="mwa-hero-card-inner">
                <div className="mwa-hero-doctor-badge">
                  <i className="fas fa-award"></i> Board Certified Pediatric Surgeon
                </div>
                <h1 className="mwa-hero-doctor-name">Dr. Waqas Ahmad Awan</h1>
                <p className="mwa-hero-doctor-creds">
                  MBBS · MS Pediatric Surgery<br />
                  Senior Pediatric Surgeon · Specialist in Neonatal &amp; Child Surgeries
                </p>
                <div className="mwa-hero-tags">
                  <span className="mwa-hero-tag"><i className="fas fa-user-md"></i> 8+ Years Exp</span>
                  <span className="mwa-hero-tag"><i className="fas fa-procedures"></i> 1,000+ Surgeries</span>
                  <span className="mwa-hero-tag"><i className="fas fa-star"></i> 5.0 Rated</span>
                </div>

                <div className="mwa-hero-dual-btns">
                  <button className="mwa-btn primary" onClick={() => setActiveTab('book')}>
                    <i className="fas fa-calendar-check"></i> Book Sunday Visit
                  </button>
                  <a href="tel:+923098683232" className="mwa-btn outline">
                    <i className="fas fa-phone-alt"></i> Call Clinic
                  </a>
                </div>
              </div>
            </div>

            {/* Next Clinic Live Schedule Card */}
            <div className="mwa-card schedule-card">
              <div className="mwa-card-header-row">
                <div className="mwa-card-title-group">
                  <span className="mwa-badge live"><i className="fas fa-circle"></i> Every Sunday</span>
                  <h3 className="mwa-card-title">Al Manzoor Hospital Mian Channu</h3>
                </div>
                <button className="mwa-link-btn" onClick={() => setActiveTab('hospitals')}>Details →</button>
              </div>
              <div className="mwa-time-strip">
                <div className="mwa-time-box">
                  <i className="fas fa-clock"></i>
                  <span>11:00 AM – 04:00 PM</span>
                </div>
                <div className="mwa-location-box">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Tulamba Road, Mian Channu</span>
                </div>
              </div>
              <button className="mwa-btn-full" onClick={() => setActiveTab('book')}>
                <i className="fas fa-calendar-plus"></i> Reserve Appointment Slot
              </button>
            </div>

            {/* Multan Clinic Card */}
            <div className="mwa-card schedule-card multan">
              <div className="mwa-card-header-row">
                <div className="mwa-card-title-group">
                  <span className="mwa-badge purple"><i className="fas fa-calendar-day"></i> Thu – Sat</span>
                  <h3 className="mwa-card-title">Sughran Wazir Medical Complex</h3>
                </div>
                <button className="mwa-link-btn" onClick={() => setActiveTab('hospitals')}>Details →</button>
              </div>
              <div className="mwa-time-strip">
                <div className="mwa-time-box">
                  <i className="fas fa-clock"></i>
                  <span>06:00 PM – 09:00 PM</span>
                </div>
                <div className="mwa-location-box">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Bosan Road, Multan Cantt</span>
                </div>
              </div>
            </div>

            {/* Quick Patient Portal Card */}
            <div className="mwa-portal-touch-card" onClick={() => setActiveTab('records')}>
              <div className="mwa-ptc-icon">
                <i className="fas fa-notes-medical"></i>
              </div>
              <div className="mwa-ptc-content">
                <h4>{user ? `Patient Records · ${user.name}` : 'Patient Records Portal'}</h4>
                <p>{user ? 'View scheduled visits, clinical notes & prescriptions' : 'Sign in to access your child\'s medical records'}</p>
              </div>
              <div className="mwa-ptc-arrow">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>

            {/* Common Surgeries Touch Carousel */}
            <div className="mwa-section-header">
              <h3>Specialized Surgeries</h3>
              <button onClick={() => setActiveTab('services')}>See All ({servicesList.length}) →</button>
            </div>

            <div className="mwa-quick-services-grid">
              {servicesList.slice(0, 4).map((s, idx) => (
                <div 
                  key={s.id || idx} 
                  className="mwa-service-touch-item"
                  onClick={() => {
                    setExpandedServiceId(s.id || idx);
                    setActiveTab('services');
                  }}
                >
                  <div className="mwa-svc-icon-box">
                    <i className={s.icon || 'fas fa-stethoscope'}></i>
                  </div>
                  <div className="mwa-svc-title">{s.title}</div>
                  <div className="mwa-svc-desc">{s.desc ? s.desc.slice(0, 75) + '...' : ''}</div>
                </div>
              ))}
            </div>

            {/* Direct Contact Banner */}
            <div className="mwa-contact-banner">
              <div className="mwa-cb-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h4>Have a Question About Your Child?</h4>
                <p>Speak directly with Dr. Waqas Ahmad Awan's clinic team</p>
              </div>
              <a href="tel:+923098683232" className="mwa-cb-btn">
                <i className="fas fa-phone-alt"></i> Call
              </a>
            </div>

          </div>
        )}

        {/* ════ TAB 2: SERVICES ════ */}
        {activeTab === 'services' && (
          <div className="mwa-feed-pane">
            <div className="mwa-pane-header">
              <h2>Pediatric Surgical Specialties</h2>
              <p>Specialized surgical care for newborns, infants, and children</p>
            </div>

            {/* Search Input */}
            <div className="mwa-search-wrap">
              <i className="fas fa-search mwa-search-icon"></i>
              <input
                type="text"
                placeholder="Search procedures, hernia, urology..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
              />
              {serviceSearch && (
                <button className="mwa-search-clear" onClick={() => setServiceSearch('')}>✕</button>
              )}
            </div>

            {/* Services List Feed */}
            <div className="mwa-services-feed">
              {filteredServices.length === 0 ? (
                <div className="mwa-empty-state">
                  <i className="fas fa-search"></i>
                  <p>No surgical procedures found matching "{serviceSearch}".</p>
                  <button className="mwa-btn secondary" onClick={() => setServiceSearch('')}>Clear Search</button>
                </div>
              ) : (
                filteredServices.map((svc, idx) => {
                  const sId = svc.id || idx;
                  const isExpanded = expandedServiceId === sId;

                  return (
                    <div key={sId} className={`mwa-service-card ${isExpanded ? 'expanded' : ''}`}>
                      <div className="mwa-service-card-top" onClick={() => setExpandedServiceId(isExpanded ? null : sId)}>
                        <div className="mwa-service-card-icon">
                          <i className={svc.icon || 'fas fa-stethoscope'}></i>
                        </div>
                        <div className="mwa-service-card-head">
                          <h4>{svc.title}</h4>
                          <span className="mwa-service-card-sub">Pediatric Surgery Specialty</span>
                        </div>
                        <div className="mwa-service-expand-icon">
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </div>
                      </div>

                      <p className="mwa-service-summary">{svc.desc}</p>

                      {isExpanded && (
                        <div className="mwa-service-details-drawer">
                          {svc.details && (
                            <div className="mwa-service-full-details">
                              <strong>Clinical Overview &amp; Treatment:</strong>
                              <p>{svc.details}</p>
                            </div>
                          )}
                          <div className="mwa-service-action-row">
                            <button 
                              className="mwa-btn primary full"
                              onClick={() => {
                                setActiveTab('book');
                              }}
                            >
                              <i className="fas fa-calendar-check"></i> Book Consultation for {svc.title}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ════ TAB 3: BOOK APPOINTMENT ════ */}
        {activeTab === 'book' && (
          <div className="mwa-feed-pane">
            <div className="mwa-pane-header">
              <h2>Book Pediatric Consultation</h2>
              <p>Schedule your child's clinical consultation with Dr. Waqas Ahmad Awan</p>
            </div>

            <div className="mwa-form-card">
              <AppointmentForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>

            <div className="mwa-booking-help-box">
              <i className="fas fa-phone-volume"></i>
              <div>
                <strong>Need immediate assistance with booking?</strong>
                <p>Call our clinic coordinator at <a href="tel:+923098683232">+92 309 8683232</a></p>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 4: HOSPITALS & LOCATIONS ════ */}
        {activeTab === 'hospitals' && (
          <div className="mwa-feed-pane">
            <div className="mwa-pane-header">
              <h2>Clinic Locations &amp; Timings</h2>
              <p>Dr. Waqas Ahmad Awan practices at two premier medical facilities</p>
            </div>

            {/* Al Manzoor Hospital Mian Channu */}
            <div className="mwa-hosp-card">
              <div className="mwa-hosp-badge green">
                <i className="fas fa-calendar-check"></i> Every Sunday Clinic
              </div>
              <h3 className="mwa-hosp-title">Al Manzoor Hospital</h3>
              <p className="mwa-hosp-addr">Tulamba Road, Mian Channu, Punjab</p>

              <div className="mwa-hosp-meta-list">
                <div className="mwa-hosp-meta-row">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Sunday Timings:</strong> 11:00 AM – 04:00 PM
                  </div>
                </div>
                <div className="mwa-hosp-meta-row">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <strong>Contact Phone:</strong> <a href="tel:+92652663232">+92 65 2663232</a> / <a href="tel:+923098683232">+92 309 8683232</a>
                  </div>
                </div>
              </div>

              <div className="mwa-hosp-actions">
                <a 
                  href="https://maps.google.com/?cid=17289175519676733035" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mwa-btn outline"
                >
                  <i className="fas fa-directions"></i> Get Directions
                </a>
                <button className="mwa-btn primary" onClick={() => setActiveTab('book')}>
                  <i className="fas fa-calendar-plus"></i> Book Sunday
                </button>
              </div>
            </div>

            {/* Sughran Wazir Hospital Multan */}
            <div className="mwa-hosp-card">
              <div className="mwa-hosp-badge purple">
                <i className="fas fa-calendar-alt"></i> Thu – Sat Clinic
              </div>
              <h3 className="mwa-hosp-title">Sughran Wazir Medical Complex</h3>
              <p className="mwa-hosp-addr">Syedan Wala Bypass, Bosan Road, Multan Cantt</p>

              <div className="mwa-hosp-meta-list">
                <div className="mwa-hosp-meta-row">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Consultation Timings:</strong> 06:00 PM – 09:00 PM
                  </div>
                </div>
                <div className="mwa-hosp-meta-row">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <strong>Contact Phone:</strong> <a href="tel:+923023569088">+92 302 3569088</a>
                  </div>
                </div>
              </div>

              <div className="mwa-hosp-actions">
                <a 
                  href="https://maps.google.com/?q=Sughran+Wazir+Medical+Complex+Multan" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mwa-btn outline"
                >
                  <i className="fas fa-directions"></i> Get Directions
                </a>
                <button className="mwa-btn primary" onClick={() => setActiveTab('book')}>
                  <i className="fas fa-calendar-plus"></i> Book Multan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 5: PATIENT RECORDS & PORTAL ════ */}
        {activeTab === 'records' && (
          <div className="mwa-feed-pane">
            
            {/* ── Case 1: Patient is Authenticated ── */}
            {user ? (
              <div className="mwa-patient-portal">
                <div className="mwa-portal-profile-bar">
                  <div className="mwa-portal-avatar">
                    {(user.name && user.name[0] ? user.name[0] : 'P').toUpperCase()}
                  </div>
                  <div className="mwa-portal-user-meta">
                    <span className="mwa-portal-badge">Verified Patient</span>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                  <button className="mwa-logout-btn" onClick={logout} title="Sign Out">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>

                <div className="mwa-portal-records-head">
                  <h3>Your Consultation Records ({userAppointments.length})</h3>
                  <button className="mwa-refresh-btn" onClick={fetchMyRecords}>
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>

                {recordsLoading ? (
                  <div className="mwa-empty-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading your appointments...</p>
                  </div>
                ) : userAppointments.length === 0 ? (
                  <div className="mwa-empty-state">
                    <i className="fas fa-calendar-times"></i>
                    <h4>No Appointments Registered</h4>
                    <p>You don't have any past or active appointments registered under your account.</p>
                    <button className="mwa-btn primary" onClick={() => setActiveTab('book')}>
                      Book Your First Consultation
                    </button>
                  </div>
                ) : (
                  <div className="mwa-patient-cards-list">
                    {userAppointments.map(apt => (
                      <div key={apt._id} className="mwa-patient-card">
                        <div className="mwa-pc-head">
                          <div>
                            <span className="mwa-pc-hosp">{apt.hospital}</span>
                            <div className="mwa-pc-service">{apt.service || 'General Consultation'}</div>
                          </div>
                          <span className={`mwa-pc-status ${apt.status}`}>
                            {apt.status === 'confirmed' && '✓ Confirmed'}
                            {apt.status === 'pending' && '🕒 Pending'}
                            {apt.status === 'cancelled' && '✕ Cancelled'}
                          </span>
                        </div>

                        <div className="mwa-pc-details">
                          <p><i className="fas fa-child"></i> <strong>Patient:</strong> {apt.patientName} ({apt.age} yrs)</p>
                          <p><i className="fas fa-calendar-alt"></i> <strong>Schedule:</strong> {fmtDate(apt.date)} at {apt.time}</p>
                        </div>

                        {apt.concern && (
                          <div className="mwa-pc-concern">
                            <span>Concern:</span> "{apt.concern}"
                          </div>
                        )}

                        {apt.doctorNotes && (
                          <div className="mwa-pc-doctor-notes">
                            <strong><i className="fas fa-user-md"></i> Doctor's Clinical Advice:</strong>
                            <p>{apt.doctorNotes}</p>
                          </div>
                        )}

                        <div className="mwa-pc-actions">
                          <a
                            href={`https://wa.me/923318034846?text=${encodeURIComponent(`Assalam-o-Alaikum Dr. Waqas, I am ${user.name} regarding appointment for ${apt.patientName}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mwa-btn-wa"
                          >
                            <i className="fab fa-whatsapp"></i> WhatsApp Team
                          </a>

                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <button className="mwa-btn-cancel" onClick={() => handleCancelBooking(apt._id)}>
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ── Case 2: Patient is NOT Authenticated (Login / Signup) ── */
              <div className="mwa-auth-container">
                <div className="mwa-auth-head">
                  <div className="mwa-auth-icon-circle">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h3>Patient Health Portal</h3>
                  <p>Sign in to view your child's appointment history, doctor clinical advice, and manage bookings.</p>
                </div>

                {/* Segmented Auth Switcher */}
                <div className="mwa-auth-segmented">
                  <button 
                    className={authMode === 'login' ? 'active' : ''} 
                    onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  >
                    Sign In
                  </button>
                  <button 
                    className={authMode === 'signup' ? 'active' : ''} 
                    onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
                  >
                    Create Account
                  </button>
                </div>

                {authError && <div className="mwa-auth-alert error">{authError}</div>}
                {authSuccess && <div className="mwa-auth-alert success">{authSuccess}</div>}

                {/* ── Login Form ── */}
                {authMode === 'login' && (
                  <form onSubmit={handleMobileLogin} className="mwa-auth-form">
                    <div className="mwa-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-field">
                      <div className="mwa-pass-row">
                        <label>Password</label>
                        <button 
                          type="button" 
                          className="mwa-link-btn"
                          onClick={() => { setAuthMode('forgot'); setForgotStep(1); setAuthError(''); setAuthSuccess(''); }}
                        >
                          Forgot?
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="mwa-btn primary full" disabled={authLoading}>
                      {authLoading ? 'Signing in...' : 'Sign In to Portal'}
                    </button>
                  </form>
                )}

                {/* ── Signup Form ── */}
                {authMode === 'signup' && (
                  <form onSubmit={handleMobileSignup} className="mwa-auth-form">
                    <div className="mwa-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Qazi Arfeen"
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-field">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="mwa-btn primary full" disabled={authLoading}>
                      {authLoading ? 'Creating account...' : 'Register Patient Account'}
                    </button>
                  </form>
                )}

                {/* ── Forgot Password OTP Form ── */}
                {authMode === 'forgot' && (
                  <div className="mwa-auth-form">
                    {forgotStep === 1 ? (
                      <form onSubmit={handleMobileForgotSend}>
                        <div className="mwa-field">
                          <label>Enter Registered Email</label>
                          <input
                            type="email"
                            placeholder="your.email@example.com"
                            value={authEmail}
                            onChange={e => setAuthEmail(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="mwa-btn primary full" disabled={authLoading}>
                          {authLoading ? 'Sending OTP Code...' : 'Send 6-Digit Code'}
                        </button>
                        <button 
                          type="button" 
                          className="mwa-btn text full" 
                          onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                        >
                          ← Back to Sign In
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleMobileResetPass}>
                        <div className="mwa-field">
                          <label>6-Digit Verification Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            className="mwa-otp-box"
                            value={authOtp}
                            onChange={e => setAuthOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                          />
                        </div>
                        <div className="mwa-field">
                          <label>New Password</label>
                          <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={authNewPass}
                            onChange={e => setAuthNewPass(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mwa-field">
                          <label>Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={authConfirmPass}
                            onChange={e => setAuthConfirmPass(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="mwa-btn primary full" disabled={authLoading}>
                          {authLoading ? 'Resetting Password...' : 'Save Password & Sign In'}
                        </button>
                        <button 
                          type="button" 
                          className="mwa-btn text full" 
                          onClick={() => { setForgotStep(1); setAuthError(''); setAuthSuccess(''); }}
                        >
                          ← Change Email Address
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Doctor Staff Portal Link */}
            <div className="mwa-staff-link-box">
              <button onClick={() => navigate('/admin')} className="mwa-staff-link">
                <i className="fas fa-lock"></i> Doctor / Clinic Administration Login
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ── Fixed Native Bottom Tab Bar ── */}
      <nav className="mwa-bottom-tabbar">
        {[
          { key: 'home', label: 'Home', icon: 'fas fa-home' },
          { key: 'services', label: 'Services', icon: 'fas fa-stethoscope' },
          { key: 'book', label: 'Book Now', icon: 'fas fa-calendar-plus', highlight: true },
          { key: 'hospitals', label: 'Clinics', icon: 'fas fa-hospital' },
          { key: 'records', label: 'Records', icon: 'fas fa-user-circle' },
        ].map(item => (
          <button
            key={item.key}
            className={`mwa-tab-item ${activeTab === item.key ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            onClick={() => {
              setActiveTab(item.key);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="mwa-tab-icon">
              <i className={item.icon}></i>
            </div>
            <span className="mwa-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
