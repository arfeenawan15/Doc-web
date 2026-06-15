import { useInView, useCounter } from '../hooks';
import { useState, useEffect } from 'react';
import './Hero.css';

function StatBadge({ target, suffix, label }) {
  const [ref, inView] = useInView(0.1);
  const count = useCounter(target, 1800, inView);
  return (
    <div ref={ref} className="hero-stat-badge">
      <span className="hero-stat-num">{count}{suffix}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

export default function Hero() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <section className="hero" id="home">
      {/* Emergency top strip */}
      <div className="hero-emergency-strip">
        <span className="hero-emergency-badge">
          <i className="fas fa-phone-volume" /> Emergency Consultation
        </span>
        <span className="hero-emergency-number">+92 331 8034846</span>
        <span className="hero-emergency-sep">|</span>
        <span className="hero-live-clock">
          <i className="fas fa-clock" /> {dateStr} &nbsp;—&nbsp; {timeStr}
        </span>
      </div>

      <div className="hero-bg-photo" />
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="hero-container section-container">
        {/* Left content */}
        <div className="hero-left">
          <div className="hero-badge">✦ Pediatric Surgical Expert</div>

          <h1 className="hero-title">
            Dr. Waqas<br />
            <span className="hero-name-highlight">Ahmad Awan</span>
          </h1>

          <p className="hero-subtitle">
            Specialist in Pediatric Surgery — Providing compassionate, expert surgical
            care for children with precision and dedication.
          </p>

          <div className="hero-creds">
            <div className="cred-item">
              <i className="fas fa-graduation-cap" />
              <span>MBBS – Sahiwal Teaching Hospital</span>
            </div>
            <div className="cred-item">
              <i className="fas fa-award" />
              <span>Pediatric Surgery – Children's Hospital & Institute of Child Health Multan</span>
            </div>
            <div className="cred-item">
              <i className="fas fa-stethoscope" />
              <span>8+ Years of dedicated pediatric surgical experience</span>
            </div>
          </div>

          <div className="hero-trust-pills">
            <span className="trust-pill"><i className="fas fa-shield-alt" /> Verified Specialist</span>
            <span className="trust-pill"><i className="fas fa-child" /> 500+ Cases</span>
            <span className="trust-pill"><i className="fas fa-star" /> Top Rated</span>
          </div>

          <div className="hero-actions">
            <a href="#appointment" className="btn-primary"
               onClick={e => { e.preventDefault(); document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <i className="fas fa-calendar-check" /> Book Appointment
            </a>
            <a href={`https://wa.me/923318034846?text=Hello%20Dr.%20Waqas%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
               target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
            <a href="#about" className="btn-outline"
               onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Learn More
            </a>
          </div>
        </div>

        {/* Right — doctor image with floating cards */}
        <div className="hero-image-wrap">
          <div className="hero-card">
            <div className="hero-card-icon"><i className="fas fa-child" /></div>
            <div className="hero-card-text">
              Trusted by<br /><strong>500+ Families</strong>
            </div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hero-card-icon" style={{ background: 'var(--gold)' }}>
              <i className="fas fa-award" />
            </div>
            <div className="hero-card-text">
              8+ Years<br /><strong>Experience</strong>
            </div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="hero-card-icon" style={{ background: '#8b5cf6' }}>
              <i className="fas fa-stethoscope" />
            </div>
            <div className="hero-card-text">
              Board<br /><strong>Certified</strong>
            </div>
          </div>
          <div className="hero-ring" />
          <div className="hero-ring ring2" />
          <div className="hero-avatar">
            <img src="/assets/pic1.png" alt="Dr. Waqas Ahmad Awan" />
          </div>
        </div>
      </div>
    
    </section>
  );
}
