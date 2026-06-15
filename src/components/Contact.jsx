import { useState } from 'react';
import { DOCTOR } from '../data';
import { useInView } from '../hooks';
import './Contact.css';

const CONTACT_CARDS = [
  {
    icon: 'fas fa-hospital-alt',
    title: 'Al Manzoor Hospital',
    lines: ['Tulamba Road, Mian Channu,', 'Punjab, Pakistan'],
    href: '#locations',
    label: 'View on Map →',
    internal: true,
  },
  {
    icon: 'fas fa-hospital-alt',
    title: 'Sughran Wazir Complex',
    lines: ['Syedan Wala Bypass,', 'Bosan Road, Multan'],
    href: '#locations',
    label: 'View on Map →',
    internal: true,
  },
  {
    icon: 'fas fa-phone-alt',
    title: 'Phone',
    lines: ['+92 3098683232', '+92 3023569088'],
    href: 'tel:+92652663232',
    label: 'Call Now →',
    internal: false,
  },
  {
    icon: 'fab fa-whatsapp',
    title: 'WhatsApp',
    lines: ['+92 3318034846'],
    href: 'https://wa.me/923318034846',
    label: 'Chat Now →',
    internal: false,
  },
];

function ContactCard({ card, index }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  const handleClick = (e) => {
    if (card.internal) {
      e.preventDefault();
      const id = card.href.replace('#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      ref={ref}
      href={card.href}
      target={card.internal ? undefined : '_blank'}
      rel={card.internal ? undefined : 'noopener noreferrer'}
      onClick={handleClick}
      className={`contact-card reveal ${inView ? 'visible' : ''} ${hovered ? 'hovered' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i className={card.icon} />
      <h4>{card.title}</h4>
      <p>{card.lines.map((l, i) => <span key={i}>{l}{i < card.lines.length - 1 && <br />}</span>)}</p>
      <span className="contact-cta">{card.label}</span>
    </a>
  );
}

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <div className="section-tag">Contact Us</div>
          <h2 className="section-title">Get In Touch</h2>
        </div>

        <div className="contact-grid">
          {CONTACT_CARDS.map((card, i) => (
            <ContactCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
