import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleLogoClick = (e) => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      e.preventDefault();
      window.open('/admin', '_blank', 'noopener,noreferrer');
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1200);

    scrollTo(e, '#home');
  };

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
          
          {user ? (
            <>
              <li>
                <Link to="/patient-dashboard" className="nav-user-name" onClick={() => setOpen(false)}>
                  Hi, {user.name.split(' ')[0]}
                </Link>
              </li>
              <li>
                <button onClick={() => { logout(); setOpen(false); }} className="nav-btn nav-logout">
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
