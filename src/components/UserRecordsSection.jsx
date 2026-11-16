import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserRecordsSection.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function UserRecordsSection() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const fetchMyAppointments = async () => {
      try {
        const res = await fetch(`${API}/appointments/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAppointments(data.data);
        }
      } catch (err) {
        console.error("Failed to load user records:", err);
      }
      setLoading(false);
    };

    fetchMyAppointments();
  }, [user]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this consultation booking?")) return;

    try {
      const res = await fetch(`${API}/appointments/me/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      } else {
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch {
      alert("Error connecting to server.");
    }
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

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  // If user is not logged in, this section is completely hidden from the website
  if (!user) return null;

  return (
    <section className="urs-section" id="my-records">
      <div className="urs-container">
        {/* Section Header */}
        <div className="urs-header">
          <div className="urs-user-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Patient Portal · Logged in as {user.name}
          </div>
          <h2 className="urs-title">Your Patient Consultation Records</h2>
          <p className="urs-subtitle">
            Track your child's scheduled clinical appointments, doctor prescriptions, post-operative advice, and consultation status in real-time.
          </p>
        </div>

        {/* Quick Summary Bar */}
        <div className="urs-summary-bar">
          <div className="urs-summary-box">
            <div className="urs-summary-icon">
              <i className="fas fa-calendar-check" />
            </div>
            <div>
              <div className="urs-summary-val">{appointments.length}</div>
              <div className="urs-summary-label">Total Bookings Recorded</div>
            </div>
          </div>

          <div className="urs-summary-box">
            <div className="urs-summary-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <i className="fas fa-check-circle" />
            </div>
            <div>
              <div className="urs-summary-val">{confirmedCount}</div>
              <div className="urs-summary-label">Confirmed Consultations</div>
            </div>
          </div>

          <div className="urs-summary-box">
            <div className="urs-summary-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <i className="fas fa-clock" />
            </div>
            <div>
              <div className="urs-summary-val">{pendingCount}</div>
              <div className="urs-summary-label">Pending Doctor Review</div>
            </div>
          </div>
        </div>

        {/* Appointment Cards */}
        {loading ? (
          <div className="urs-empty-state">
            <i className="fas fa-spinner fa-spin" />
            <p>Retrieving your consultation records...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="urs-empty-state">
            <i className="fas fa-notes-medical" />
            <h3>No Appointments Recorded Yet</h3>
            <p>You have not booked any consultations under this account ({user.email}).</p>
            <a
              href="#appointment"
              className="urs-btn-primary"
              onClick={e => {
                e.preventDefault();
                document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Book Your First Consultation →
            </a>
          </div>
        ) : (
          <div className="urs-cards-grid">
            {appointments.map(apt => (
              <div className={`urs-card ${apt.status}`} key={apt._id}>
                <div>
                  <div className="urs-card-top">
                    <div>
                      <div className="urs-patient-name">{apt.patientName}</div>
                      <div className="urs-patient-age">{apt.age} years old · {apt.service}</div>
                    </div>
                    <span className={`urs-badge ${apt.status}`}>{apt.status}</span>
                  </div>

                  <div className="urs-meta-table">
                    <div className="urs-meta-row">
                      <span className="urs-meta-label">
                        <i className="fas fa-calendar-day" /> Date:
                      </span>
                      <span className="urs-meta-val highlight">{fmtDate(apt.date)}</span>
                    </div>
                    <div className="urs-meta-row">
                      <span className="urs-meta-label">
                        <i className="fas fa-clock" /> Time:
                      </span>
                      <span className="urs-meta-val">{apt.time}</span>
                    </div>
                    <div className="urs-meta-row">
                      <span className="urs-meta-label">
                        <i className="fas fa-hospital" /> Location:
                      </span>
                      <span className="urs-meta-val">{apt.hospital}</span>
                    </div>
                  </div>

                  {/* Doctor's Clinical Diagnosis / Prescription Notes */}
                  {apt.doctorNotes ? (
                    <div className="urs-doc-notes-box">
                      <div className="urs-doc-notes-head">
                        <i className="fas fa-user-md" /> Doctor's Clinical Advice:
                      </div>
                      <div className="urs-doc-notes-text">
                        “{apt.doctorNotes}”
                      </div>
                    </div>
                  ) : (
                    <div className="urs-guidelines-box">
                      <strong>Important Clinic Visit Instructions:</strong>
                      • Arrive 10–15 minutes before your scheduled appointment.<br />
                      • Bring child's prior ultrasound scans, blood tests, or surgical documents.
                    </div>
                  )}
                </div>

                <div className="urs-card-actions">
                  <a
                    href={`https://wa.me/923318034846?text=${encodeURIComponent(`Hello Dr. Waqas, I am ${user.name} regarding appointment for ${apt.patientName} on ${apt.date}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="urs-wa-link"
                  >
                    <i className="fab fa-whatsapp" /> Message Clinic Team
                  </a>

                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button
                      className="urs-cancel-btn"
                      onClick={() => handleCancelAppointment(apt._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="urs-footer-actions">
          <Link to="/patient-dashboard" className="urs-btn-primary">
            <i className="fas fa-tachometer-alt" /> Open Full Patient Portal
          </Link>
          <a
            href="#appointment"
            className="urs-btn-secondary"
            onClick={e => {
              e.preventDefault();
              document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <i className="fas fa-plus-circle" /> Book Another Appointment
          </a>
        </div>
      </div>
    </section>
  );
}
