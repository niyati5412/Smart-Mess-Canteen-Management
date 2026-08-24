import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const cssVariables = `
  :root {
    --bg:#0a0d0f;--surface:#111518;--surface2:#181d21;--border:rgba(255,255,255,0.07);
    --text:#e8edf2;--muted:#7a8a96;--accent:#00e5a0;--accent2:#00b8ff;--accent3:#ff6b35;
    --danger:#ff4757;--gold:#f4c542;--nav-bg:rgba(10,13,15,0.85);
    --tt:background 0.35s ease,color 0.35s ease,border-color 0.35s ease,box-shadow 0.35s ease;
  }
  [data-theme="light"] {
    --bg:#f0f5f2;--surface:#ffffff;--surface2:#e8f0ec;--border:rgba(0,0,0,0.09);
    --text:#182420;--muted:#5e7a6d;--accent:#00a86b;--accent2:#0096d6;--accent3:#e05a28;
    --danger:#e03a4a;--gold:#c89a14;--nav-bg:rgba(240,245,242,0.92);
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;transition:var(--tt);}

  .theme-toggle{position:relative;width:56px;height:28px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;}
  .theme-toggle input{opacity:0;width:0;height:0;position:absolute;}
  .tt-track{position:absolute;inset:0;border-radius:100px;background:var(--surface2);border:1px solid var(--border);transition:background 0.3s,border-color 0.3s;display:flex;align-items:center;justify-content:space-between;padding:0 7px;font-size:0.7rem;user-select:none;}
  .tt-thumb{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:var(--accent);box-shadow:0 2px 6px rgba(0,0,0,0.35);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.3s;pointer-events:none;}
  .theme-toggle input:checked~.tt-thumb{transform:translateX(28px);background:var(--gold);}
  [data-theme="light"] .tt-track{background:#d8ede5;border-color:rgba(0,0,0,0.1);}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:var(--nav-bg);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);transition:var(--tt);}
  .nav-logo{font-family:'Poppins',sans-serif;font-weight:800;font-size:1.4rem;color:var(--accent);letter-spacing:-0.5px;text-decoration:none;}
  .nav-logo span{color:var(--text);}
  .nav-links{display:flex;gap:32px;}
  .nav-links a{text-decoration:none;color:var(--muted);font-size:0.9rem;font-weight:500;transition:color 0.2s;}
  .nav-links a:hover{color:var(--text);}
  .nav-cta{display:flex;gap:12px;align-items:center;}
  .btn-nav{padding:8px 20px;border-radius:8px;font-size:0.875rem;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;font-family:'Poppins',sans-serif;border:none;}
  .btn-ghost{border:1px solid var(--border);color:var(--text);background:transparent;}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent);}
  .btn-solid{background:var(--accent);color:#0a0d0f;border:1px solid var(--accent);font-weight:700;}
  [data-theme="light"] .btn-solid{color:#fff;}
  .btn-solid:hover{opacity:0.88;transform:translateY(-1px);}

  .hero{min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden;}
  .hero-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,0.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 100%);transition:opacity 0.35s;}
  [data-theme="light"] .hero-grid-bg{background-image:linear-gradient(rgba(0,168,107,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,168,107,0.07) 1px,transparent 1px);}
  .hero-orbs{position:absolute;inset:0;pointer-events:none;}
  .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.15;animation:drift 8s ease-in-out infinite alternate;transition:opacity 0.35s;}
  [data-theme="light"] .orb{opacity:0.1;}
  .orb-1{width:600px;height:600px;background:var(--accent);top:-200px;right:-100px;}
  .orb-2{width:400px;height:400px;background:var(--accent2);bottom:-100px;left:100px;animation-delay:-3s;}
  .orb-3{width:300px;height:300px;background:var(--accent3);top:50%;left:40%;animation-delay:-5s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(30px,-30px) scale(1.1);}}

  .hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.25);color:var(--accent);font-size:0.8rem;font-weight:500;padding:6px 14px;border-radius:100px;margin-bottom:24px;letter-spacing:0.5px;}
  [data-theme="light"] .hero-badge{background:rgba(0,168,107,0.08);border-color:rgba(0,168,107,0.2);}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
  .hero h1{font-family:'Poppins',sans-serif;font-size:clamp(2.8rem,5vw,4.2rem);font-weight:800;line-height:1.08;letter-spacing:-2px;margin-bottom:20px;}
  .hero h1 em{font-style:normal;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .hero-sub{color:var(--muted);font-size:1.05rem;line-height:1.7;margin-bottom:36px;max-width:480px;}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:48px;}
  .btn-primary{padding:14px 28px;border-radius:10px;background:var(--accent);color:#0a0d0f;font-size:0.95rem;font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;font-family:'Poppins',sans-serif;}
  [data-theme="light"] .btn-primary{color:#fff;}
  .btn-primary:hover{opacity:0.88;transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,168,107,0.3);}
  .btn-secondary{padding:14px 28px;border-radius:10px;background:transparent;color:var(--text);font-size:0.95rem;font-weight:500;text-decoration:none;border:1px solid var(--border);cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;font-family:'Poppins',sans-serif;}
  .btn-secondary:hover{border-color:var(--accent);color:var(--accent);}
  .hero-trust{display:flex;align-items:center;gap:16px;color:var(--muted);font-size:0.82rem;}
  .trust-avatars{display:flex;}
  .avatar{width:30px;height:30px;border-radius:50%;border:2px solid var(--bg);margin-right:-10px;background:linear-gradient(135deg,#2a3a4a,#1a2a3a);display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--accent);font-weight:700;transition:border-color 0.35s;}
  [data-theme="light"] .avatar{background:linear-gradient(135deg,#c8e8dd,#a0d8c8);color:#0a3025;}

  .hero-dashboard{background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.5),0 0 0 1px var(--border);animation:floatCard 6s ease-in-out infinite;transition:var(--tt),box-shadow 0.35s;}
  [data-theme="light"] .hero-dashboard{box-shadow:0 20px 60px rgba(0,0,0,0.12),0 0 0 1px var(--border);}
  @keyframes floatCard{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
  .dashboard-header{background:var(--surface2);padding:14px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);}
  .dash-dots{display:flex;gap:6px;}
  .dash-dot{width:10px;height:10px;border-radius:50%;}
  .dashboard-title{font-size:0.78rem;color:var(--muted);flex:1;text-align:center;letter-spacing:0.3px;}
  .dashboard-body{padding:20px;}
  .dash-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
  .dash-stat{background:var(--surface2);border-radius:12px;padding:14px;border:1px solid var(--border);transition:var(--tt);}
  .dash-stat-label{font-size:0.7rem;color:var(--muted);margin-bottom:4px;}
  .dash-stat-value{font-family:'Poppins',sans-serif;font-weight:700;font-size:1.4rem;}
  .dash-stat-change{font-size:0.68rem;margin-top:2px;}
  .up{color:var(--accent);}.down{color:var(--danger);}
  .dash-chart{background:var(--surface2);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid var(--border);transition:var(--tt);}
  .dash-chart-title{font-size:0.75rem;color:var(--muted);margin-bottom:14px;font-weight:500;}
  .chart-bars{display:flex;gap:8px;align-items:flex-end;height:80px;}
  .chart-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;}
  .chart-bar{width:100%;border-radius:4px 4px 0 0;background:linear-gradient(180deg,var(--accent),rgba(0,229,160,0.3));transition:all 0.3s;}
  .chart-bar.waste{background:linear-gradient(180deg,var(--danger),rgba(255,71,87,0.3));}
  .chart-day{font-size:0.6rem;color:var(--muted);}
  .dash-meals{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .meal-item{background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;transition:var(--tt);}
  .meal-name{font-size:0.75rem;font-weight:500;}
  .meal-sub{font-size:0.65rem;color:var(--muted);}
  .meal-pill{font-size:0.65rem;padding:3px 8px;border-radius:100px;font-weight:600;}
  .pill-eat{background:rgba(0,229,160,0.15);color:var(--accent);}
  .pill-skip{background:rgba(255,71,87,0.15);color:var(--danger);}

  .section{padding:100px 48px;max-width:1200px;margin:0 auto;}
  .section-label{font-size:0.78rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;}
  .section-title{font-family:'Poppins',sans-serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px;line-height:1.1;}
  .section-sub{color:var(--muted);font-size:1rem;line-height:1.7;max-width:520px;}
  .section-header{margin-bottom:60px;}

  .problems-wrap{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);transition:var(--tt);}
  .problems-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
  .problem-card{background:var(--surface);padding:36px 28px;position:relative;overflow:hidden;transition:background 0.3s;}
  .problem-card:hover{background:var(--surface2);}
  .problem-icon{font-size:2.4rem;margin-bottom:16px;display:block;}
  .problem-card h3{font-family:'Poppins',sans-serif;font-size:1.05rem;font-weight:700;margin-bottom:10px;}
  .problem-card p{font-size:0.88rem;color:var(--muted);line-height:1.6;}

  .features-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:36px;position:relative;overflow:hidden;transition:all 0.3s;}
  [data-theme="light"] .feature-card{box-shadow:0 2px 16px rgba(0,0,0,0.05);}
  .feature-card:hover{border-color:rgba(0,229,160,0.3);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.15);}
  .feature-card.big{grid-column:span 2;}
  .big-content{display:flex;gap:48px;align-items:center;}
  .feature-card .accent-line{width:40px;height:3px;border-radius:2px;background:var(--accent);margin-bottom:20px;}
  .feature-card.blue .accent-line{background:var(--accent2);}
  .feature-card.orange .accent-line{background:var(--accent3);}
  .feature-card.gold .accent-line{background:var(--gold);}
  .feature-icon-wrap{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:20px;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.2);}
  .feature-card.blue .feature-icon-wrap{background:rgba(0,184,255,0.1);border-color:rgba(0,184,255,0.2);}
  .feature-card.orange .feature-icon-wrap{background:rgba(255,107,53,0.1);border-color:rgba(255,107,53,0.2);}
  .feature-card.gold .feature-icon-wrap{background:rgba(244,197,66,0.1);border-color:rgba(244,197,66,0.2);}
  .feature-card h3{font-family:'Poppins',sans-serif;font-size:1.25rem;font-weight:700;margin-bottom:12px;}
  .feature-card p{color:var(--muted);font-size:0.9rem;line-height:1.7;}
  .feature-list{margin-top:20px;display:flex;flex-direction:column;gap:10px;}
  .feature-list li{display:flex;align-items:flex-start;gap:10px;font-size:0.88rem;color:var(--muted);list-style:none;}
  .feature-list li::before{content:'✓';color:var(--accent);font-weight:700;flex-shrink:0;margin-top:1px;}
  .mini-analytics{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:20px;flex:1;min-width:260px;transition:var(--tt);}
  .mini-analytics-title{font-size:0.72rem;color:var(--muted);margin-bottom:16px;letter-spacing:0.3px;}
  .donut-wrap{display:flex;align-items:center;gap:20px;}
  .donut-svg{width:80px;height:80px;}
  .donut-legend{display:flex;flex-direction:column;gap:8px;}
  .legend-item{display:flex;align-items:center;gap:8px;font-size:0.75rem;}
  .legend-dot{width:8px;height:8px;border-radius:50%;}

  .steps-wrap{position:relative;}
  .steps-line{position:absolute;left:28px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,var(--accent),transparent);}
  .steps{display:flex;flex-direction:column;gap:0;}
  .step{display:flex;gap:40px;align-items:flex-start;padding:36px 0;border-bottom:1px solid var(--border);}
  .step:last-child{border-bottom:none;}
  .step-num{width:56px;height:56px;border-radius:50%;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-weight:800;font-size:1.1rem;color:var(--accent);flex-shrink:0;position:relative;z-index:1;transition:var(--tt);}
  .step-body{flex:1;padding-top:10px;}
  .step-body h3{font-family:'Poppins',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:8px;}
  .step-body p{color:var(--muted);font-size:0.9rem;line-height:1.7;}
  .step-tag{font-size:0.72rem;padding:4px 10px;border-radius:100px;background:rgba(0,229,160,0.1);color:var(--accent);font-weight:600;margin-top:10px;display:inline-block;}

  .roles-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);transition:var(--tt);}
  .roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
  .landing-role-card{background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:36px;transition:all 0.3s;}
  .landing-role-card:hover{border-color:rgba(0,229,160,0.3);transform:translateY(-4px);}
  .role-badge{display:inline-flex;align-items:center;gap:6px;font-size:0.72rem;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:20px;}
  .badge-student{background:rgba(0,229,160,0.1);color:var(--accent);}
  .badge-admin{background:rgba(0,184,255,0.1);color:var(--accent2);}
  .badge-guardian{background:rgba(244,197,66,0.1);color:var(--gold);}
  .role-icon{font-size:2.5rem;margin-bottom:16px;display:block;}
  .landing-role-card h3{font-family:'Poppins',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:12px;}
  .landing-role-card p{color:var(--muted);font-size:0.88rem;line-height:1.7;margin-bottom:20px;}
  .role-features{display:flex;flex-direction:column;gap:8px;}
  .role-feature{display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--muted);}

  .stats-section{padding:80px 48px;}
  .stats-container{max-width:1200px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:60px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;position:relative;overflow:hidden;transition:var(--tt);}
  .stats-container::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 80% at 50% 0%,rgba(0,229,160,0.05),transparent);}
  .stat-item{text-align:center;padding:10px;}
  .stat-num{font-family:'Poppins',sans-serif;font-size:3rem;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
  .stat-label{font-size:0.85rem;color:var(--muted);margin-top:8px;}

  .cutoff-section{padding:0 48px 100px;}
  .cutoff-wrap{max-width:1200px;margin:0 auto;}
  .cutoff-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;overflow:hidden;transition:var(--tt);}
  .cutoff-header{padding:28px 36px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
  .cutoff-title{font-family:'Poppins',sans-serif;font-weight:700;font-size:1.05rem;}
  .live-badge{display:flex;align-items:center;gap:6px;font-size:0.72rem;font-weight:600;color:var(--accent);background:rgba(0,229,160,0.1);padding:5px 12px;border-radius:100px;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 1.5s ease-in-out infinite;}
  .cutoff-body{padding:28px 36px;}
  .cutoff-bar{height:6px;border-radius:3px;background:var(--surface2);}
  .cutoff-fill{height:100%;border-radius:3px;width:65%;background:linear-gradient(90deg,var(--accent),var(--accent2));position:relative;}
  .cutoff-fill::after{content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:white;box-shadow:0 0 0 3px var(--accent);}
  .cutoff-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:0.72rem;color:var(--muted);}
  .meal-intention-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
  .mi-card{background:var(--surface2);border-radius:12px;padding:16px;border:1px solid var(--border);transition:var(--tt);}
  .mi-meal{font-size:0.72rem;color:var(--muted);margin-bottom:6px;}
  .mi-time{font-family:'Poppins',sans-serif;font-weight:700;font-size:1rem;margin-bottom:10px;}
  .mi-bar{height:4px;border-radius:2px;background:var(--border);margin-bottom:8px;}
  .mi-fill{height:100%;border-radius:2px;background:var(--accent);}
  .mi-count{font-size:0.7rem;color:var(--muted);}
  .mi-count strong{color:var(--text);}

  .cta-section{padding:0 48px 100px;}
  .cta-wrap{max-width:1200px;margin:0 auto;background:linear-gradient(135deg,rgba(0,229,160,0.08),rgba(0,184,255,0.05));border:1px solid rgba(0,229,160,0.2);border-radius:28px;padding:80px;text-align:center;position:relative;overflow:hidden;transition:var(--tt);}
  .cta-wrap::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:300px;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);}
  .cta-wrap h2{font-family:'Poppins',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px;}
  .cta-wrap p{color:var(--muted);font-size:1rem;margin-bottom:36px;}
  .cta-buttons{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;}

  footer{padding:40px 48px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;transition:var(--tt);}
  .footer-logo{font-family:'Poppins',sans-serif;font-weight:800;font-size:1.2rem;color:var(--accent);}
  .footer-logo span{color:var(--muted);}
  .footer-links{display:flex;gap:24px;}
  .footer-links a{color:var(--muted);text-decoration:none;font-size:0.85rem;transition:color 0.2s;}
  .footer-links a:hover{color:var(--text);}
  .footer-copy{color:var(--muted);font-size:0.8rem;}

  .reveal{opacity:0;transform:translateY(28px);transition:all 0.7s cubic-bezier(0.22,1,0.36,1);}
  .reveal.visible{opacity:1;transform:translateY(0);}

  @media(max-width:900px){
    nav{padding:16px 24px;}.nav-links{display:none;}.hero{padding:100px 24px 60px;}
    .hero-inner{grid-template-columns:1fr;gap:40px;}.hero-dashboard{display:none;}
    .section{padding:60px 24px;}.problems-grid{grid-template-columns:1fr 1fr;}
    .features-grid{grid-template-columns:1fr;}.feature-card.big{grid-column:span 1;}
    .big-content{flex-direction:column;}.roles-grid{grid-template-columns:1fr;}
    .stats-container{grid-template-columns:1fr 1fr;padding:40px 24px;}
    .meal-intention-grid{grid-template-columns:1fr 1fr;}.cta-wrap{padding:48px 28px;}
    .stats-section{padding:60px 24px;}.cutoff-section{padding:0 24px 60px;}
    .cta-section{padding:0 24px 60px;}
    footer{padding:32px 24px;flex-direction:column;gap:20px;text-align:center;}
  }
  @media(max-width:600px){.problems-grid{grid-template-columns:1fr;}.stats-container{grid-template-columns:1fr 1fr;}}
`;

