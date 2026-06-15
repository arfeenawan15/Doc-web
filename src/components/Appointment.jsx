import { useState } from 'react';
import AppointmentForm from './AppointmentForm';
import './Appointment.css';

export default function Appointment() {
  const [success, setSuccess] = useState(false);
  const [payload, setPayload] = useState(null);

  const handleSuccess = (data) => {
    setPayload(data);
    setSuccess(true);
  };

  const handleReset = () => {
    setSuccess(false);
    setPayload(null);
  };

  const fmtDate = (s) => {
    if (!s) return '';
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <section className="appointment-section" id="appointment">
      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <div className="section-tag">Book Appointment</div>
          <h2 className="section-title">Schedule Your<br />Consultation</h2>
        </div>

        <div className="appointment-wrap">
          {!success ? (
            <AppointmentForm onSuccess={handleSuccess} />
          ) : (
            <div className="form-success">
              <i className="fas fa-check-circle" />
              <h3>Appointment Requested!</h3>
              <p>
                Appointment for <strong>{payload?.patientName}</strong> at{' '}
                <strong>{payload?.hospital}</strong> on{' '}
                <strong>{fmtDate(payload?.date)}</strong> at{' '}
                <strong>{payload?.time}</strong> has been submitted.
                We will confirm shortly via phone or email.
              </p>
              <button className="btn-primary" onClick={handleReset}>
                Book Another
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
