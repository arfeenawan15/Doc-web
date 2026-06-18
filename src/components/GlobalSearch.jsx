import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES, HOSPITALS, NAV_LINKS } from '../data';
import './GlobalSearch.css';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      setQuery('');
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  // Handle Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const newResults = [];

    // 1. Search Services
    SERVICES.forEach(service => {
      if (service.title.toLowerCase().includes(lowerQuery) || service.desc.toLowerCase().includes(lowerQuery)) {
        newResults.push({
          id: `service-${service.title}`,
          title: service.title,
          desc: service.desc.substring(0, 60) + '...',
          icon: service.icon,
          type: 'Service',
          action: () => handleScroll('#services')
        });
      }
    });

    // 2. Search Hospitals
    Object.values(HOSPITALS).forEach(hosp => {
      if (hosp.name.toLowerCase().includes(lowerQuery) || hosp.address.toLowerCase().includes(lowerQuery)) {
        newResults.push({
          id: `hosp-${hosp.key}`,
          title: hosp.name,
          desc: hosp.address,
          icon: 'fas fa-hospital',
          type: 'Location',
          action: () => handleScroll('#locations')
        });
      }
    });

    // 3. Search Navigation Links
    NAV_LINKS.forEach(link => {
      if (link.label.toLowerCase().includes(lowerQuery)) {
        newResults.push({
          id: `nav-${link.label}`,
          title: link.label,
          desc: `Go to ${link.label} section`,
          icon: 'fas fa-link',
          type: 'Navigation',
          action: () => handleScroll(link.href)
        });
      }
    });

    // 4. Extra Features
    const extras = [
      { title: 'Admin Portal', desc: 'Manage application', path: '/admin', icon: 'fas fa-user-shield' },
      { title: 'Login / Signup', desc: 'Patient account access', path: '/login', icon: 'fas fa-sign-in-alt' },
      { title: 'Book Appointment', desc: 'Schedule a visit', hash: '#appointment', icon: 'fas fa-calendar-check' }
    ];

    extras.forEach(extra => {
      if (extra.title.toLowerCase().includes(lowerQuery) || extra.desc.toLowerCase().includes(lowerQuery)) {
        newResults.push({
          id: `extra-${extra.title}`,
          title: extra.title,
          desc: extra.desc,
          icon: extra.icon,
          type: 'Action',
          action: () => extra.path ? handleNavigate(extra.path) : handleScroll(extra.hash)
        });
      }
    });

    setResults(newResults);
    setSelectedIndex(0);
  }, [query]);

  const handleScroll = (hash) => {
    onClose();
    navigate('/');
    setTimeout(() => {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      results[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <i className="fas fa-search search-icon-input"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search services, locations, or actions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          <button className="search-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {query && (
          <div className="search-results">
            {results.length > 0 ? (
              <ul className="search-list">
                {results.map((result, index) => (
                  <li 
                    key={result.id} 
                    className={`search-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={result.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="search-item-icon">
                      <i className={result.icon}></i>
                    </div>
                    <div className="search-item-content">
                      <div className="search-item-title">{result.title}</div>
                      <div className="search-item-desc">{result.desc}</div>
                    </div>
                    <div className="search-item-type">{result.type}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search-no-results">
                <i className="fas fa-search-minus"></i>
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
        )}
        
        {!query && (
          <div className="search-hints">
            <p className="search-hint-title">Quick Searches</p>
            <div className="search-hint-tags">
              <span onClick={() => setQuery('VP Shunting')}>VP Shunting</span>
              <span onClick={() => setQuery('Multan')}>Multan Clinic</span>
              <span onClick={() => setQuery('Appointment')}>Book Appointment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