import { useState } from "react";

export default function Index() {
  const navRef = useRef(null);
  const heroLeftRef = useRef(null);
  const [liveStudentsCount, setLiveStudentsCount] = useState(null);

  // Inject Google Font + CSS variables once
  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(users => {
        if (Array.isArray(users)) {
          const count = users.filter(u => u.role === 'student').length;
          if (count > 0) setLiveStudentsCount(count);
        }
      })
      .catch(() => {});
    // Google Font
    if (!document.getElementById("mm-font")) {
      const link = document.createElement("link");
      link.id = "mm-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    // CSS variables & styles
    if (!document.getElementById("mm-styles")) {
      const style = document.createElement("style");
      style.id = "mm-styles";
      style.textContent = cssVariables;
      document.head.appendChild(style);
    }

    // Apply saved theme
    const saved = localStorage.getItem("mm-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);

    // Scroll shadow on nav
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.boxShadow =
          window.scrollY > 40 ? "0 4px 30px rgba(0,0,0,0.15)" : "none";
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Reveal on scroll
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting)
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    // Hero entrance animation
    if (heroLeftRef.current) {
      heroLeftRef.current.style.cssText = "opacity:0;transform:translateY(24px)";
      setTimeout(() => {
        if (heroLeftRef.current) {
          heroLeftRef.current.style.transition =
            "all 0.9s cubic-bezier(0.22,1,0.36,1)";
          heroLeftRef.current.style.opacity = "1";
          heroLeftRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }

    // Counter animation for stats
    const statsContainer = document.querySelector(".stats-container");
    if (statsContainer) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target
                .querySelectorAll(".stat-num[data-target]")
                .forEach((el) => {
                  animateCount(el, parseInt(el.dataset.target), "%");
                });
            }
          });
        },
        { threshold: 0.3 }
      );
      counterObserver.observe(statsContainer);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  function animateCount(el, target, suffix = "") {
    let start = 0;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      el.textContent =
        Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function handleThemeToggle(e) {
    const next = e.target.checked ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mm-theme", next);
    // Sync all toggles
    document.querySelectorAll(".theme-toggle-input").forEach((i) => {
      i.checked = next === "light";
    });
  }

  const chartData = [
    { day: "Mon", main: "70%", waste: "15%" },
    { day: "Tue", main: "85%", waste: "8%" },
    { day: "Wed", main: "60%", waste: "22%" },
    { day: "Thu", main: "90%", waste: "5%" },
    { day: "Fri", main: "78%", waste: "10%" },
    { day: "Sat", main: "45%", waste: "30%" },
    { day: "Sun", main: "55%", waste: "20%" },
  ];

  return (
    <>
      {/* NAV */}
      <nav ref={navRef}>
        <div className="nav-logo">Mess<span>Mate</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#roles">Who It&apos;s For</a>
          <a href="#stats">Impact</a>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn-nav btn-ghost">Login</Link>
          <Link to="/signup" className="btn-nav btn-solid">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid-bg"></div>
        <div className="hero-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="hero-inner">
          <div className="hero-left" ref={heroLeftRef}>
            <span className="hero-badge">Data-Driven Campus Food Management</span>
            <h1>Smarter Mess.<br /><em>Less Waste.</em><br />Full Transparency.</h1>
            <p className="hero-sub">
              MessMate empowers campuses with meal intention tracking, budget analytics, and
              real-time participation insights — eliminating waste and maximizing fee efficiency.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary">
                <span>Get Started Free</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
                <span>Watch Demo</span>
              </a>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                {["A","B","C","D"].map((l) => (
                  <div className="avatar" key={l}>{l}</div>
                ))}
              </div>
              <span>Trusted by 50+ campus mess administrators</span>
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="hero-dashboard">
            <div className="dashboard-header">
              <div className="dash-dots">
                <div className="dash-dot" style={{ background: "#ff5f57" }}></div>
                <div className="dash-dot" style={{ background: "#ffbd2e" }}></div>
                <div className="dash-dot" style={{ background: "#28c840" }}></div>
              </div>
              <span className="dashboard-title">MessMate Admin — Live Dashboard</span>
            </div>
            <div className="dashboard-body">
              <div className="dash-stats">
                <div className="dash-stat">
                  <div className="dash-stat-label">Today&apos;s Meals</div>
                  <div className="dash-stat-value" style={{ color: "var(--accent)" }}>{liveStudentsCount ? `${liveStudentsCount}` : '100+'}</div>
                  <div className="dash-stat-change up">↑ 12% vs yesterday</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-label">Waste Index</div>
                  <div className="dash-stat-value" style={{ color: "var(--danger)" }}>4.2%</div>
                  <div className="dash-stat-change up">↓ 2.1% improvement</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-label">Budget Eff.</div>
                  <div className="dash-stat-value" style={{ color: "var(--gold)" }}>91%</div>
                  <div className="dash-stat-change up">↑ 5% this week</div>
                </div>
              </div>
              <div className="dash-chart">
                <div className="dash-chart-title">Weekly Participation vs Waste</div>
                <div className="chart-bars">
                  {chartData.map(({ day, main, waste }) => (
                    <div className="chart-bar-wrap" key={day}>
                      <div className="chart-bar" style={{ height: main }}></div>
                      <div className="chart-bar waste" style={{ height: waste }}></div>
                      <span className="chart-day">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dash-meals">
                {[
                  { name: "Breakfast", sub: "8:00 AM cutoff done", pill: "287 eating", type: "eat" },
                  { name: "Lunch", sub: "Cutoff in 1h 20m", pill: "312 eating", type: "eat" },
                  { name: "Dinner", sub: "Open for intention", pill: "98 skipping", type: "skip" },
                  { name: "Snacks", sub: "Optional add-on", pill: "145 opted in", type: "eat" },
                ].map(({ name, sub, pill, type }) => (
                  <div className="meal-item" key={name}>
                    <div>
                      <div className="meal-name">{name}</div>
                      <div className="meal-sub">{sub}</div>
                    </div>
                    <span className={`meal-pill ${type === "eat" ? "pill-eat" : "pill-skip"}`}>{pill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <div className="problems-wrap">
        <div className="section reveal">
          <div className="section-header">
            <div className="section-label">The Challenge</div>
            <h2 className="section-title">Campus mess systems are broken</h2>
            <p className="section-sub">Every campus faces the same inefficiencies — costly, wasteful, and opaque.</p>
          </div>
          <div className="problems-grid">
            {[
              { icon: "🍽️", title: "Food Wastage", desc: "Excess food is prepared daily due to poor demand estimation. It ends up in the bin, not on the plate." },
              { icon: "💸", title: "Budget Inefficiency", desc: "Students pay full fees but regularly skip meals. Their money is lost with zero accountability." },
              { icon: "📉", title: "Zero Analytics", desc: "No visibility into participation trends, peak days, or what percentage of food gets consumed." },
              { icon: "👁️🗨️", title: "No Transparency", desc: "Parents and guardians have no insight into whether their child is eating or skipping regularly." },
            ].map(({ icon, title, desc }) => (
              <div className="problem-card" key={title}>
                <span className="problem-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section reveal" id="features">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything your mess needs</h2>
          <p className="section-sub">Powerful tools for students, administrators, and guardians — all in one platform.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="accent-line"></div>
            <div className="feature-icon-wrap">🎯</div>
            <h3>Meal Intention Tracking</h3>
            <p>Students mark their plan — Will Eat or Skip — before each meal&apos;s cutoff time.</p>
            <ul className="feature-list">
              <li>Per-meal, per-day intention controls</li>
              <li>Automated reminders before cutoff</li>
              <li>Late override with admin approval</li>
            </ul>
          </div>
          <div className="feature-card blue">
            <div className="accent-line"></div>
            <div className="feature-icon-wrap">📊</div>
            <h3>Budget &amp; Value Analytics</h3>
            <p>Track meals paid vs actually consumed. Generate per-student efficiency scores and monthly cost breakdowns.</p>
            <ul className="feature-list">
              <li>Budget efficiency % per student</li>
              <li>Monthly &amp; semester comparisons</li>
              <li>Cost-per-meal trend analysis</li>
            </ul>
          </div>
          <div className="feature-card big orange">
            <div className="big-content">
              <div style={{ flex: 1 }}>
                <div className="accent-line"></div>
                <div className="feature-icon-wrap">♻️</div>
                <h3>Waste Monitoring &amp; Reduction</h3>
                <p>Know exactly how much food is wasted daily. The admin dashboard surfaces waste trends by meal, day, and week.</p>
                <ul className="feature-list">
                  <li>Daily waste index scoring</li>
                  <li>Predictive demand for next-day prep</li>
                  <li>Weekly waste reports with insights</li>
                  <li>Historical trend comparisons</li>
                </ul>
              </div>
              <div className="mini-analytics">
                <div className="mini-analytics-title">MEAL CONSUMPTION BREAKDOWN — THIS WEEK</div>
                <div className="donut-wrap">
                  <svg className="donut-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2a2a" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00e5a0" strokeWidth="4" strokeDasharray="72 28" strokeDashoffset="25" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00b8ff" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-47" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ff4757" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-65" strokeLinecap="round" />
                    <text x="18" y="21" textAnchor="middle" fontSize="7" fill="#e8edf2" fontFamily="Poppins" fontWeight="800">91%</text>
                  </svg>
                  <div className="donut-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent)" }}></div><span>Consumed (72%)</span></div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent2)" }}></div><span>Intentional Skip (18%)</span></div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: "var(--danger)" }}></div><span>Actual Waste (10%)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="feature-card gold">
            <div className="accent-line"></div>
            <div className="feature-icon-wrap">👨👩👧</div>
            <h3>Guardian Reports</h3>
            <p>Monthly participation summaries sent to parents.</p>
            <ul className="feature-list">
              <li>Email &amp; PDF monthly reports</li>
              <li>Per-meal attendance history</li>
              <li>Budget utilization summary</li>
            </ul>
          </div>
          <div className="feature-card blue">
            <div className="accent-line"></div>
            <div className="feature-icon-wrap">🔐</div>
            <h3>Role-Based Access</h3>
            <p>Separate, secure portals for students, administrators, and guardians.</p>
            <ul className="feature-list">
              <li>Student, Admin &amp; Guardian roles</li>
              <li>Secure login with session control</li>
              <li>Audit trails for all actions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", transition: "background 0.35s ease,border-color 0.35s ease" }}>
        <section className="section reveal" id="how-it-works">
          <div className="section-header">
            <div className="section-label">Process</div>
            <h2 className="section-title">How MessMate works</h2>
            <p className="section-sub">A simple, four-step cycle that reduces waste every single day.</p>
          </div>
          <div className="steps-wrap">
            <div className="steps-line"></div>
            <div className="steps">
              {[
                { num: "01", title: "Students Mark Their Intention", desc: "Each student logs into MessMate and marks whether they'll eat or skip each upcoming meal before the cutoff time.", tag: "⏰ Auto-reminder sent 2 hours before cutoff" },
                { num: "02", title: "System Calculates Demand", desc: "Once the cutoff passes, MessMate aggregates all intentions and generates an expected headcount per meal.", tag: "📊 Real-time demand dashboard for admin" },
                { num: "03", title: "Kitchen Prepares Optimized Quantities", desc: "Armed with accurate headcounts, the mess team prepares precisely the right amount of food.", tag: "♻️ Average 25% waste reduction reported" },
                { num: "04", title: "Meal Consumed & Efficiency Tracked", desc: "Attendance is confirmed, waste is logged, and the data feeds the analytics engine.", tag: "📈 Continuous model improvement over time" },
              ].map(({ num, title, desc, tag }) => (
                <div className="step" key={num}>
                  <div className="step-num">{num}</div>
                  <div className="step-body">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <span className="step-tag">{tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CUTOFF TRACKER */}
      <div className="cutoff-section reveal">
        <div className="cutoff-wrap">
          <div className="cutoff-card">
            <div className="cutoff-header">
              <span className="cutoff-title">Today&apos;s Meal Cutoff Tracker</span>
              <span className="live-badge"><span className="live-dot"></span>Live</span>
            </div>
            <div className="cutoff-body">
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "10px" }}>Dinner intention window — closes at 3:00 PM</div>
                <div className="cutoff-bar"><div className="cutoff-fill"></div></div>
                <div className="cutoff-labels"><span>Window opened · 12:00 PM</span><span>Cutoff · 3:00 PM</span></div>
              </div>
              <div style={{ height: "24px" }}></div>
              <div className="meal-intention-grid">
                {[
                  { emoji: "🌅", meal: "Breakfast", time: "8:00 AM cutoff", fill: "94%", count: "287", total: "305", fillStyle: {} },
                  { emoji: "☀️", meal: "Lunch", time: "11:00 AM cutoff", fill: "88%", count: "268", total: "305", fillStyle: {} },
                  { emoji: "🌙", meal: "Dinner", time: "3:00 PM cutoff", fill: "65%", count: "198", total: "305", fillStyle: { background: "linear-gradient(90deg,var(--gold),var(--accent3))" } },
                  { emoji: "☕", meal: "Snacks", time: "Optional add-on", fill: "47%", count: "143", total: null, fillStyle: { background: "var(--accent2)" } },
                ].map(({ emoji, meal, time, fill, count, total, fillStyle }) => (
                  <div className="mi-card" key={meal}>
                    <div className="mi-meal">{emoji} {meal}</div>
                    <div className="mi-time">{time}</div>
                    <div className="mi-bar"><div className="mi-fill" style={{ width: fill, ...fillStyle }}></div></div>
                    <div className="mi-count">
                      <strong>{count}</strong> {total ? `/ ${total} responded` : "opted in today"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROLES */}
      <div className="roles-section">
        <section className="section reveal" id="roles">
          <div className="section-header">
            <div className="section-label">Who It&apos;s For</div>
            <h2 className="section-title">Built for everyone in the loop</h2>
            <p className="section-sub">Purpose-built experiences for each stakeholder.</p>
          </div>
          <div className="roles-grid">
            {[
              {
                badge: "badge-student", label: "Student", icon: "🎓", title: "Student Portal",
                desc: "A clean, mobile-friendly interface for marking meal intentions and tracking participation.",
                features: [["✅","Mark meal intentions daily"],["📊","View personal meal history"],["💰","Budget utilization tracker"],["🔔","Cutoff reminder notifications"]],
              },
              {
                badge: "badge-admin", label: "Administrator", icon: "⚙️", title: "Admin Dashboard",
                desc: "A powerful command center with live headcounts, waste tracking, and mess-wide analytics.",
                features: [["📈","Live demand & headcount view"],["♻️","Daily waste logging & trends"],["👥","Student management & rosters"],["📤","Export reports & data CSVs"]],
              },
              {
                badge: "badge-guardian", label: "Guardian", icon: "👨👩👦", title: "Guardian View",
                desc: "A transparent window into a student's meal participation — giving parents peace of mind.",
                features: [["📋","Monthly participation reports"],["💳","Fee vs consumed breakdown"],["📉","Skip rate tracking over time"],["📧","Email & PDF report delivery"]],
              },
            ].map(({ badge, label, icon, title, desc, features }) => (
              <div className="landing-role-card" key={label}>
                <span className={`role-badge ${badge}`}>{label}</span>
                <span className="role-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="role-features">
                  {features.map(([emoji, text]) => (
                    <div className="role-feature" key={text}><span>{emoji}</span><span>{text}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* STATS */}
      <div className="stats-section reveal" id="stats">
        <div className="stats-container">
          <div className="stat-item"><div className="stat-num" data-target="25">0%</div><div className="stat-label">Average Waste Reduction</div></div>
          <div className="stat-item"><div className="stat-num">100%</div><div className="stat-label">Meal Transparency</div></div>
          <div className="stat-item"><div className="stat-num">3</div><div className="stat-label">Secure Role Types</div></div>
          <div className="stat-item"><div className="stat-num">Real-Time</div><div className="stat-label">Live Analytics &amp; Tracking</div></div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section reveal">
        <div className="cta-wrap">
          <div className="section-label" style={{ textAlign: "center", marginBottom: "16px" }}>Ready to transform your campus mess?</div>
          <h2>Less waste.<br />More value. Starting today.</h2>
          <p>Set up your campus on MessMate in minutes. No hardware needed.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary" style={{ fontSize: "1rem", padding: "16px 32px" }}>
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/login" className="btn-secondary" style={{ fontSize: "1rem", padding: "16px 32px" }}>Login to Dashboard</Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Mess<span>Mate</span></div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">About</a>
          <a href="#">Docs</a>
        </div>
        <div className="footer-copy">© 2025 MessMate. All rights reserved.</div>
      </footer>
    </>
  );
}
