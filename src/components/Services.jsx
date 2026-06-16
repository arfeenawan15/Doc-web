import { useState } from 'react';
import { SERVICES } from '../data';
import { useInView } from '../hooks';
import './Services.css';

function ServiceModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal-content" onClick={e => e.stopPropagation()}>
        <button className="service-modal-close" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
        <div className="service-modal-image-wrap">
          <img src={service.image} alt={service.title} className="service-modal-img" />
          <div className="service-modal-icon">
            <i className={service.icon} />
          </div>
        </div>
        <div className="service-modal-body">
          <h3 className="service-modal-title">{service.title}</h3>
          <p className="service-modal-desc">{service.desc}</p>
          
          <div className="service-modal-details">
            <h4>About this Service</h4>
            <p>{service.details}</p>
          </div>
          
          <div className="service-modal-actions">
            <a href="#appointment" className="btn-primary" onClick={(e) => {
               e.preventDefault();
               onClose();
               document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Book Appointment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, desc, image, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`service-card reveal ${inView ? 'visible' : ''} ${hovered ? 'hovered' : ''}`}
      style={{ transitionDelay: `${index * 0.07}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="service-card-image-bg" style={{ backgroundImage: `url(${image})` }} />
      <div className="service-card-overlay" />
      
      <div className="service-card-content">
        <div className="service-icon">
          <i className={icon} />
        </div>
        <div className="service-title">{title}</div>
        <div className="service-desc">{desc}</div>
        <div className="service-learn-more">
          View Details <i className="fas fa-arrow-right" />
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section className="services-section" id="services">
      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <div className="section-tag">Our Services</div>
          <h2 className="section-title light">
            Specialized Pediatric<br />Surgical Services
          </h2>
          <p className="section-subtitle light">
            Comprehensive surgical care tailored for infants, children, and adolescents.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service, i) => (
            <ServiceCard 
              key={service.title} 
              {...service} 
              index={i} 
              onClick={() => setSelectedService(service)}
            />
          ))}
        </div>
      </div>
      
      {/* Detail Modal */}
      {selectedService && (
        <ServiceModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </section>
  );
}
