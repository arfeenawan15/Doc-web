import { useState } from 'react';
import { useInView } from '../hooks';
import './FAQ.css';

const FAQS = [
  {
    q: "Who is the best child surgeon and child specialist in Mian Channu?",
    qUrdu: "میاں چنوں میں بچوں کا سب سے بہترین سرجن اور سپیشلسٹ ڈاکٹر کون ہے؟",
    a: "Dr. Waqas Ahmad Awan (MBBS, MS – Children's Hospital & Institute of Child Health Multan) is recognized as the leading Child Surgeon & Child Specialist in Mian Channu and Multan. With over 8 years of specialized pediatric surgical experience and more than 1,000 successful surgeries, he provides compassionate and advanced surgical care for newborns, infants, and children."
  },
  {
    q: "Where can I consult Dr. Waqas Ahmad Awan in Mian Channu (Bachon Ka Doctor / Surgeon)?",
    qUrdu: "ڈاکٹر وقاص احمد اعوان میاں چنوں میں کس ہسپتال میں بیٹھتے ہیں؟",
    a: "Dr. Waqas Ahmad Awan (بچوں کا ڈاکٹر اور سرجن) is available every Sunday from 11:00 AM to 04:00 PM at Al Manzoor Hospital, Tulamba Road, Mian Channu. Patients from Mian Channu, Tulamba, Khanewal, Abdul Hakeem, and surrounding regions regularly consult him for pediatric checkups and surgeries."
  },
  {
    q: "What conditions and surgeries does Dr. Waqas Ahmad Awan treat?",
    qUrdu: "ڈاکٹر وقاص احمد اعوان بچوں کی کن بیماریوں اور سرجریوں کا علاج کرتے ہیں؟",
    a: "Dr. Waqas Ahmad Awan specializes in neonatal surgery, pediatric laparoscopy, pediatric urology, undescended testes (orchidopexy), VP shunting for hydrocephalus, MMC repair (spina bifida), cleft lip & palate, pediatric hernia & hydrocele repair, rectal polyps, umbilical granuloma, intestinal obstruction, and safe pediatric circumcision."
  },
  {
    q: "How can I book an appointment with Dr. Waqas Ahmad Awan in Mian Channu & Multan?",
    qUrdu: "میاں چنوں یا ملتان میں اپوائنٹمنٹ کیسے بک کروائیں؟",
    a: "You can book an appointment directly through this website by clicking the 'Book Appointment' button, or call/WhatsApp at +92 309 8683232 / +92 331 8034846. Instant appointment confirmations and reminders are provided."
  },
  {
    q: "What are Dr. Waqas Ahmad Awan's clinic timings in Multan?",
    qUrdu: "ملتان میں کلینک کے اوقات اور دن کیا ہیں؟",
    a: "In Multan, Dr. Waqas Ahmad Awan is available from Thursday to Saturday (6:00 PM to 9:00 PM) at Sughran Wazir Medical Complex (Child Clinic), Syedan Wala Bypass, Bosan Road, Multan."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [ref, inView] = useInView(0.1);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="section-container faq-container" ref={ref}>
        <div className="section-header">
          <div className="section-tag">Frequently Asked Questions</div>
          <h2 className="section-title">
            Child Specialist &amp; Surgeon FAQs<br />
            <span style={{ fontSize: '0.7em', color: 'var(--teal)', fontWeight: '600' }}>
              عام پوچھے جانے والے سوالات
            </span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about consulting Dr. Waqas Ahmad Awan (Child Surgeon &amp; Child Specialist in Mian Channu &amp; Multan).
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className={`faq-item ${openIndex === i ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <div className="faq-q-text-wrap">
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-q-urdu">{faq.qUrdu}</span>
                </div>
                <div className="faq-icon">
                  <i className="fas fa-chevron-down" />
                </div>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p>
            Have more questions about your child's surgical condition or want to consult Dr. Waqas Ahmad Awan directly?
          </p>
          <a
            href="#appointment"
            className="btn-primary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <i className="fas fa-calendar-check" /> Book Consultation Now
          </a>
        </div>
      </div>
    </section>
  );
}

