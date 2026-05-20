import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
    }
  }, [navigate]);

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
            <p>NIT Hamirpur · {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'short', day:'numeric' })} · Dinner cutoff in <span style={{color:'var(--gold)', fontWeight: 600}}>1h 42m</span></p>
          </div>
          <div className="topbar-right">
            <Link to="#" className="tb-btn">📋 Edit Menu</Link>
            <button className="tb-btn primary">⬇ Export Report</button>
          </div>
        </div>

        <div className="content">
          <div className="ward-switcher">
            <div className="ward-card active" style={{ borderColor: 'rgba(0, 184, 255, 0.35)', background: 'rgba(0, 184, 255, 0.05)' }}>
              <div className="ward-av" style={{ background: 'linear-gradient(135deg, #0b1e36, #00b8ff)' }}>
                {session?.profilePic && session.profilePic !== 'null' && session.profilePic !== 'undefined' ? (
                  <img src={session.profilePic.startsWith('http') ? session.profilePic : `http://localhost:3000/${session.profilePic.replace(/^\//, '')}`} alt="Profile" />
                ) : (
                  session?.name?.substring(0, 2).toUpperCase() || 'AD'
                )}
              </div>
              <div>
                <div className="ward-name">{session?.name || 'Admin'}</div>
                <div className="ward-id">
                  {session?.id || session?._id ? `ID: ${session.id || session._id}` : 'Configure in Settings'}
                </div>
                <div className="ward-status">
                  <div className="status-dot" style={{ background: 'var(--accent2)' }}></div>
                  <span style={{ color: 'var(--accent2)' }}>Admin Panel Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card"><div className="sc-label">Total Students</div><div className="sc-val" style={{color:'var(--accent)'}}>342</div><div className="sc-sub"><span className="badge bb">+8 this month</span></div></div>
            <div className="stat-card"><div className="sc-label">Today's Participation</div><div className="sc-val" style={{color:'var(--accent2)'}}>78%</div><div className="sc-sub">267 / 342 eating breakfast</div></div>
            <div className="stat-card"><div className="sc-label">Avg Efficiency</div><div className="sc-val" style={{color:'var(--gold)'}}>87%</div><div className="sc-sub"><span className="badge bgo">↑ 3% vs last month</span></div></div>
            <div className="stat-card"><div className="sc-label">Waste Index Today</div><div className="sc-val" style={{color:'var(--accent2)'}}>4.2%</div><div className="sc-sub"><span className="badge bg">↓ Low waste</span></div></div>
            <div className="stat-card"><div className="sc-label">Pending Intentions</div><div className="sc-val" style={{color:'var(--danger)'}}>38</div><div className="sc-sub">unmarked for dinner <span className="badge br">Action needed</span></div></div>
          </div>

          <div style={{fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', fontWeight:'700', color:'var(--muted)', marginBottom:'10px', letterSpacing:'0.3px'}}>Today's Meal Intentions — Live</div>
          <div className="cutoff-row">
            <div className="cutoff-card">
              <div className="cc-top"><span className="cc-emoji">🌅</span><span className="pill pill-muted">Closed</span></div>
              <div className="cc-name">Breakfast</div><div className="cc-cutoff">Cutoff passed · 7:00 AM</div>
              <div className="cc-prog-wrap"><div className="cc-prog" style={{width:'78%', background:'var(--accent2)'}}></div></div>
              <div className="cc-counts"><span className="cc-eat">267 eating</span><span className="cc-skip">58 skip</span><span className="cc-total">17 no response</span></div>
            </div>
            <div className="cutoff-card">
              <div className="cc-top"><span className="cc-emoji">☀️</span><span className="pill pill-muted">Closed</span></div>
              <div className="cc-name">Lunch</div><div className="cc-cutoff">Cutoff passed · 11:00 AM</div>
              <div className="cc-prog-wrap"><div className="cc-prog" style={{width:'71%', background:'var(--accent2)'}}></div></div>
              <div className="cc-counts"><span className="cc-eat">243 eating</span><span className="cc-skip">74 skip</span><span className="cc-total">25 no response</span></div>
            </div>
            <div className="cutoff-card" style={{borderColor:'rgba(0,184,255,0.25)'}}>
              <div className="cc-top"><span className="cc-emoji">🌙</span><span className="pill pill-blue">● Live</span></div>
              <div className="cc-name">Dinner</div><div className="cc-cutoff">⏰ Cutoff at 3:00 PM · 1h 42m left</div>
              <div className="cc-prog-wrap"><div className="cc-prog" style={{width:'63%', background:'var(--accent)'}}></div></div>
              <div className="cc-counts"><span className="cc-eat">214 eating</span><span className="cc-skip">50 skip</span><span className="cc-total" style={{color:'var(--gold)'}}>78 pending</span></div>
            </div>
            <div className="cutoff-card">
              <div className="cc-top"><span className="cc-emoji">☕</span><span className="pill pill-blue">Open</span></div>
              <div className="cc-name">Snacks</div><div className="cc-cutoff">Cutoff at 3:30 PM</div>
              <div className="cc-prog-wrap"><div className="cc-prog" style={{width:'55%', background:'#a020f0'}}></div></div>
              <div className="cc-counts"><span className="cc-eat">188 opted in</span><span className="cc-skip">62 skip</span><span className="cc-total" style={{color:'var(--gold)'}}>92 pending</span></div>
            </div>
          </div>

          <div className="lower-grid">
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              <div className="panel">
                <div className="panel-head"><h3>Week Participation Trend</h3></div>
                <div className="panel-body">
                  <div className="mini-bar-chart">
                    <div className="mb-col"><div className="mb-fill" style={{height:'82%', background:'var(--accent)'}}></div><span className="mb-lbl">Mon</span></div>
                    <div className="mb-col"><div className="mb-fill" style={{height:'75%', background:'var(--accent)'}}></div><span className="mb-lbl">Tue</span></div>
                    <div className="mb-col"><div className="mb-fill" style={{height:'88%', background:'var(--accent)'}}></div><span className="mb-lbl">Wed</span></div>
                    <div className="mb-col"><div className="mb-fill" style={{height:'91%', background:'var(--accent)'}}></div><span className="mb-lbl">Thu</span></div>
                    <div className="mb-col"><div className="mb-fill" style={{height:'78%', background:'var(--accent)'}}></div><span className="mb-lbl">Fri</span></div>
                  </div>
                  <div className="trend-stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginTop:'16px', borderTop:'1px solid var(--border)', paddingTop:'16px'}}>
                    <div className="ts-item" style={{textAlign:'center', background:'var(--surface2)', padding:'10px 4px', borderRadius:'10px'}}><div className="ts-val" style={{color:'var(--accent)', fontSize:'1.1rem', fontWeight:'800'}}>83%</div><div className="ts-lbl" style={{fontSize:'0.65rem', color:'var(--muted)', marginTop:'2px'}}>Avg this week</div></div>
                    <div className="ts-item" style={{textAlign:'center', background:'var(--surface2)', padding:'10px 4px', borderRadius:'10px'}}><div className="ts-val" style={{color:'var(--gold)', fontSize:'1.1rem', fontWeight:'800'}}>3.2%</div><div className="ts-lbl" style={{fontSize:'0.65rem', color:'var(--muted)', marginTop:'2px'}}>Avg waste</div></div>
                    <div className="ts-item" style={{textAlign:'center', background:'var(--surface2)', padding:'10px 4px', borderRadius:'10px'}}><div className="ts-val" style={{color:'var(--accent2)', fontSize:'1.1rem', fontWeight:'800'}}>₹8,420</div><div className="ts-lbl" style={{fontSize:'0.65rem', color:'var(--muted)', marginTop:'2px'}}>Daily avg cost</div></div>
                    <div className="ts-item" style={{textAlign:'center', background:'var(--surface2)', padding:'10px 4px', borderRadius:'10px'}}><div className="ts-val" style={{color:'var(--accent)', fontSize:'1.1rem', fontWeight:'800'}}>5</div><div className="ts-lbl" style={{fontSize:'0.65rem', color:'var(--muted)', marginTop:'2px'}}>New feedbacks</div></div>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-head"><h3>Live Intention Feed</h3><span style={{fontSize:'0.68rem', color:'var(--accent)', display:'flex', alignItems:'center', gap:'4px'}}><span style={{width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 6px var(--accent)'}}></span> Auto-updating</span></div>
                <div className="admin-panel-body" style={{padding:'0 18px'}}>
                  <div className="feed-list">
                    <div className="feed-item"><div className="feed-dot" style={{background:'var(--accent)'}}></div><div className="feed-body"><div className="feed-text">Kavita Nair marked Dinner — <strong>Eating</strong></div><div className="feed-time">2 min ago · 2024EC081</div></div><span className="feed-badge" style={{background:'rgba(0,229,160,0.1)', color:'var(--accent)'}}>Eat</span></div>
                    <div className="feed-item"><div className="feed-dot" style={{background:'var(--danger)'}}></div><div className="feed-body"><div className="feed-text">Rohit Verma marked Dinner — <strong>Skipping</strong></div><div className="feed-time">5 min ago · 2023ME042</div></div><span className="feed-badge pill-red">Skip</span></div>
                    <div className="feed-item"><div className="feed-dot" style={{background:'var(--accent)'}}></div><div className="feed-body"><div className="feed-text">Sneha Agarwal marked Dinner — <strong>Eating</strong></div><div className="feed-time">8 min ago · 2024CS107</div></div><span className="feed-badge" style={{background:'rgba(0,229,160,0.1)', color:'var(--accent)'}}>Eat</span></div>
                    <div className="feed-item"><div className="feed-dot" style={{background:'var(--accent2)'}}></div><div className="feed-body"><div className="feed-text">Aman Khan marked Snacks — <strong>Opted In</strong></div><div className="feed-time">11 min ago · 2024PH033</div></div><span className="feed-badge" style={{background:'rgba(0,184,255,0.1)', color:'var(--accent2)'}}>Opt</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              <div className="panel">
                <div className="panel-head"><h3>Quick Actions</h3></div>
                <div className="panel-body">
                  <div className="qa-grid">
                    <div className="qa-btn"><span className="qa-icon">📋</span><div className="qa-name">Edit Menu</div><div className="qa-sub">Update today's meals</div></div>
                    <div className="qa-btn"><span className="qa-icon">🔔</span><div className="qa-name">Send Reminder</div><div className="qa-sub">78 pending intentions</div></div>
                    <div className="qa-btn"><span className="qa-icon">📊</span><div className="qa-name">Generate Report</div><div className="qa-sub">Monthly PDF</div></div>
                    <div className="qa-btn"><span className="qa-icon">♻️</span><div className="qa-name">Log Waste</div><div className="qa-sub">Record today's waste</div></div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h3>Active Alerts</h3></div>
                <div className="panel-body" style={{paddingTop:'6px', paddingBottom:'6px'}}>
                  <div className="alert-item"><div className="alert-icon" style={{background:'rgba(255,71,87,0.1)'}}>🚨</div><div><div className="alert-text">78 students haven't marked dinner</div><div className="alert-sub">Cutoff in 1h 42m — send nudge?</div></div></div>
                  <div className="alert-item"><div className="alert-icon" style={{background:'rgba(244,197,66,0.1)'}}>⚠️</div><div><div className="alert-text">Waste above 5% on Tuesday</div><div className="alert-sub">Lunch — 12.4 kg unserved food</div></div></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
