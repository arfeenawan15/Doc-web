import { useInView } from '../hooks';
import { useSite } from '../context/SiteContext';
import './Schedule.css';

function ScheduleCard({ hospKey }) {
  const { schedule, hospitals, loading } = useSite();
  const hospital = hospitals[hospKey];
  const rows = schedule[hospKey];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [ref, inView] = useInView();

  if (loading || !hospital || !rows) return null;

  return (
    <div ref={ref} className={`schedule-hosp-card reveal ${inView ? 'visible' : ''}`}>
      <div className="schedule-hosp-header">
        <div className="schedule-hosp-icon">
          <i className="fas fa-hospital-alt" />
        </div>
        <div>
          <div className="schedule-hosp-name">{hospital.name}</div>
          <div className="schedule-hosp-address">
            <i className="fas fa-map-marker-alt" /> {hospital.address}
          </div>
        </div>
      </div>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Timing</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ day, timing, open }) => (
            <tr key={day} className={day === today ? 'today' : ''}>
              <td>
                <strong>{day}</strong>
                {day === today && <span className="today-dot"> 🔵</span>}
              </td>
              <td>{timing}</td>
              <td>
                <span className={open ? 'status-open' : 'status-closed'}>
                  {open ? 'Open' : 'Closed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Schedule() {
  const [ref, inView] = useInView(0.1);
  const { hospitals, loading } = useSite();

  return (
    <section className="schedule-section" id="schedule">
      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <div className="section-tag">Clinic Hours</div>
          <h2 className="section-title">Weekly Schedule &amp; Timings</h2>
          <p className="section-subtitle">
            Visit Dr. Waqas Ahmad Awan at either of his two clinic locations.
          </p>
        </div>

        <div className="schedule-hospitals-grid">
          {loading ? (
            <div style={{ textAlign: 'center', width: '100%' }}>Loading schedule...</div>
          ) : (
            Object.keys(hospitals).map((key, i) => (
              <div 
                key={key} 
                className={`schedule-card-wrapper ${inView ? 'animate-up' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <ScheduleCard hospKey={key} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
