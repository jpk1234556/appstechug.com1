import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ChevronDown, Facebook, Instagram, Linkedin, Menu, Send, Twitter, X } from 'lucide-react';
import { subscribeToNewsletter } from './lib/supabase';
import './styles.css';

const services = [
  ['01', 'Hotspot setup', 'Launch a dependable Wi-Fi business with the right network design, equipment, and configuration from day one.'],
  ['02', 'Network equipment', 'We source and install routers, access points, switches, and computers that are made to keep up.'],
  ['03', 'Technical support', 'Keep your customers connected with responsive maintenance, monitoring, and hands-on technical care.'],
];
const packages = [
  { name: 'Basic hotspot', price: 'Ugx 1m', type: 'Hotspot setup', items: ['EAP 110 (outdoor / indoor)', 'Outdoor cable', 'RB 951', 'Captive portal, voucher and firewall setup'] },
  { name: 'Standard hotspot', price: 'Ugx 2m', type: 'Hotspot setup', items: ['EAP225 outdoor (2pcs)', 'Outdoor networking cable', 'L009 Series', 'Captive portal, voucher and firewall setup'] },
  { name: 'Premium hotspot', price: 'Ugx 3.5m', type: 'Hotspot setup', items: ['RG-RAP6262(G) / Unifi AC mesh (2pcs)', 'Outdoor networking cable', 'L009 Series and POE', 'AX1800 EAP610 ceiling mount if needed', 'Captive portal, voucher and firewall setup'] },
  { name: 'Starter backup', price: 'Ugx 500,000', type: 'Backup power', items: ['2kVA UPS', 'Two 12V batteries', 'Complete wiring and installation', 'Surge and overload protection', 'Backup duration: 4-5 hours'] },
  { name: 'Standard backup', price: 'Ugx 1,000,000', type: 'Backup power', items: ['1 solar panel (>= 300W)', '1 deep-cycle battery', '1-2kVA inverter and charge controller', 'Cables, protections and full installation', 'Backup duration: 12-15 hours'] },
  { name: 'Polish backup', price: 'Ugx 1,500,000', type: 'Backup power', items: ['2 solar panels (>= 300W each)', '2 deep-cycle batteries', 'Inverter system and charge controller', 'All accessories and professional installation', 'Backup duration: 24 hours'] },
  { name: 'Duo Polish Hybrid', price: 'Ugx 2,000,000', type: 'Backup power', items: ['2 solar panels (>= 300W each)', 'Hybrid inverter (solar + grid + battery)', 'Smart charge controller', 'Battery bank (1-2 units depending on need)', 'Backup duration: 20-24 hours'] },
];
const faqs = [
  ['How do I get started with Appstech?', 'Book a free consultation and we will map the right equipment, coverage, and business model for your space.'],
  ['How long does setup take?', 'Most small and medium hotspot installations can be planned and brought online within a few working days.'],
  ['Which payment methods are accepted?', 'We accept mobile money, bank transfer, and other flexible payment options for clients across Uganda.'],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [email, setEmail] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  const submitContact = async (event) => {
    event.preventDefault();
    if (!email.includes('@')) return setContactStatus('Please enter a valid email.');
    setContactStatus('Sending...');
    const result = await subscribeToNewsletter(email);
    if (!result.ok) return setContactStatus(result.message);
    setContactStatus('Thanks. You are on the list.');
    setEmail('');
  };

  return <div className="site-shell">
    <div className="utility-bar"><div className="utility-inner"><span>Sales <i>|</i> Service <i>|</i> Solution <i>|</i> Spare</span><div className="socials"><a href="#footer" aria-label="Facebook"><Facebook size={15} /></a><a href="#footer" aria-label="Twitter"><Twitter size={15} /></a><a href="#footer" aria-label="LinkedIn"><Linkedin size={15} /></a><a href="#footer" aria-label="Instagram"><Instagram size={15} /></a></div></div></div>
    <header className="header"><a className="logo" href="#top" aria-label="Appstech home"><strong>APPSTECH</strong><span>INTERNATIONAL</span><small>SALES | SERVICE | SOLUTIONS | SPARES</small></a><nav className={menuOpen ? 'nav nav-open' : 'nav'}><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a><a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Talk to us <ArrowUpRight size={16} /></a></nav><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button></header>
    <main id="top">
      <section className="hero"><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">Reliable connectivity. Real opportunity.</p><h1>Turn internet connectivity <em>into a business.</em></h1><p className="hero-copy">We provide everything you need to build and operate a successful Wi-Fi hotspot business, from network setup and equipment to user management and technical support.</p><div className="hero-actions"><a className="button button-light" href="#contact">Free consultation <ArrowUpRight size={18} /></a><a className="text-link" href="#services">Explore services <ArrowUpRight size={18} /></a></div></div><div className="hero-note"><span>01</span><span>Connectivity built for growth</span></div></section>
      <section className="partner-strip"><span>Trusted technology for ambitious operators</span><div className="partner-logos"><b>DELL</b><b>hp</b><b>Lenovo</b><b>TOSHIBA</b></div></section>
      <section className="intro section" id="about"><div className="section-label">/ Who we are</div><div className="intro-grid"><h2>Make your connection <em>count.</em></h2><div><p className="lead">The internet is more than a utility. With the right tools and support, it becomes a reliable source of income, access, and possibility.</p><p>Appstech International helps individuals and businesses turn internet connectivity into a profitable opportunity. We make the technical side clear, practical, and ready for the real world.</p><a className="arrow-link" href="#contact">Meet Appstech <ArrowUpRight size={18} /></a></div></div></section>
      <section className="services section" id="services"><div className="section-label">/ What we do</div><div className="section-heading"><h2>Everything you need to <em>stay connected.</em></h2><p>From your first access point to your hundredth customer, we are in your corner.</p></div><div className="service-grid">{services.map(([number, title, text]) => <article className="service-card" key={number}><span className="service-number">{number}</span><h3>{title}</h3><p>{text}</p><a href="#contact" aria-label={`Learn more about ${title}`}><ArrowUpRight size={20} /></a></article>)}</div></section>
      <section className="pricing section" id="pricing"><div className="section-label">/ Transparent packages</div><div className="section-heading"><h2>Choose the right <em>starting point.</em></h2><p>All prices are in Ugandan shillings. Contact us to confirm availability and tailor a package to your site.</p></div><div className="pricing-grid">{packages.map((pack, index) => <article className={`price-card ${index === 1 ? 'featured' : ''}`} key={pack.name}><div className="price-card-top"><span>{pack.type}</span><span>0{index + 1}</span></div><h3>{pack.name}</h3><ul>{pack.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="price-bottom"><strong>{pack.price}</strong><a href="#contact" aria-label={`Ask about ${pack.name}`}><ArrowUpRight size={19} /></a></div></article>)}</div></section>
      <section className="proof" id="proof"><div className="proof-photo" /><div className="proof-content"><div className="section-label">/ The Appstech difference</div><h2>Technology that works as hard as <em>you do.</em></h2><p>Reliable service should feel simple. We combine quality hardware with practical setup and ongoing support so you can focus on your customers.</p><div className="stats"><div><strong>150<span>+</span></strong><small>Businesses supported</small></div><div><strong>24<span>/7</span></strong><small>Technical confidence</small></div><div><strong>10<span>yr</span></strong><small>Of local expertise</small></div></div></div></section>
      <section className="testimonials section"><div className="section-label">/ In their words</div><div className="testimonial-grid"><div><h2>Built with people, <em>not just systems.</em></h2><a className="arrow-link" href="#contact">Start a conversation <ArrowUpRight size={18} /></a></div><blockquote><span className="quote-mark">“</span><p>Appstech helped us move from a slow, unreliable setup to a network our customers can trust. The difference is clear every single day.</p><footer><span className="avatar">AM</span><span><strong>Andrew M.</strong><small>Hotspot operator, Kampala</small></span></footer></blockquote></div></section>
      <section className="faq section" id="faq"><div className="section-label">/ Good to know</div><div className="faq-grid"><h2>Questions, <em>answered.</em></h2><div>{faqs.map(([question, answer], index) => <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={question}><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{question}</span><ChevronDown size={20} /></button>{activeFaq === index && <p>{answer}</p>}</div>)}</div></div></section>
      <section className="cta" id="contact"><div><p className="eyebrow">Ready when you are</p><h2>Let's make your<br /><em>connection count.</em></h2></div><form onSubmit={submitContact}><label htmlFor="email">Get useful updates and offers</label><div className="input-row"><input id="email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} /><button aria-label="Subscribe"><Send size={18} /></button></div>{contactStatus && <p className="form-status" role="status">{contactStatus}</p>}</form></section>
    </main>
    <footer className="footer" id="footer"><div className="footer-brand"><a className="logo" href="#top"><strong>APPSTECH</strong><span>INTERNATIONAL</span><small>SALES | SERVICE | SOLUTIONS | SPARES</small></a><p>Fast, reliable internet solutions for businesses ready to grow.</p></div><div><h4>Explore</h4><a href="#about">About us</a><a href="#services">Our services</a><a href="#proof">Why Appstech</a></div><div><h4>Contact</h4><a href="mailto:hello@appstechug.com">hello@appstechug.com</a><a href="tel:+256700170685">+256 700 170685</a><span>Kampala, Uganda</span></div><div className="footer-bottom"><span>© 2026 Appstech International</span><span>Built for better connections.</span></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);