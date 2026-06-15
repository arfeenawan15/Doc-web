import { useState } from 'react';
import { SERVICES } from '../data';
import { useInView } from '../hooks';
import './Services.css';

function ServiceCard({ icon, title, desc, index }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`service-card reveal ${inView ? 'visible' : ''} ${hovered ? 'hovered' : ''}`}
      style={{ transitionDelay: `${index * 0.07}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="service-icon">
        <i className={icon} />
      </div>
      <div className="service-title">{title}</div>
      <div className="service-desc">{desc}</div>
      <div className="service-learn-more">
        Learn More <i className="fas fa-arrow-right" />
      </div>
    </div>
  );
}

export default function Services() {
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
            <ServiceCard key={service.title} {...service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
