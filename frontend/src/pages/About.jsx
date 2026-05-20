import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    
    return () => {
      obs.disconnect();
    };
  }, []);

  return (
    <div className="about-page">
      <nav className={`about-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="about-logo">Mess<span>Mate</span></Link>
        <div className="about-nav-right">
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/signup" className="btn-solid">Get Started</Link>
        </div>
      </nav>

      <div className="about-hero reveal">
        <span className="about-tag">About MessMate</span>
        <h1>Built to end<br/>campus food <span>waste.</span></h1>
        <p>MessMate was born inside a hostel mess in 2023 — watching good food get thrown away every evening because nobody had a better system. We built the tool we wished existed.</p>
      </div>

      <hr className="about-divider" />

      <div className="about-stats reveal">
        <div className="about-stat"><div className="about-stat-num" style={{color:'var(--accent)'}}>2023</div><div className="about-stat-label">Year Founded</div></div>
        <div className="about-stat"><div className="about-stat-num" style={{color:'var(--accent2)'}}>50+</div><div className="about-stat-label">Campuses</div></div>
        <div className="about-stat"><div className="about-stat-num" style={{color:'var(--gold)'}}>12k+</div><div className="about-stat-label">Students Active</div></div>
        <div className="about-stat"><div className="about-stat-num" style={{color:'var(--orange)'}}>25%</div><div className="about-stat-label">Avg. Waste Reduction</div></div>
      </div>

      <div className="about-section reveal">
        <span className="about-tag">Our Mission</span>
        <h2>Transparency fixes<br/>everything.</h2>
        <p>In campus mess systems the core problem isn't bad food or lazy students — it's that no one has the same view of what's happening. The kitchen doesn't know how many people are coming. Students don't see the real cost of skipping. Parents have zero visibility.</p>
        <p>MessMate fixes the information gap. When everyone sees the same accurate picture — participation, waste, budget — the system naturally improves. No lectures needed. Just data.</p>
      </div>

      <hr className="about-divider" />

      <div className="about-section reveal">
        <span className="about-tag">How We Got Here</span>
        <h2>Our story</h2>
        <div className="about-story">
          <div className="about-story-item">
            <div className="about-story-year">2022</div>
            <div className="about-story-body">
              <h3>The problem became impossible to ignore</h3>
              <p>Arjun Sharma, a final-year student at NIT Hamirpur, watched his hostel mess discard full trays of food every night. The cook had no way of knowing how many students would show up. He made food for 400. Sometimes 220 came.</p>
              <div className="about-pull-quote">"I cook for 400. If only 220 show up, what can I do?" — Ramesh-ji, mess cook</div>
            </div>
          </div>
          <div className="about-story-item">
            <div className="about-story-year">Early 2023</div>
            <div className="about-story-body">
              <h3>A simple idea: just ask students in advance</h3>
              <p>What if students indicated whether they'd eat — before the kitchen started cooking? Arjun sketched the idea, brought in Priya (design) and Karan (engineering), and they had a working prototype running in a week.</p>
            </div>
          </div>
          <div className="about-story-item">
            <div className="about-story-year">Mid 2023</div>
            <div className="about-story-body">
              <h3>Pilot at their own college. It worked.</h3>
              <p>They ran it on 180 students for one semester. Food waste fell 22%. Procurement costs dropped by ₹40,000. Three parents called asking for monthly participation reports — something that had never existed before.</p>
            </div>
          </div>
          <div className="about-story-item">
            <div className="about-story-year">Today</div>
            <div className="about-story-body">
              <h3>50+ campuses. 12,000+ students. Still growing.</h3>
              <p>Administrators make decisions with data. Students feel ownership of their food experience. And the cook finally knows how much to make.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'var(--surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}}>
        <div className="about-section reveal">
          <span className="about-tag">What We Believe</span>
          <h2>Our values</h2>
          <div className="about-values-grid">
            <div className="about-value"><span className="about-value-icon">🔍</span><h3>Radical Transparency</h3><p>Every stakeholder deserves the same truthful data. No hidden metrics, no obfuscation.</p></div>
            <div className="about-value"><span className="about-value-icon">♻️</span><h3>Waste Reduction First</h3><p>We measure success in kilograms of food not wasted — not just monthly active users.</p></div>
            <div className="about-value"><span className="about-value-icon">🤝</span><h3>Dignity for All Roles</h3><p>From cook to student to guardian — everyone in the system deserves a tool that respects them.</p></div>
            <div className="about-value"><span className="about-value-icon">🔒</span><h3>Data Without Surveillance</h3><p>We collect only what's needed and never monetise student data. Your mess data stays in your mess.</p></div>
            <div className="about-value"><span className="about-value-icon">⚡</span><h3>Simple Over Clever</h3><p>If marking a meal takes more than 3 seconds, we've failed. Simplicity is the hardest thing to build.</p></div>
            <div className="about-value"><span className="about-value-icon">🌱</span><h3>Long-Term Thinking</h3><p>We're building infrastructure India's campus food systems need for the next 20 years, not the next quarter.</p></div>
          </div>
        </div>
      </div>

      <div style={{background:'var(--surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}}>
        <div className="about-section reveal">
          <span className="about-tag">Roadmap</span>
          <h2>What's next</h2>
          <div className="about-roadmap">
            <div className="about-rm-item"><div className="about-rm-q done">Q2 2023</div><div className="about-rm-body"><h3>Core Platform</h3><p>Meal intention tracking, admin dashboard, waste analytics, guardian reports.</p><span className="about-rm-status done">Shipped ✓</span></div></div>
            <div className="about-rm-item"><div className="about-rm-q done">Q4 2023</div><div className="about-rm-body"><h3>Multi-Campus & API</h3><p>Campus data isolation, bulk onboarding, REST API for ERP integration.</p><span className="about-rm-status done">Shipped ✓</span></div></div>
            <div className="about-rm-item"><div className="about-rm-q active">Q2 2024</div><div className="about-rm-body"><h3>Predictive Demand Forecasting</h3><p>ML model that predicts next-day participation before students even mark intentions.</p><span className="about-rm-status active">In Progress</span></div></div>
            <div className="about-rm-item"><div className="about-rm-q soon">Q3 2024</div><div className="about-rm-body"><h3>Menu Builder & Meal Ratings</h3><p>Admins publish weekly menus. Students rate meals. Ratings feed back into procurement.</p><span className="about-rm-status soon">Planned</span></div></div>
            <div className="about-rm-item"><div className="about-rm-q soon">Q4 2024</div><div className="about-rm-body"><h3>iOS & Android App</h3><p>Native apps with home-screen widgets for one-tap meal marking in under 3 seconds.</p><span className="about-rm-status soon">Planned</span></div></div>
          </div>
        </div>
      </div>

      <div className="about-cta reveal">
        <span className="about-tag" style={{display:'block', marginBottom:'14px'}}>Get Started</span>
        <h2>Ready to reduce waste<br/>on your campus?</h2>
        <p>Set up MessMate in minutes. No hardware. No training required.</p>
        <div className="about-cta-btns">
          <Link to="/signup" className="btn-primary">
            Create Account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="mailto:hello@messmate.in" className="btn-outline">Contact Us</a>
        </div>
      </div>

      <footer className="about-footer">
        <div className="about-footer-logo">Mess<span>Mate</span></div>
        <div className="about-footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="#">Privacy</Link>
          <Link to="#">Terms</Link>
        </div>
        <div className="about-footer-copy">© 2025 MessMate</div>
      </footer>
    </div>
  );
};

export default About;
