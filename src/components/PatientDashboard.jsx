import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './SEO';
import './PatientDashboard.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API}/appointments/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setAppointments(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      }
      setLoading(false);
    };

    if (user?.token) {
      fetchAppointments();
    }
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const res = await fetch(`${API}/appointments/me/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(apt => apt._id === id ? { ...apt, status: 'cancelled' } : apt));
      } else {
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const fmtDate = (dStr) => {
    if (!dStr) return '';
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const confirmedCount = appointments.filter(a => a?.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a?.status === 'pending').length;

  return (
    <div className="pd-root">
      <SEO title="My Dashboard | Dr. Waqas Ahmad Awan" noIndex />
      <Navbar />
      
      {/* ── Modern Clinic Patient Greeting Hero ── */}
      <section className="pd-hero-section">
        <div className="pd-hero-container">
          <div className="pd-hero-main">
            <div className="pd-hero-trust-badge">
              <i className="fas fa-check-circle"></i> Verified Patient Account
            </div>
            <h1 className="pd-hero-title">
              Welcome, {user?.name?.split(' ')[0] || user?.name || 'Patient'}
            </h1>
            <p className="pd-hero-subtitle">
              Manage your child's clinical consultations, review doctor prescriptions and visit guidelines, and keep your medical records up to date.
            </p>
            <div className="pd-hero-quick-meta">
              <span><i className="fas fa-envelope"></i> {user?.email}</span>
              <span><i className="fas fa-clinic-medical"></i> Al Manzoor Hospital Mian Channu</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pd-metrics-row">
            <div className="pd-metric-card">
              <div className="pd-metric-num">{appointments.length}</div>
              <div className="pd-metric-lbl">Total Consultations</div>
            </div>
            <div className="pd-metric-card active">
              <div className="pd-metric-num">{confirmedCount}</div>
              <div className="pd-metric-lbl">Confirmed Visits</div>
            </div>
            {pendingCount > 0 && (
              <div className="pd-metric-card pending">
                <div className="pd-metric-num">{pendingCount}</div>
                <div className="pd-metric-lbl">Under Review</div>
              </div>
            )}
            <a 
              href="https://wa.me/923318034846" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="pd-metric-card wa-support"
              title="Message Dr. Waqas team on WhatsApp"
            >
              <div className="pd-metric-num"><i className="fab fa-whatsapp"></i></div>
              <div className="pd-metric-lbl">Clinic WhatsApp</div>
            </a>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Content ── */}
      <div className="pd-content">
        <div className="pd-section-header-bar">
          <div>
            <h2 className="pd-section-title">
              <i className="fas fa-calendar-alt"></i> Consultation Records
            </h2>
            <p className="pd-section-sub">
              Your registered appointment history and doctor clinical notes
            </p>
          </div>
          <div className="pd-header-action-group">
            <Link to="/" className="pd-btn-secondary">
              <i className="fas fa-home"></i> Main Website
            </Link>
            <Link to="/#appointment" className="pd-btn-primary">
              <i className="fas fa-calendar-plus"></i> Book Consultation
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="pd-loading">
            <div className="pd-spinner"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="pd-empty">
            <div className="pd-empty-icon-wrap">
              <i className="fas fa-notes-medical"></i>
            </div>
            <h3>No Consultations Booked Yet</h3>
            <p>You don't have any past or active appointments registered under your account. Schedule a consultation with Dr. Waqas Ahmad Awan at your preferred hospital branch.</p>
            <div className="pd-empty-actions">
              <Link to="/#appointment" className="pd-btn-primary">
                <i className="fas fa-calendar-plus"></i> Schedule an Appointment
              </Link>
              <Link to="/" className="pd-btn-secondary">
                <i className="fas fa-home"></i> Explore Clinic Website
              </Link>
            </div>
          </div>
        ) : (
          <div className="pd-grid">
            {appointments.map(apt => (
              <div className="pd-card" key={apt._id}>
                <div className="pd-card-header">
                  <div>
                    <div className="pd-hospital">
                      <i className="fas fa-map-marker-alt" style={{ marginRight: 6, color: '#0284c7' }}></i>
                      {apt.hospital}
                    </div>
                    <div className="pd-service">{apt.service || "General Consultation"}</div>
                  </div>
                  <span className={`pd-badge ${apt.status}`}>
                    {apt.status === 'confirmed' && '✓ Confirmed'}
                    {apt.status === 'pending' && '🕒 Pending Review'}
                    {apt.status === 'cancelled' && '✕ Cancelled'}
                  </span>
                </div>
                
                <div className="pd-details">
                  <p><i className="fas fa-user-circle"></i> <strong>Patient:</strong> {apt.patientName} ({apt.age} years old)</p>
                  <p><i className="fas fa-calendar-day"></i> <strong>Schedule:</strong> {fmtDate(apt.date)} at {apt.time}</p>
                  <p><i className="fas fa-user-shield"></i> <strong>Guardian:</strong> {apt.guardianName} ({apt.phone})</p>
                </div>

                {apt.concern && (
                  <div className="pd-concern-card">
                    <strong className="pd-concern-label">Stated Problem / Symptoms:</strong>
                    <p className="pd-concern-txt">“{apt.concern}”</p>
                  </div>
                )}

                {apt.doctorNotes ? (
                  <div className="pd-prescription-card">
                    <strong className="pd-prescription-label">
                      <i className="fas fa-user-md" /> Doctor's Clinical Advice &amp; Notes:
                    </strong>
                    <p className="pd-prescription-txt">{apt.doctorNotes}</p>
                  </div>
                ) : (
                  <div className="pd-guidelines-card">
                    <i className="fas fa-info-circle"></i>
                    <span><strong>Pre-Visit Guidelines:</strong> Please arrive 15 minutes before your time slot and bring any previous medical ultrasound or laboratory reports.</span>
                  </div>
                )}

                <div className="pd-card-footer">
                  <a
                    href={`https://wa.me/923318034846?text=${encodeURIComponent(`Hello Dr. Waqas Clinic, I am ${user.name} regarding appointment for ${apt.patientName} on ${apt.date}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-btn-wa"
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp Clinic
                  </a>

                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button 
                      className="pd-btn-cancel" 
                      onClick={() => handleCancel(apt._id)}
                    >
                      Cancel Consultation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
