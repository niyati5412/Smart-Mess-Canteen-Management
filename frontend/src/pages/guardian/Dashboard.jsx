import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuardianSidebar from '../../components/GuardianSidebar';
import './Dashboard.css';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30' },
];

const GuardianDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [wardData, setWardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [wardInput, setWardInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkWard = async () => {
    if (!wardInput.trim()) return;
    setLinkError('');
    setIsLinking(true);
    try {
      const res = await fetch('/api/auth/link-ward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: session.id || session._id,
          wardStudentId: wardInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('mm_session', JSON.stringify(data.user));
        setSession(data.user);
        fetchData(data.user.wardStudentId || data.user.wardId);
      } else {
        setLinkError(data.message || 'Failed to link ward');
      }
    } catch (err) {
      console.error(err);
      setLinkError('Error connecting to the server');
    } finally {
      setIsLinking(false);
    }
  };

  const MEAL_COST = 67;
  const SEMESTER_FEE = 6000;

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'guardian') {
      navigate('/login');
    } else {
      setSession(s);
      fetchData(s.wardStudentId || s.wardId);
    }
  }, [navigate]);

  const fetchData = async (wardId) => {
    if (!wardId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/intentions/student/${wardId}`);
      if (res.ok) {
        const data = await res.json();
        setWardData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  const initials = session.name ? session.name.substring(0, 2).toUpperCase() : 'G';
  const wardName = session.wardName || 'Your Ward';
  const wardId = session.wardStudentId || session.wardId || null;
  const wardInitials = wardName.substring(0, 2).toUpperCase();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIntentions = wardData.filter(i => (i.date || '').startsWith(todayStr));
  
  const monthStr = todayStr.substring(0, 7);
  const monthIntentions = wardData.filter(i => (i.date || '').startsWith(monthStr));
  
  const eatingCount = monthIntentions.filter(i => i.status === 'eating' || i.willEat).length;
  const skippingCount = monthIntentions.filter(i => i.status === 'skipping' || i.willEat === false).length;
  
  const maxPossible = new Date().getDate() * 4;
  const efficiency = maxPossible > 0 ? Math.round((eatingCount / maxPossible) * 100) : 0;
  const consumed = eatingCount * MEAL_COST;
  const wasted = skippingCount * MEAL_COST;

  // Streak Calculation
  let streak = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  for (let i = 0; i < 60; i++) {
    const ds = d.toISOString().split('T')[0];
    const dayIntentions = wardData.filter(x => (x.date||'').startsWith(ds));
    const allEat = ['breakfast','lunch','dinner'].every(m => dayIntentions.find(x => (x.meal === m || x.mealType === m) && (x.status === 'eating' || x.willEat)));
    if (allEat) streak++; else break;
    d.setDate(d.getDate() - 1);
  }

  const arc = Math.round((consumed / SEMESTER_FEE) * 100);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <GuardianSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Guardian Dashboard</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Monitoring {wardName}'s mess activity</span>
              <span style={{ color: 'var(--muted)' }}>•</span>
              <span style={{ color: 'var(--gold)', fontWeight: 500 }}>Logged in as: {session?.name} (ID: {session?.id || session?._id})</span>
            </p>
          </div>
          <div className="topbar-right">
            <span style={{fontSize:'0.72rem', color:'var(--muted)', background:'var(--surface2)', border:'1px solid var(--border)', padding:'6px 12px', borderRadius:'8px'}}>
              {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
            </span>
          </div>
        </div>

        <div className="content">
          {!session?.wardStudentId && (
            <div className="panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(244, 197, 66, 0.3)', background: 'var(--surface)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--gold)', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>🔗 Link Your Ward</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Enter your ward's student ID (found on their MessMate Student profile) to sync and track their live mess and canteen activity.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Enter Student ID (e.g. 6a031de06e9d818f...)" 
                  value={wardInput}
                  onChange={(e) => setWardInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '250px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: '#fff',
                    outline: 'none'
                  }} 
                />
                <button 
                  onClick={handleLinkWard}
                  disabled={isLinking}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'var(--gold)',
                    color: '#000',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {isLinking ? 'Linking...' : 'Link Ward'}
                </button>
              </div>
              {linkError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '10px' }}>{linkError}</div>}
            </div>
          )}

          <div className="ward-switcher">
            {/* Guardian Profile Card */}
            <div className="ward-card" style={{ borderColor: 'rgba(244, 197, 66, 0.35)', background: 'rgba(244, 197, 66, 0.03)', cursor: 'default' }}>
              <div className="ward-av" style={{ background: 'linear-gradient(135deg, #2a1f04, #f4c542)', color: 'rgba(255, 255, 255, 0.9)' }}>{initials}</div>
              <div>
                <div className="ward-name" style={{ color: 'var(--gold)' }}>{session?.name} (You)</div>
                <div className="ward-id">ID: {session?.id || session?._id}</div>
                <div className="ward-status">
                  <div className="status-dot" style={{ background: 'var(--gold)' }}></div>
                  <span style={{ color: 'var(--gold)' }}>Guardian Account</span>
                </div>
              </div>
            </div>

            {/* Ward Profile Card */}
            <div className="ward-card active">
              <div className="ward-av">{wardInitials}</div>
              <div>
                <div className="ward-name">{wardName}</div>
                <div className="ward-id">{wardId ? `ID: ${wardId}` : 'Configure in Settings'}</div>
                <div className="ward-status">
                  <div className="status-dot" style={{background:'var(--accent)'}}></div>
                  <span style={{color:'var(--accent)'}}>{wardId ? `${eatingCount} meals eating` : 'No data'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-label">Meals This Month</div><div className="stat-val" style={{color:'var(--accent3)'}}>{eatingCount}</div><div className="stat-sub">of {maxPossible} possible this month</div></div>
            <div className="stat-card"><div className="stat-label">Budget Efficiency</div><div className="stat-val" style={{color:'var(--accent)'}}>{efficiency}%</div><div className="stat-sub">₹{consumed} of ₹{SEMESTER_FEE}</div></div>
            <div className="stat-card"><div className="stat-label">Meals Skipped</div><div className="stat-val" style={{color:'var(--danger)'}}>{skippingCount}</div><div className="stat-sub">₹{wasted} in skipped meals</div></div>
            <div className="stat-card"><div className="stat-label">Current Streak</div><div className="stat-val" style={{color:'var(--accent2)'}}>{streak}</div><div className="stat-sub">days eating all meals 🔥</div></div>
          </div>

          <div className="today-panel">
            <div className="tp-top">
              <div className="tp-title">Today's Meal Status</div>
              <div className="tp-date">{new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'})}</div>
            </div>
            <div className="meals-row">
              {MEALS.map(m => {
                const intent = todayIntentions.find(i => (i.meal === m.id || i.mealType === m.id));
                const isEating = intent && (intent.status === 'eating' || intent.willEat);
                const isSkipping = intent && (intent.status === 'skipping' || intent.willEat === false);

                return (
                  <div key={m.id} className={`meal-box ${isEating ? 'eating' : isSkipping ? 'skipping' : ''}`}>
                    <div className="mb-top"><span className="mb-emoji">{m.emoji}</span><span style={{fontSize:'0.6rem', color:'var(--muted)'}}>{m.time}</span></div>
                    <div className="mb-name">{m.name}</div>
                    {isEating ? (
                      <><div className="mb-state eating">✓ Eating</div><div className="mb-time">Marked today</div></>
                    ) : isSkipping ? (
                      <><div className="mb-state skipping">✕ Skipping</div><div className="mb-time">Marked today</div></>
                    ) : (
                      <><div className="mb-state pending">⏳ Not marked</div><div className="mb-time">Awaiting student input</div></>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lower-grid">
            <div className="panel">
              <div className="panel-head"><h3>Attendance — {new Date().toLocaleDateString('en-IN', {month:'long', year:'numeric'})}</h3></div>
              <div className="panel-body">
                <div style={{color:'var(--muted)', textAlign:'center', padding:'40px'}}>
                  Detailed calendar rendering logic ported from backend.
                </div>
              </div>
            </div>

            <div className="right-col">
              <div className="panel">
                <div className="panel-head"><h3>Budget Overview</h3></div>
                <div className="panel-body">
                  <div className="budget-wrap">
                    <svg className="donut-svg" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f4c542" strokeWidth="4" strokeDasharray={`${arc} ${100 - arc}`} strokeDashoffset="25" strokeLinecap="round" />
                      <text x="18" y="19.5" textAnchor="middle" fontSize="6.5" fill="var(--text)" fontWeight="800">{efficiency}%</text>
                    </svg>
                    <div className="bstats">
                      <div><div className="bs-label">Fee Paid</div><div className="bs-val">₹{SEMESTER_FEE}</div></div>
                      <div><div className="bs-label">Value Consumed</div><div className="bs-val" style={{color:'var(--accent2)'}}>₹{consumed}</div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h3>Recent Alerts</h3></div>
                <div className="panel-body">
                  <div className="alert-list">
                    {skippingCount > 0 && (
                      <div className="alert-item">
                        <div className="alert-icon bad">📉</div>
                        <div>
                          <div className="alert-text">Meals skipped recently</div>
                          <div className="alert-sub">Ward skipped {skippingCount} meals this month</div>
                        </div>
                      </div>
                    )}
                    {streak >= 3 && (
                      <div className="alert-item">
                        <div className="alert-icon good">🔥</div>
                        <div>
                          <div className="alert-text">{streak}-day full attendance streak!</div>
                          <div className="alert-sub">All meals eaten consistently</div>
                        </div>
                      </div>
                    )}
                    <div className="alert-item">
                      <div className="alert-icon info">📊</div>
                      <div>
                        <div className="alert-text">Monthly report available</div>
                        <div className="alert-sub">Download CSV from report section below</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-card">
            <div className="rc-icon">📋</div>
            <div>
              <div className="rc-title">{new Date().toLocaleDateString('en-IN', {month:'long', year:'numeric'})} Activity Report</div>
              <div className="rc-sub">{eatingCount} meals eaten, {skippingCount} skipped. Budget efficiency: {efficiency}%.</div>
              <button className="btn-dl">⬇ Download CSV</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
