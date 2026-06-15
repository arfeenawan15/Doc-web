import { useInView } from '../hooks';
import { DOCTOR, EDUCATION } from '../data';
import './About.css';

const EXPERTISE = [
  'Pediatric Laparoscopy',
  'Neonatal Surgery',
  'Hernia & Hydrocele Repair',
  'Trauma & Emergency Surgery',
  'Circumcision & Urology',
];

export default function About() {
  const [leftRef,  leftIn]  = useInView();
  const [rightRef, rightIn] = useInView();
  const [expRef, expIn]     = useInView(0.1);

  return (
    <section className="about-section" id="about">
      <div className="section-container about-grid">

        {/* Left — doctor image */}
        <div ref={leftRef} className={`about-left reveal ${leftIn ? 'visible' : ''}`}>
          <div className="about-img-wrap">
            <div className="about-img-placeholder">
              <img src="/assets/pic1.png" alt="Dr. Waqas Ahmad Awan" />
            </div>
            <div className="about-badge-card">
              <i className="fas fa-certificate" />
              <span>Board Certified<br />Pediatric Surgeon</span>
            </div>

            {/* Floating stat pills */}
            <div className="about-stat-pill about-stat-pill-1">
              <i className="fas fa-user-md" />
              <span><strong>8+</strong> Yrs Experience</span>
            </div>
            <div className="about-stat-pill about-stat-pill-2">
              <i className="fas fa-child" />
              <span><strong>500+</strong> Patients</span>
            </div>
          </div>
        </div>

        {/* Right — text */}
        <div ref={rightRef} className={`about-right reveal ${rightIn ? 'visible' : ''}`}>
          <div className="section-tag">About the Doctor</div>
          <h2 className="section-title">
            Dedicated to Children's<br />Health &amp; Wellbeing
          </h2>

          <p className="about-text">{DOCTOR.bio1}</p>
          <p className="about-text">{DOCTOR.bio2}</p>

          <div className="about-edu">
            {EDUCATION.map(({ degree, institution }) => (
              <div className="edu-item" key={degree}>
                <div className="edu-dot" />
                <div>
                  <div className="edu-degree">{degree}</div>
                  <div className="edu-place">{institution}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Areas of Expertise Tags */}
          <div ref={expRef} className="about-expertise">
            <div className="about-expertise-title">Clinical Expertise</div>
            <div className={`about-expertise-grid ${expIn ? 'animate' : ''}`}>
              {EXPERTISE.map((item, idx) => (
                <div className="about-expertise-item" key={item} style={{ transitionDelay: `${idx * 0.1}s` }}>
                  <span className="expertise-check-icon">
                    <i className="fas fa-check-circle" />
                  </span>
                  <span className="expertise-item-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
