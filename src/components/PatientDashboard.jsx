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

  return (
    <div className="pd-root">
      <SEO title="My Dashboard | Dr. Waqas Ahmad Awan" noIndex />
      <Navbar />
      
      <div className="pd-header">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Manage your appointments and medical records</p>
      </div>

      <div className="pd-content">
        <h2 className="pd-section-title">
          <i className="fas fa-calendar-check"></i> My Appointments
        </h2>

        {loading ? (
          <div className="pd-loading">
            <div className="pd-spinner"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="pd-empty">
            <i className="fas fa-notes-medical"></i>
            <h3>No Appointments Found</h3>
            <p>You don't have any past or upcoming appointments.</p>
            <Link to="/#appointment" className="pd-btn-book">Book an Appointment</Link>
          </div>
        ) : (
          <div className="pd-grid">
            {appointments.map(apt => (
              <div className="pd-card" key={apt._id}>
                <div className="pd-card-header">
                  <div>
                    <div className="pd-hospital">{apt.hospital}</div>
                    <div className="pd-service">{apt.service || "General Consultation"}</div>
                  </div>
                  <span className={`pd-badge ${apt.status}`}>{apt.status}</span>
                </div>
                
                <div className="pd-details">
                  <p><i className="fas fa-user"></i> <strong>Patient:</strong> {apt.patientName} ({apt.age} years old)</p>
                  <p><i className="fas fa-calendar-day"></i> <strong>Schedule:</strong> {fmtDate(apt.date)} at {apt.time}</p>
                  <p><i className="fas fa-hospital"></i> <strong>Location:</strong> {apt.hospital}</p>
                </div>

                {apt.concern && (
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Stated Concern:</strong>
                    <span style={{ color: '#334155', fontStyle: 'italic' }}>“{apt.concern}”</span>
                  </div>
                )}

                {apt.doctorNotes ? (
                  <div style={{ background: '#f0fdfa', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, border: '1px solid #ccfbf1' }}>
                    <strong style={{ color: '#0f766e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <i className="fas fa-user-md" /> Doctor's Clinical Advice &amp; Prescription:
                    </strong>
                    <p style={{ margin: 0, color: '#134e4a', fontWeight: 600 }}>{apt.doctorNotes}</p>
                  </div>
                ) : (
                  <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 14, border: '1px solid #fde68a' }}>
                    <strong>Visit Guidelines:</strong> Please arrive 10-15 minutes early with any previous medical/ultrasound scans.
                  </div>
                )}

                <div className="pd-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <a
                    href={`https://wa.me/923318034846?text=${encodeURIComponent(`Hello Dr. Waqas, I am ${user.name} regarding appointment for ${apt.patientName} on ${apt.date}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#16a34a', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp Clinic Team
                  </a>

                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button 
                      className="pd-btn-cancel" 
                      onClick={() => handleCancel(apt._id)}
                    >
                      Cancel Booking
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
