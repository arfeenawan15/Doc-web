import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR, STATS, EDUCATION, SERVICES, HOSPITALS } from '../data';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import AppointmentForm from './AppointmentForm';
import './MobileWebsiteView.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function MobileWebsiteView() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { hospitals: siteHospitals, services: siteServices } = useSite();

  // Active Bottom Tab: 'home' | 'services' | 'book' | 'hospitals' | 'records'
  const [activeTab, setActiveTab] = useState('home');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

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
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  // Pre-selected hospital for booking tab
  const [selectedHospital, setSelectedHospital] = useState('');

  // Live Clinic Status helper based on current day
  const getClinicStatus = () => {
    const day = currentTime.getDay(); // 0 = Sun, 4 = Thu, 5 = Fri, 6 = Sat
    if (day === 0) {
      return {
        badge: 'CLINIC OPEN TODAY',
        badgeClass: 'live-now',
        title: 'Al Manzoor Hospital (Mian Channu)',
        time: 'Today: 11:00 AM – 04:00 PM',
        subtext: 'Direct consultations & pediatric surgical reviews available today.',
        hospKey: 'almanzoor',
        btnText: 'Book Today’s Consultation',
      };
    } else if (day >= 4 && day <= 6) {
      return {
        badge: 'CLINIC OPEN THIS EVENING',
        badgeClass: 'live-now',
        title: 'Sughran Wazir Medical Complex (Multan)',
        time: 'Thu – Sat: 06:00 PM – 09:00 PM',
        subtext: 'Evening clinic slots open for children, infants & newborns.',
        hospKey: 'sughran',
        btnText: 'Book Evening Consultation',
      };
    } else {
      return {
        badge: 'UPCOMING CLINIC: THURSDAY',
        badgeClass: 'upcoming',
        title: 'Sughran Wazir Medical Complex (Multan)',
        time: 'Thu – Sat: 06:00 PM – 09:00 PM · Sun: Mian Channu',
        subtext: 'Advance booking open. Sunday clinic at Mian Channu also available.',
        hospKey: 'sughran',
        btnText: 'Schedule Advance Slot',
      };
    }
  };

  const handleSelectHospitalAndBook = (hospKey) => {
    setSelectedHospital(hospKey || '');
    setActiveTab('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecialty = (label) => {
    setServiceSearch(label);
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (!window.confirm('Are you sure you want to cancel this consultation booking?')) return;
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
        setAuthError(data.message || 'Invalid credentials.');
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
        setAuthError(data.message || 'Registration failed.');
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
        setAuthError(data.message || 'Failed to dispatch code.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
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
  const allServices = (siteServices && siteServices.length > 0) ? siteServices : SERVICES;
  const filteredServices = allServices.filter(s => {
    const matchesSearch = !serviceSearch.trim() || 
      (s.title || '').toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.desc || '').toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="mwa-root">

      {/* ── Fixed App Header Bar (Theme: Midnight Slate & Medical Teal) ── */}
      <header className="mwa-top-bar">
        <div className="mwa-brand-left" onClick={handleBrandTap}>
          <div className="mwa-avatar-box">
            <img src="/assets/logo.png" alt="Dr. Waqas" className="mwa-avatar-img" />
            <span className="mwa-online-pulse" title="Clinic Online"></span>
          </div>
          <div className="mwa-brand-text">
            <span className="mwa-brand-name">Dr. Waqas Ahmad Awan</span>
            <span className="mwa-brand-role">Child Specialist &amp; Pediatric Surgeon</span>
          </div>
        </div>

        <div className="mwa-header-actions">
          <button 
            className="mwa-head-book-btn"
            onClick={() => {
              setActiveTab('book');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Book Appointment"
          >
            <i className="fas fa-calendar-check"></i>
            <span>Book Now</span>
          </button>
        </div>
      </header>

      {/* ── Main App Feed Panes ── */}
      <main className="mwa-main-canvas">

        {/* ════ TAB 1: HOME FEED (WIDGET-BASED NATIVE MOBILE APP DASHBOARD) ════ */}
        {activeTab === 'home' && (
          <div className="mwa-feed-pane">

            {/* WIDGET 1: Doctor Profile Highlight Card (Hero Glassmorphism) */}
            <div className="mwa-hero-theme-card">
              <div className="mwa-hero-overlay"></div>
              <div className="mwa-hero-glow"></div>

              {/* Round WhatsApp Action in Corner */}
              <a 
                href="https://wa.me/923318034846?text=Hello%20Dr.%20Waqas%2C%20I%20would%20like%20to%20consult%20regarding%20my%20child." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mwa-hero-corner-wa"
                title="Chat with Dr. Waqas on WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>

              <div className="mwa-hero-content">
                <div className="mwa-hero-badge">
                  ✦ Pediatric Surgeon &amp; Child Health Specialist
                </div>

                <div className="mwa-hero-profile-row">
                  <div className="mwa-hero-profile-info">
                    <h1 className="mwa-hero-title">
                      Dr. Waqas <span className="mwa-name-gold">Ahmad Awan</span>
                    </h1>
                    <p className="mwa-hero-credentials">
                      MBBS · FCPS Pediatric Surgery (Children's Hospital Multan)
                    </p>
                    <div className="mwa-hero-trust-chips">
                      <span className="mwa-trust-chip"><i className="fas fa-award"></i> 8+ Yrs Exp</span>
                      <span className="mwa-trust-chip"><i className="fas fa-stethoscope"></i> 1000+ Surgeries</span>
                    </div>
                  </div>

                  <div className="mwa-hero-avatar-wrap">
                    <img src="/assets/pic1.png" alt="Dr. Waqas Ahmad Awan" className="mwa-hero-avatar-img" />
                    <span className="mwa-hero-online-dot" title="Available for Consultations"></span>
                  </div>
                </div>

                <p className="mwa-hero-short-bio">
                  Providing expert, compassionate surgical and medical care tailored exclusively for newborns, infants, and growing children at Al Manzoor Hospital Mian Channu and Multan.
                </p>

                {/* Direct Action Buttons Inside Hero */}
                <div className="mwa-hero-actions-row">
                  <button 
                    className="mwa-hero-btn-book"
                    onClick={() => handleSelectHospitalAndBook('')}
                  >
                    <i className="fas fa-calendar-check"></i>
                    <span>Book Appointment</span>
                  </button>
                  <a 
                    href="https://wa.me/923318034846?text=Hello%20Dr.%20Waqas%2C%20I%20would%20like%20to%20consult%20regarding%20my%20child." 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mwa-hero-btn-wa"
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Smart Real-Time Clinic Status Widget */}
            {(() => {
              const status = getClinicStatus();
              return (
                <div className="mwa-smart-status-widget">
                  <div className="mwa-ssw-header">
                    <div className={`mwa-ssw-badge ${status.badgeClass}`}>
                      <span className="mwa-ssw-dot"></span>
                      <span>{status.badge}</span>
                    </div>
                    <span className="mwa-ssw-tag">Live Timing</span>
                  </div>
                  <div className="mwa-ssw-body">
                    <h4 className="mwa-ssw-hosp">{status.title}</h4>
                    <div className="mwa-ssw-time">
                      <i className="fas fa-clock"></i>
                      <span>{status.time}</span>
                    </div>
                    <p className="mwa-ssw-sub">{status.subtext}</p>
                    <button 
                      className="mwa-ssw-btn"
                      onClick={() => handleSelectHospitalAndBook(status.hospKey)}
                    >
                      <span>{status.btnText}</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* WIDGET 3: Core App Action Grid (2x2 Modular Widgets) */}
            <div className="mwa-action-grid-widget">
              <div 
                className="mwa-ag-card teal-card"
                onClick={() => handleSelectHospitalAndBook('')}
              >
                <div className="mwa-ag-icon teal">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="mwa-ag-text">
                  <h4>Book Visit</h4>
                  <p>Select clinic &amp; slot</p>
                </div>
                <i className="fas fa-chevron-right mwa-ag-arrow"></i>
              </div>

              <div 
                className="mwa-ag-card blue-card"
                onClick={() => { setActiveTab('hospitals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="mwa-ag-icon blue">
                  <i className="fas fa-hospital"></i>
                </div>
                <div className="mwa-ag-text">
                  <h4>Clinics</h4>
                  <p>Mian Channu &amp; Multan</p>
                </div>
                <i className="fas fa-chevron-right mwa-ag-arrow"></i>
              </div>

              <div 
                className="mwa-ag-card emerald-card"
                onClick={() => { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="mwa-ag-icon emerald">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <div className="mwa-ag-text">
                  <h4>Surgeries</h4>
                  <p>Pediatric care guide</p>
                </div>
                <i className="fas fa-chevron-right mwa-ag-arrow"></i>
              </div>

              <div 
                className="mwa-ag-card amber-card"
                onClick={() => { setActiveTab('records'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="mwa-ag-icon amber">
                  <i className="fas fa-notes-medical"></i>
                </div>
                <div className="mwa-ag-text">
                  <h4>Patient Portal</h4>
                  <p>Records &amp; advice</p>
                </div>
                <i className="fas fa-chevron-right mwa-ag-arrow"></i>
              </div>
            </div>

            {/* WIDGET 4: Hospital Branches Fast Selector Widget */}
            <div className="mwa-branches-card-widget">
              <div className="mwa-bcw-header">
                <div>
                  <span className="mwa-widget-label">PRACTICE LOCATIONS</span>
                  <h3 className="mwa-widget-title">Hospital Schedules</h3>
                </div>
                <button 
                  className="mwa-widget-link"
                  onClick={() => { setActiveTab('hospitals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  View Details →
                </button>
              </div>

              <div className="mwa-bcw-grid">
                {/* Branch 1: Al Manzoor */}
                <div 
                  className="mwa-bcw-branch"
                  onClick={() => handleSelectHospitalAndBook('almanzoor')}
                >
                  <div className="mwa-bcw-branch-top">
                    <span className="mwa-bcw-day-badge sunday">Sunday Only</span>
                    <span className="mwa-bcw-slot-pill">11 AM – 4 PM</span>
                  </div>
                  <h4 className="mwa-bcw-branch-name">Al Manzoor Hospital</h4>
                  <p className="mwa-bcw-branch-loc"><i className="fas fa-map-marker-alt"></i> Tulamba Road, Mian Channu</p>
                  <div className="mwa-bcw-book-link">
                    <span>Book Sunday Slot</span>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>

                {/* Branch 2: Sughran Wazir */}
                <div 
                  className="mwa-bcw-branch"
                  onClick={() => handleSelectHospitalAndBook('sughran')}
                >
                  <div className="mwa-bcw-branch-top">
                    <span className="mwa-bcw-day-badge multan">Thu – Sat</span>
                    <span className="mwa-bcw-slot-pill">6 PM – 9 PM</span>
                  </div>
                  <h4 className="mwa-bcw-branch-name">Sughran Wazir Complex</h4>
                  <p className="mwa-bcw-branch-loc"><i className="fas fa-map-marker-alt"></i> Syedan Wala Bypass, Multan Cantt</p>
                  <div className="mwa-bcw-book-link">
                    <span>Book Multan Slot</span>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 5: Pediatric Surgical Specialties (Horizontal Carousel Swiper) */}
            <div className="mwa-specialties-widget">
              <div className="mwa-sw-header">
                <div>
                  <span className="mwa-widget-label">PEDIATRIC EXPERTISE</span>
                  <h3 className="mwa-widget-title">Surgical Specializations</h3>
                </div>
                <button 
                  className="mwa-widget-link"
                  onClick={() => { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  All ({allServices.length}) →
                </button>
              </div>

              <div className="mwa-sw-reel">
                {[
                  { label: 'Neonatal', icon: 'fas fa-baby', sub: 'Newborn care' },
                  { label: 'Urology', icon: 'fas fa-stethoscope', sub: 'Kidney & bladder' },
                  { label: 'Hydrocephalus', icon: 'fas fa-brain', sub: 'VP Shunt' },
                  { label: 'Circumcision', icon: 'fas fa-band-aid', sub: 'Safe Plastibell' },
                  { label: 'Cleft Lip', icon: 'fas fa-smile', sub: 'Palate repair' },
                  { label: 'Hernia', icon: 'fas fa-notes-medical', sub: 'Inguinal repair' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="mwa-sw-item"
                    onClick={() => handleSelectSpecialty(item.label)}
                  >
                    <div className="mwa-sw-icon">
                      <i className={item.icon}></i>
                    </div>
                    <span className="mwa-sw-title">{item.label}</span>
                    <span className="mwa-sw-sub">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 6: 24/7 Pediatric Emergency Helpline Widget */}
            <div className="mwa-emergency-widget">
              <div className="mwa-ew-left">
                <div className="mwa-ew-icon-box">
                  <i className="fas fa-ambulance"></i>
                </div>
                <div className="mwa-ew-text">
                  <h4>24/7 Pediatric Emergency</h4>
                  <p>Immediate support for neonatal distress or acute pediatric conditions</p>
                </div>
              </div>
              <div className="mwa-ew-actions">
                <a href="tel:+923098683232" className="mwa-ew-call-btn" title="Call Emergency Line">
                  <i className="fas fa-phone-alt"></i>
                  <span>Call 0309 8683232</span>
                </a>
                <a 
                  href="https://wa.me/923318034846?text=EMERGENCY%3A%20Child%20Consultation%20Required" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mwa-ew-wa-btn"
                  title="WhatsApp Emergency"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span>Urgent WhatsApp</span>
                </a>
              </div>
            </div>

            {/* WIDGET 7: Patient Health Records Portal Card */}
            <div 
              className="mwa-patient-portal-widget"
              onClick={() => { setActiveTab('records'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="mwa-ppw-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="mwa-ppw-info">
                <h4>{user ? `Patient Records · ${user.name}` : 'Child Consultation Records'}</h4>
                <p>{user ? 'View scheduled consultations, doctor clinical notes, and post-op care' : 'Sign in to access your child’s appointments and review doctor advice'}</p>
              </div>
              <div className="mwa-ppw-action">
                <span>{user ? 'Open Portal' : 'Sign In'}</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>

            {/* WIDGET 8: Verified Clinical Statistics */}
            <div className="mwa-stats-widget">
              {STATS.map((st, i) => (
                <div key={i} className="mwa-sw-stat-box">
                  <span className="mwa-sw-num">{st.target}{st.suffix}</span>
                  <span className="mwa-sw-label">{st.label}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════ TAB 2: SERVICES ════ */}
        {activeTab === 'services' && (
          <div className="mwa-feed-pane">
            <div className="mwa-section-header">
              <span className="mwa-section-tag">CLINICAL SERVICES</span>
              <h2 className="mwa-section-title">Surgical Specializations</h2>
              <p className="mwa-section-desc">Comprehensive surgical and medical care for infants, toddlers, and children.</p>
            </div>

            {/* Search Input in Website Teal Style */}
            <div className="mwa-search-box">
              <i className="fas fa-search mwa-sbox-icon"></i>
              <input
                type="text"
                placeholder="Search procedures (e.g. Hernia, Testes, VP Shunt)..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
              />
              {serviceSearch && (
                <button className="mwa-sbox-clear" onClick={() => setServiceSearch('')}>✕</button>
              )}
            </div>

            {/* Services List Feed */}
            <div className="mwa-services-accordion">
              {filteredServices.length === 0 ? (
                <div className="mwa-empty-box">
                  <i className="fas fa-search"></i>
                  <p>No surgical procedures found for "{serviceSearch}".</p>
                  <button className="mwa-btn-primary-theme" onClick={() => setServiceSearch('')}>
                    Show All Services
                  </button>
                </div>
              ) : (
                filteredServices.map((svc, idx) => {
                  const sId = svc.id || idx;
                  const isExpanded = expandedServiceId === sId;

                  return (
                    <div key={sId} className={`mwa-accordion-card ${isExpanded ? 'active' : ''}`}>
                      <div className="mwa-acc-head" onClick={() => setExpandedServiceId(isExpanded ? null : sId)}>
                        <div className="mwa-acc-icon">
                          <i className={svc.icon || 'fas fa-stethoscope'}></i>
                        </div>
                        <div className="mwa-acc-title-wrap">
                          <h4>{svc.title}</h4>
                          <span>Specialized Pediatric Surgery</span>
                        </div>
                        <div className="mwa-acc-toggle">
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </div>
                      </div>

                      <p className="mwa-acc-summary">{svc.desc}</p>

                      {isExpanded && (
                        <div className="mwa-acc-details-drawer">
                          {svc.image && (
                            <img src={svc.image} alt={svc.title} className="mwa-acc-img" />
                          )}
                          {svc.details && (
                            <div className="mwa-acc-full-text">
                              <strong>Procedure Overview &amp; Care:</strong>
                              <p>{svc.details}</p>
                            </div>
                          )}
                          <button 
                            className="mwa-btn-primary-theme full"
                            onClick={() => setActiveTab('book')}
                          >
                            <i className="fas fa-calendar-check"></i> Book Consultation for {svc.title}
                          </button>
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
            <div className="mwa-section-header">
              <span className="mwa-section-tag">APPOINTMENT BOOKING</span>
              <h2 className="mwa-section-title">Schedule Consultation</h2>
              <p className="mwa-section-desc">Reserve your child's clinical slot at Al Manzoor Hospital Mian Channu or Multan.</p>
            </div>

            <div className="mwa-booking-form-wrapper">
              <AppointmentForm 
                initialHospital={selectedHospital}
                onSuccess={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            </div>
          </div>
        )}

        {/* ════ TAB 4: CLINICS & LOCATIONS ════ */}
        {activeTab === 'hospitals' && (
          <div className="mwa-feed-pane">
            <div className="mwa-section-header">
              <span className="mwa-section-tag">HOSPITAL BRANCHES</span>
              <h2 className="mwa-section-title">Practice Locations</h2>
              <p className="mwa-section-desc">Consultation timings and navigation for Al Manzoor Hospital and Sughran Wazir Medical Complex.</p>
            </div>

            {/* Mian Channu Location */}
            <div className="mwa-hospital-card primary-branch">
              <div className="mwa-hosp-top">
                <span className="mwa-hosp-pill sunday">
                  <i className="fas fa-circle live-dot"></i> Sunday Only
                </span>
                <span className="mwa-hosp-num">01</span>
              </div>
              <h3 className="mwa-hosp-name">Al Manzoor Hospital</h3>
              <p className="mwa-hosp-address">Tulamba Road, Mian Channu, Punjab</p>

              <div className="mwa-hosp-meta-box">
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-calendar-day"></i>
                  <span><strong>Day:</strong> Every Sunday</span>
                </div>
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-clock"></i>
                  <span><strong>Hours:</strong> 11:00 AM – 04:00 PM</span>
                </div>
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-phone-alt"></i>
                  <span><a href="tel:+923098683232">+92 309 8683232</a> / <a href="tel:+92652663232">+92 65 2663232</a></span>
                </div>
              </div>

              <div className="mwa-map-embed-box">
                <iframe
                  title="Al Manzoor Hospital Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3470.1!2d72.35277!3d30.45230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919355a4ad0a0ef%3A0xffefd788757db61a!2sAl%20Manzoor%20Hospital!5e0!3m2!1sen!2spk!4v1700000000000"
                  width="100%"
                  height="160"
                  style={{ border: 0, borderRadius: 10 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>

              <div className="mwa-hosp-actions">
                <a 
                  href="https://maps.google.com/?cid=17289175519676733035" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mwa-btn-map"
                >
                  <i className="fas fa-directions"></i> Google Maps
                </a>
                <button className="mwa-btn-hosp-book" onClick={() => handleSelectHospitalAndBook('almanzoor')}>
                  <i className="fas fa-calendar-check"></i> Book Sunday
                </button>
              </div>
            </div>

            {/* Multan Location */}
            <div className="mwa-hospital-card">
              <div className="mwa-hosp-top">
                <span className="mwa-hosp-pill multan">
                  <i className="fas fa-calendar-alt"></i> Thu – Sat
                </span>
                <span className="mwa-hosp-num">02</span>
              </div>
              <h3 className="mwa-hosp-name">Sughran Wazir Medical Complex</h3>
              <p className="mwa-hosp-address">Syedan Wala Bypass, Bosan Road, Multan Cantt</p>

              <div className="mwa-hosp-meta-box">
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-calendar-day"></i>
                  <span><strong>Days:</strong> Thursday – Saturday</span>
                </div>
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-clock"></i>
                  <span><strong>Hours:</strong> 06:00 PM – 09:00 PM</span>
                </div>
                <div className="mwa-hosp-meta-item">
                  <i className="fas fa-phone-alt"></i>
                  <span><a href="tel:+923023569088">+92 302 3569088</a></span>
                </div>
              </div>

              <div className="mwa-hosp-actions">
                <a 
                  href="https://maps.google.com/?q=Sughran+Wazir+Medical+Complex+Multan" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mwa-btn-map"
                >
                  <i className="fas fa-directions"></i> Google Maps
                </a>
                <button className="mwa-btn-hosp-book" onClick={() => handleSelectHospitalAndBook('sughran')}>
                  <i className="fas fa-calendar-check"></i> Book Multan
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ════ TAB 5: PATIENT RECORDS & PORTAL ════ */}
        {activeTab === 'records' && (
          <div className="mwa-feed-pane">
            <div className="mwa-section-header">
              <span className="mwa-section-tag">PATIENT HEALTH PORTAL</span>
              <h2 className="mwa-section-title">Consultation Records</h2>
            </div>

            {user ? (
              <div className="mwa-portal-auth-feed">
                {/* Profile Card */}
                <div className="mwa-portal-profile-card">
                  <div className="mwa-ppc-avatar">
                    {(user.name && user.name[0] ? user.name[0] : 'P').toUpperCase()}
                  </div>
                  <div className="mwa-ppc-meta">
                    <span className="mwa-ppc-verified"><i className="fas fa-check-circle"></i> Verified Patient</span>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                  <button className="mwa-ppc-logout" onClick={logout} title="Sign Out">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>

                <div className="mwa-records-header-row">
                  <h4>Your Booked Consultations ({userAppointments.length})</h4>
                  <button className="mwa-btn-refresh" onClick={fetchMyRecords}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>

                {recordsLoading ? (
                  <div className="mwa-empty-box">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading your appointments...</p>
                  </div>
                ) : userAppointments.length === 0 ? (
                  <div className="mwa-empty-box">
                    <i className="fas fa-notes-medical"></i>
                    <h4>No Appointments Registered</h4>
                    <p>You don't have any past or active appointments registered under your account.</p>
                    <button className="mwa-btn-primary-theme" onClick={() => setActiveTab('book')}>
                      Book Your Consultation
                    </button>
                  </div>
                ) : (
                  <div className="mwa-records-list">
                    {userAppointments.map(apt => (
                      <div key={apt._id} className="mwa-record-item-card">
                        <div className="mwa-ric-head">
                          <div>
                            <span className="mwa-ric-hosp">{apt.hospital}</span>
                            <div className="mwa-ric-service">{apt.service || 'General Consultation'}</div>
                          </div>
                          <span className={`mwa-ric-status ${apt.status}`}>
                            {apt.status === 'confirmed' && '✓ Confirmed'}
                            {apt.status === 'pending' && '🕒 Pending'}
                            {apt.status === 'cancelled' && '✕ Cancelled'}
                          </span>
                        </div>

                        <div className="mwa-ric-details">
                          <p><i className="fas fa-child"></i> <strong>Patient:</strong> {apt.patientName} ({apt.age} yrs)</p>
                          <p><i className="fas fa-calendar-alt"></i> <strong>Date &amp; Time:</strong> {fmtDate(apt.date)} at {apt.time}</p>
                        </div>

                        {apt.concern && (
                          <div className="mwa-ric-concern">
                            <span>Concern:</span> "{apt.concern}"
                          </div>
                        )}

                        {apt.doctorNotes && (
                          <div className="mwa-ric-doctor-advice">
                            <strong><i className="fas fa-user-md"></i> Doctor's Clinical Advice:</strong>
                            <p>{apt.doctorNotes}</p>
                          </div>
                        )}

                        <div className="mwa-ric-actions">
                          <a
                            href={`https://wa.me/923318034846?text=${encodeURIComponent(`Assalam-o-Alaikum Dr. Waqas, I am ${user.name} regarding appointment for ${apt.patientName}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mwa-btn-wa-link"
                          >
                            <i className="fab fa-whatsapp"></i> WhatsApp Team
                          </a>

                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <button className="mwa-btn-cancel-link" onClick={() => handleCancelBooking(apt._id)}>
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
              /* Non-authenticated portal login / signup card with Website Dark Atmosphere */
              <div className="mwa-portal-login-card">
                <div className="mwa-plc-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h3>Patient Health Portal</h3>
                <p>Sign in to view your child's appointment history, doctor clinical advice, and manage bookings.</p>

                {/* Segmented control */}
                <div className="mwa-segmented-tabs">
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
                    Register
                  </button>
                </div>

                {authError && <div className="mwa-auth-msg error">{authError}</div>}
                {authSuccess && <div className="mwa-auth-msg success">{authSuccess}</div>}

                {authMode === 'login' && (
                  <form onSubmit={handleMobileLogin} className="mwa-portal-form">
                    <div className="mwa-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-form-group">
                      <div className="mwa-pass-header">
                        <label>Password</label>
                        <button 
                          type="button" 
                          className="mwa-forgot-btn"
                          onClick={() => { setAuthMode('forgot'); setForgotStep(1); setAuthError(''); setAuthSuccess(''); }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="mwa-btn-primary-theme full" disabled={authLoading}>
                      {authLoading ? 'Signing in...' : 'Sign In to Patient Portal'}
                    </button>
                  </form>
                )}

                {authMode === 'signup' && (
                  <form onSubmit={handleMobileSignup} className="mwa-portal-form">
                    <div className="mwa-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Parent / Guardian Name"
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mwa-form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="mwa-btn-primary-theme full" disabled={authLoading}>
                      {authLoading ? 'Registering...' : 'Create Patient Account'}
                    </button>
                  </form>
                )}

                {authMode === 'forgot' && (
                  <div className="mwa-portal-form">
                    {forgotStep === 1 ? (
                      <form onSubmit={handleMobileForgotSend}>
                        <div className="mwa-form-group">
                          <label>Enter Account Email</label>
                          <input
                            type="email"
                            placeholder="your.email@example.com"
                            value={authEmail}
                            onChange={e => setAuthEmail(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="mwa-btn-primary-theme full" disabled={authLoading}>
                          {authLoading ? 'Sending...' : 'Send 6-Digit Code'}
                        </button>
                        <button 
                          type="button" 
                          className="mwa-btn-text-theme" 
                          onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                        >
                          ← Return to Sign In
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleMobileResetPass}>
                        <div className="mwa-form-group">
                          <label>6-Digit Verification Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            className="mwa-otp-input"
                            value={authOtp}
                            onChange={e => setAuthOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                          />
                        </div>
                        <div className="mwa-form-group">
                          <label>New Password</label>
                          <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={authNewPass}
                            onChange={e => setAuthNewPass(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mwa-form-group">
                          <label>Confirm Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={authConfirmPass}
                            onChange={e => setAuthConfirmPass(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="mwa-btn-primary-theme full" disabled={authLoading}>
                          {authLoading ? 'Updating...' : 'Save Password & Sign In'}
                        </button>
                        <button 
                          type="button" 
                          className="mwa-btn-text-theme" 
                          onClick={() => { setForgotStep(1); setAuthError(''); setAuthSuccess(''); }}
                        >
                          ← Change Email
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Portal Access */}
            <div className="mwa-admin-portal-link-box">
              <button onClick={() => navigate('/admin')} className="mwa-admin-link">
                <i className="fas fa-lock"></i> Doctor / Clinic Administration Login
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ── 4. Fixed Native Bottom Tab Bar (Dark Glassmorphism Theme) ── */}
      <nav className="mwa-bottom-tabbar">
        {[
          { key: 'home', label: 'Home', icon: 'fas fa-home' },
          { key: 'services', label: 'Services', icon: 'fas fa-stethoscope' },
          { key: 'book', label: 'Book Now', icon: 'fas fa-calendar-check', highlight: true },
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
