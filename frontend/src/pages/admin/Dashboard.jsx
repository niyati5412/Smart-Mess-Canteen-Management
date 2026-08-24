import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AdminSidebar from '../../components/AdminSidebar';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00', cutoffHour: 7, cutoffLabel: '7:00 AM' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00', cutoffHour: 11, cutoffLabel: '11:00 AM' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00', cutoffHour: 15, cutoffLabel: '3:00 PM' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30', cutoffHour: 15, cutoffLabel: '3:30 PM' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [uRes, iRes, fRes, wRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/intentions'),
        fetch('/api/feedback'),
        fetch('/api/waste')
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setStudents(uData.filter(u => u.role === 'student'));
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setIntentions(iData);
      }
      if (fRes.ok) {
        const fData = await fRes.json();
        setFeedback(fData);
      }
      if (wRes.ok) {
        const wData = await wRes.json();
        setWaste(wData);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  const totalStudents = students.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIntentions = intentions.filter(i => i.date === todayStr);

  const eatingCountToday = todayIntentions.filter(i => i.status === 'eating').length;
  const skippingCountToday = todayIntentions.filter(i => i.status === 'skipping').length;
  const totalMarkedToday = eatingCountToday + skippingCountToday;

  const maxMealsToday = totalStudents * 4;
  const overallParticipation = maxMealsToday > 0 ? Math.round((eatingCountToday / maxMealsToday) * 100) : 0;
  const pendingTotalToday = Math.max(0, maxMealsToday - totalMarkedToday);

  // Live feed from actual intentions
  const recentIntentions = [...intentions]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
            <p>Mess Management System · {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'short', day:'numeric' })}</p>
          </div>
          <div className="topbar-right">
            <Link to="/admin/menu" className="tb-btn">📋 Edit Menu</Link>
            <button className="tb-btn primary" onClick={() => window.print()}>⬇ Export Report</button>
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
            <div className="stat-card">
              <div className="sc-label">Total Students</div>
              <div className="sc-val" style={{color:'var(--accent)'}}>{totalStudents}</div>
              <div className="sc-sub"><span className="badge bb">Registered students</span></div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Today's Participation</div>
              <div className="sc-val" style={{color:'var(--accent2)'}}>{overallParticipation}%</div>
              <div className="sc-sub">{eatingCountToday} meals eating today</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Marked Intentions</div>
              <div className="sc-val" style={{color:'var(--gold)'}}>{totalMarkedToday}</div>
              <div className="sc-sub"><span className="badge bgo">{skippingCountToday} skipping</span></div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Waste Records</div>
              <div className="sc-val" style={{color:'var(--accent2)'}}>{waste.length}</div>
              <div className="sc-sub"><span className="badge bg">Logged records</span></div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Pending Intentions</div>
              <div className="sc-val" style={{color:'var(--danger)'}}>{pendingTotalToday}</div>
              <div className="sc-sub">unmarked today <span className="badge br">Awaiting response</span></div>
            </div>
          </div>

          <div style={{fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', fontWeight:'700', color:'var(--muted)', marginBottom:'10px', letterSpacing:'0.3px'}}>Today's Meal Intentions — Live</div>
          <div className="cutoff-row">
            {MEALS.map(m => {
              const mealInts = todayIntentions.filter(i => i.meal === m.id);
              const eatCount = mealInts.filter(i => i.status === 'eating').length;
              const skipCount = mealInts.filter(i => i.status === 'skipping').length;
              const pendingCount = Math.max(0, totalStudents - (eatCount + skipCount));
              const pct = totalStudents > 0 ? Math.round((eatCount / totalStudents) * 100) : 0;
              const closed = new Date().getHours() >= m.cutoffHour;

              return (
                <div key={m.id} className="cutoff-card" style={!closed ? {borderColor:'rgba(0,184,255,0.25)'} : {}}>
                  <div className="cc-top">
                    <span className="cc-emoji">{m.emoji}</span>
                    <span className={`pill ${closed ? 'pill-muted' : 'pill-blue'}`}>{closed ? 'Closed' : '● Live'}</span>
                  </div>
                  <div className="cc-name">{m.name}</div>
                  <div className="cc-cutoff">{closed ? `Cutoff passed · ${m.cutoffLabel}` : `Cutoff at ${m.cutoffLabel}`}</div>
                  <div className="cc-prog-wrap">
                    <div className="cc-prog" style={{width: `${pct}%`, background: 'var(--accent2)'}}></div>
                  </div>
                  <div className="cc-counts">
                    <span className="cc-eat">{eatCount} eating</span>
                    <span className="cc-skip">{skipCount} skip</span>
                    <span className="cc-total" style={{color:'var(--gold)'}}>{pendingCount} pending</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lower-grid">
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h3>Live Intention Feed</h3>
                  <span style={{fontSize:'0.68rem', color:'var(--accent)', display:'flex', alignItems:'center', gap:'4px'}}>
                    <span style={{width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 6px var(--accent)'}}></span> Auto-updating
                  </span>
                </div>
                <div className="admin-panel-body" style={{padding:'0 18px'}}>
                  <div className="feed-list">
                    {recentIntentions.length === 0 ? (
                      <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'0.82rem'}}>No recent intentions marked yet.</div>
                    ) : (
                      recentIntentions.map(i => (
                        <div key={i._id || Math.random()} className="feed-item">
                          <div className="feed-dot" style={{background: i.status === 'eating' ? 'var(--accent)' : 'var(--danger)'}}></div>
                          <div className="feed-body">
                            <div className="feed-text">{i.studentName || 'Student'} marked {i.meal} — <strong>{i.status === 'eating' ? 'Eating' : 'Skipping'}</strong></div>
                            <div className="feed-time">{i.date}</div>
                          </div>
                          <span className="feed-badge" style={{background: i.status === 'eating' ? 'rgba(0,229,160,0.1)' : 'rgba(255,71,87,0.1)', color: i.status === 'eating' ? 'var(--accent)' : 'var(--danger)'}}>
                            {i.status === 'eating' ? 'Eat' : 'Skip'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              <div className="panel">
                <div className="panel-head"><h3>Quick Actions</h3></div>
                <div className="panel-body">
                  <div className="qa-grid">
                    <Link to="/admin/menu" style={{textDecoration:'none', color:'inherit'}} className="qa-btn">
                      <span className="qa-icon">📋</span>
                      <div className="qa-name">Edit Menu</div>
                      <div className="qa-sub">Update today's meals</div>
                    </Link>
                    <Link to="/admin/budget" style={{textDecoration:'none', color:'inherit'}} className="qa-btn">
                      <span className="qa-icon">💰</span>
                      <div className="qa-name">Budget</div>
                      <div className="qa-sub">View financials</div>
                    </Link>
                    <Link to="/admin/waste" style={{textDecoration:'none', color:'inherit'}} className="qa-btn">
                      <span className="qa-icon">♻️</span>
                      <div className="qa-name">Log Waste</div>
                      <div className="qa-sub">Record waste data</div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h3>Active Alerts & Feedback</h3></div>
                <div className="panel-body" style={{paddingTop:'6px', paddingBottom:'6px'}}>
                  {feedback.length === 0 ? (
                    <div style={{padding:'12px', color:'var(--muted)', fontSize:'0.8rem'}}>No pending student feedback alerts.</div>
                  ) : (
                    feedback.slice(0, 3).map(f => (
                      <div key={f._id || Math.random()} className="alert-item">
                        <div className="alert-icon" style={{background:'rgba(0,184,255,0.1)'}}>💬</div>
                        <div>
                          <div className="alert-text">{f.subject || f.category || 'Feedback'} ({f.studentName || 'Student'})</div>
                          <div className="alert-sub">{f.comments || f.message || 'New feedback received'}</div>
                        </div>
                      </div>
                    ))
                  )}
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
