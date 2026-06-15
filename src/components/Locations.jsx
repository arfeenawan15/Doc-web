import { HOSPITALS } from '../data';
import { useInView } from '../hooks';
import './Locations.css';

function LocationCard({ hosp }) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className={`location-card reveal ${inView ? 'visible' : ''}`}>
      <div className="loc-header">
        <div className="loc-number">{hosp.number}</div>
        <div className="loc-badge">{hosp.badge}</div>
      </div>

      <h3 className="loc-name">{hosp.name}</h3>
      <p className="loc-city">
        <i className="fas fa-map-marker-alt" /> {hosp.address}
      </p>

      <div className="loc-timing">
        <div className="timing-row">
          <i className="fas fa-calendar-day" />
          <span><strong>{hosp.days}</strong></span>
        </div>
        <div className="timing-row">
          <i className="fas fa-clock" />
          <span>{hosp.hours}</span>
        </div>
      </div>

      <div className="loc-contact">
        <i className="fas fa-phone-alt" />
        {hosp.phones.map((p, i) => (
          <span key={p}>
            <a href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>
            {i < hosp.phones.length - 1 && <span className="sep"> &nbsp;|&nbsp; </span>}
          </span>
        ))}
      </div>

      <div className="loc-map">
        <iframe
          src={hosp.mapSrc}
          width="100%"
          height="200"
          style={{ border: 0, borderRadius: '10px' }}
          allowFullScreen
          loading="lazy"
          title={hosp.name}
        />
      </div>

      <a
        href={hosp.mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="loc-directions-btn"
      >
        <i className="fas fa-directions" /> Get Directions
      </a>
    </div>
  );
}

export default function Locations() {
  return (
    <section className="locations-section" id="locations">
      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <div className="section-tag">Find Us</div>
          <h2 className="section-title" >Hospital Locations</h2>
          <p className="section-subtitle">
            Real-time Google Maps for both clinic locations.
          </p>
        </div>

        <div className="locations-grid">
          {Object.values(HOSPITALS).map(hosp => (
            <LocationCard key={hosp.key} hosp={hosp} />
          ))}
        </div>
      </div>
    </section>
  );
}
