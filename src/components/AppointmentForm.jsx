import { useState, useEffect } from 'react';
import { HOSPITALS, SERVICES_FORM } from '../data';
import './AppointmentForm.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

/* ── helpers ── */
function localStr(d) {
  return d.getFullYear()
    + '-' + String(d.getMonth() + 1).padStart(2, '0')
    + '-' + String(d.getDate()).padStart(2, '0');
}

function nextValid(allowedDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    if (allowedDays.includes(d.getDay())) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return null;
}

function isClinicDay(dateStr, allowedDays) {
  if (!dateStr) return false;
  const [y, m, day] = dateStr.split('-').map(Number);
  return allowedDays.includes(new Date(y, m - 1, day).getDay());
}

const EMPTY_FORM = {
  hospital: '', date: '', time: '',
  patientName: '', guardianName: '',
  phone: '', guardianEmail: '', age: '',
  service: '', concern: '',
};

export default function AppointmentForm({ onSuccess }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [dateWarn, setDateWarn] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* auto-fill next valid date when hospital changes */
  useEffect(() => {
    if (!form.hospital) return;
    const h = HOSPITALS[form.hospital];
    const nxt = nextValid(h.allowedDays);
    set('date', nxt ? localStr(nxt) : '');
    set('time', '');
    setDateWarn('');
  }, [form.hospital]);

  const handleDateChange = (val) => {
    set('date', val);
    if (!form.hospital) return;
    const h = HOSPITALS[form.hospital];
    if (val && !isClinicDay(val, h.allowedDays)) {
      setDateWarn(`⚠️ Please pick a ${h.dayNames.join(' / ')} for this hospital.`);
      setTimeout(() => {
        const nxt = nextValid(h.allowedDays);
        if (nxt) { set('date', localStr(nxt)); setDateWarn(''); }
      }, 1800);
    } else {
      setDateWarn('');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.hospital)    e.hospital    = 'Please select a hospital.';
    if (!form.patientName) e.patientName = 'Patient name is required.';
    if (!form.guardianName) e.guardianName = 'Guardian name is required.';
    if (!form.phone || !/^[+\d\s\-()\[\]]{7,20}$/.test(form.phone))
      e.phone = 'Enter a valid phone number.';
    if (!form.guardianEmail || !form.guardianEmail.includes('@'))
      e.guardianEmail = 'Enter a valid email address.';
    if (form.age === '' || +form.age < 0 || +form.age > 18)
      e.age = 'Age must be 0–18.';
    if (!form.date) e.date = 'Please select a date.';
    if (!form.time) e.time = 'Please select a time slot.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit → POST to MongoDB via backend ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const h = HOSPITALS[form.hospital];
    const payload = {
      hospitalKey:   form.hospital,
      hospital:      h.name,
      patientName:   form.patientName,
      guardianName:  form.guardianName,
      phone:         form.phone,
      guardianEmail: form.guardianEmail,
      age:           Number(form.age),
      date:          form.date,
      time:          form.time,
      service:       form.service,
      concern:       form.concern,
    };

    try {
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setForm(EMPTY_FORM);
        setErrors({});
        onSuccess && onSuccess(payload);
        /* reset success banner after 6 seconds */
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setErrors({ general: data.message || 'Submission failed. Try again.' });
      }

    } catch {
      setErrors({ general: '❌ An error occurred. Please try again later.' });
    }

    setLoading(false);
  };

  const hosp = form.hospital ? HOSPITALS[form.hospital] : null;

  /* ── Success Banner ── */
  if (submitted) {
    return (
      <div className="appointment-success">
        <div className="success-icon">✅</div>
        <h3>Appointment Booked!</h3>
        <p>Your appointment has been <strong>saved to the database</strong>. We will contact you shortly to confirm.</p>
        <button className="btn-secondary" onClick={() => setSubmitted(false)}>
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit} noValidate>

      {/* General Error Banner */}
      {errors.general && (
        <div className="form-error-banner">{errors.general}</div>
      )}

      {/* Hospital */}
      <div className="form-group full">
        <label>Select Hospital *</label>
        <select value={form.hospital} onChange={e => set('hospital', e.target.value)}>
          <option value="">Choose hospital</option>
          <option value="almanzoor">Al Manzoor Hospital – Mian Channu</option>
          <option value="sughran">Sughran Wazir Medical Complex – Multan</option>
        </select>
        {errors.hospital && <span className="field-error">{errors.hospital}</span>}
      </div>

      {/* Date + Time */}
      <div className="form-row">
        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={form.date}
            min={localStr(new Date())}
            onChange={e => handleDateChange(e.target.value)}
            disabled={!form.hospital}
          />
          {dateWarn   && <span className="field-warn">{dateWarn}</span>}
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label>Time Slot *</label>
          <select
            value={form.time}
            onChange={e => set('time', e.target.value)}
            disabled={!form.hospital}
          >
            <option value="">Select time</option>
            {hosp?.slots?.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.time && <span className="field-error">{errors.time}</span>}
        </div>
      </div>

      {/* Patient + Guardian Name */}
      <div className="form-row">
        <div className="form-group">
          <label>Patient Name *</label>
          <input
            placeholder="Full name of patient"
            value={form.patientName}
            onChange={e => set('patientName', e.target.value)}
          />
          {errors.patientName && <span className="field-error">{errors.patientName}</span>}
        </div>

        <div className="form-group">
          <label>Guardian Name *</label>
          <input
            placeholder="Father / Mother name"
            value={form.guardianName}
            onChange={e => set('guardianName', e.target.value)}
          />
          {errors.guardianName && <span className="field-error">{errors.guardianName}</span>}
        </div>
      </div>

      {/* Phone + Age */}
      <div className="form-row">
        <div className="form-group">
          <label>Phone *</label>
          <input
            placeholder="+92 300 0000000"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Patient Age * (0–18)</label>
          <input
            type="number"
            placeholder="e.g. 5"
            min={0} max={18}
            value={form.age}
            onChange={e => set('age', e.target.value)}
          />
          {errors.age && <span className="field-error">{errors.age}</span>}
        </div>
      </div>

      {/* Email */}
      <div className="form-group full">
        <label>Guardian Email *</label>
        <input
          type="email"
          placeholder="example@email.com"
          value={form.guardianEmail}
          onChange={e => set('guardianEmail', e.target.value)}
        />
        {errors.guardianEmail && <span className="field-error">{errors.guardianEmail}</span>}
      </div>

      {/* Service */}
      <div className="form-group full">
        <label>Service / Condition</label>
        <select value={form.service} onChange={e => set('service', e.target.value)}>
          <option value="">Select a service (optional)</option>
          {SERVICES_FORM.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Concern */}
      <div className="form-group full">
        <label>Additional Concern</label>
        <textarea
          rows={4}
          placeholder="Describe the patient's condition or any specific concern..."
          value={form.concern}
          onChange={e => set('concern', e.target.value)}
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? (
          <><span className="spinner" /> Saving to Database...</>
        ) : (
          '📅 Confirm Appointment'
        )}
      </button>

    </form>
  );
}