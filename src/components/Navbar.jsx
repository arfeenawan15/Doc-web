import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../data';
import { useScrolled, useActiveSection } from '../hooks';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import './Navbar.css';

export default function Navbar() {
  const scrolled  = useScrolled(20);
  const activeId  = useActiveSection(NAV_LINKS.map(l => l.href.replace('#', '')));
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleLogoClick = (e) => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      e.preventDefault();
      // On mobile devices, window.open in a new tab can be blocked by browser popup blockers.
      // Navigate directly if on mobile or open in new tab if desktop:
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        window.location.href = '/admin';
      } else {
        window.open('/admin', '_blank', 'noopener,noreferrer');
      }
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);

    if (location.pathname !== '/') {
      e.preventDefault();
      setOpen(false);
      navigate('/');
      return;
    }

    scrollTo(e, '#home');
  };

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + (href === '#home' ? '' : href));
      return;
    }
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── Dedicated Patient Portal Navigation ── */
  if (location.pathname === '/patient-dashboard') {
    return (
      <nav className="navbar scrolled portal-nav-root" id="navbar">
        <div className="nav-container portal-nav-container">
          <Link to="/" className="nav-logo portal-logo">
            <span className="logo-icon">
              <img src="/assets/logo.png" alt="Dr. Waqas" className="logo-img" />
            </span>
            <div className="logo-text">
              <div className="logo-name">Dr. Waqas Ahmad Awan</div>
              <div className="logo-title">Pediatric Surgeon · Patient Portal</div>
            </div>
          </Link>

          <ul className={`nav-links portal-links ${open ? 'open' : ''}`}>
            <li>
              <Link to="/" className="nav-btn portal-btn-web" onClick={() => setOpen(false)}>
                <i className="fas fa-home" style={{ marginRight: 6 }}></i> Main Website
              </Link>
            </li>
            <li>
              <Link to="/#appointment" className="nav-btn nav-book-btn" onClick={() => setOpen(false)}>
                <i className="fas fa-calendar-plus" style={{ marginRight: 6 }}></i> Book Consultation
              </Link>
            </li>
            {user && (
              <li className="portal-user-tag">
                <span className="portal-user-avatar">
                  {user.name ? user.name[0].toUpperCase() : 'P'}
                </span>
                <span className="portal-user-name">{user.name?.split(' ')[0] || 'Patient'}</span>
              </li>
            )}
            <li>
              <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="nav-btn nav-logout">
                <i className="fas fa-sign-out-alt" style={{ marginRight: 6 }}></i> Logout
              </button>
            </li>
          </ul>

          <button
            className={`hamburger ${open ? 'open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(prev => !prev)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">

        {/* Logo (Triple-tap to open Admin on mobile/desktop) */}
        <a href="#home" className="nav-logo" onClick={handleLogoClick}>
          <span className="logo-icon">
            <img src="/assets/logo.png" alt="Dr. Waqas" className="logo-img" />
          </span>
          <div className="logo-text">
            <div className="logo-name">Dr. Waqas Ahmad Awan</div>
            <div className="logo-title">Pediatric Surgeon</div>
          </div>
        </a>

        {/* Desktop nav links */}
        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={activeId === href.replace('#', '') ? 'active-link' : ''}
                onClick={e => scrollTo(e, href)}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <button className="nav-search-icon" onClick={() => { setIsSearchOpen(true); setOpen(false); }}>
              <i className="fas fa-search"></i>
            </button>
          </li>
          
          {location.pathname !== '/' && (
            <li>
              <Link to="/" className="nav-btn" onClick={() => setOpen(false)} style={{ background: '#0284c7', color: '#fff', border: 'none' }}>
                <i className="fas fa-home" style={{ marginRight: 6 }}></i> Main Website
              </Link>
            </li>
          )}

          {user ? (
            <>
              <li>
                <Link to="/patient-dashboard" className="nav-btn nav-my-records" onClick={() => setOpen(false)} style={{ background: '#0d9488', color: '#fff', border: 'none' }}>
                  <i className="fas fa-notes-medical" style={{ marginRight: 6 }}></i> My Records
                </Link>
              </li>
              <li>
                <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="nav-btn nav-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="nav-btn nav-login" onClick={() => setOpen(false)}>
                Login / Signup
              </Link>
            </li>
          )}

          <li>
            <a
              href="#appointment"
              className="nav-btn nav-book-btn"
              onClick={e => scrollTo(e, '#appointment')}
            >
              Book Appointment
            </a>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`hamburger ${open ? 'open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setOpen(prev => !prev)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Search Overlay */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
