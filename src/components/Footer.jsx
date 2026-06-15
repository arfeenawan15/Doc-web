import { Link } from 'react-router-dom';
import { DOCTOR, NAV_LINKS } from '../data';
import './Footer.css';
const scrollTo = (e, href) => {
  e.preventDefault();
  const id = href.replace('#', '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/assets/logo.png" alt="Dr. Waqas" className="footer-logo-img" />
            <div>
              <div className="footer-name">{DOCTOR.name}</div>
              <div className="footer-title">{DOCTOR.tagline}</div>
            </div>
          </div>
          <p className="footer-tagline">
            Compassionate surgical care for every child — with precision, dedication, and love.
          </p>
          <a
            href={`https://wa.me/${DOCTOR.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-wa-btn"
          >
            <i className="fab fa-whatsapp" /> WhatsApp Us
          </a>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} onClick={e => scrollTo(e, href)}>
              {label}
            </a>
          ))}
          <a href="#appointment" onClick={e => scrollTo(e, '#appointment')}>
            Book Appointment
          </a>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p><i className="fas fa-phone-alt" /> {DOCTOR.phone1}</p>
          <p><i className="fas fa-phone-alt" /> {DOCTOR.phone2}</p>
          <p>
            <i className="fab fa-whatsapp" />{' '}
            <a
              href={`https://wa.me/${DOCTOR.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              +92 3318034846
            </a>
          </p>
          <p>
            <i className="fas fa-map-marker-alt" /> Mian Channu &amp; Multan, Pakistan
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dr. Waqas Ahmad Awan. All rights reserved.</p>
        <p>
          Member · Association of Paediatric Surgeons of Pakistan |{' '}
          <Link to="/admin" className="admin-link">Admin Portal</Link>
        </p>
      </div>
    </footer>
  );
}
