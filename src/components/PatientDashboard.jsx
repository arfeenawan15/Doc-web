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
                  <p><i className="fas fa-user"></i> Patient: {apt.patientName} (Age {apt.age})</p>
                  <p><i className="fas fa-clock"></i> {fmtDate(apt.date)} at {apt.time}</p>
                </div>

                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <div className="pd-actions">
                    <button 
                      className="pd-btn-cancel" 
                      onClick={() => handleCancel(apt._id)}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
