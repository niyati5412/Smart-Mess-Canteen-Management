import React, { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00', cutoffHour: 7, cutoffLabel: '7:00 AM' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00', cutoffHour: 11, cutoffLabel: '11:00 AM' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00', cutoffHour: 15, cutoffLabel: '3:00 PM' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30', cutoffHour: 15, cutoffLabel: '3:30 PM' },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [intentions, setIntentions] = useState([]);
  const [budget, setBudget] = useState({});
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchData(s.id);
    }
  }, [navigate]);

  const fetchData = async (studentId) => {
    try {
      const [iRes, bRes] = await Promise.all([
        fetch(`/api/intentions/student/${studentId}`),
        fetch('/api/budget')
      ]);
      const iData = await iRes.json();
      const bData = await bRes.json();
      setIntentions(iData);
      setBudget(bData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const isCutoffPassed = (meal) => new Date().getHours() >= meal.cutoffHour;

  const quickMark = async (mealId, action) => {
    if (isCutoffPassed(MEALS.find(m => m.id === mealId))) return;
    
    try {
      const res = await fetch('/api/intentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.id,
          studentName: session.name,
          meal: mealId,
          date: new Date().toISOString().split('T')[0],
          status: action === 'eat' ? 'eating' : 'skipping'
        })
      });
      if (res.ok) {
        fetchData(session.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIntentions = intentions.filter(i => i.date === todayStr);

  const monthStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const monthIntentions = intentions.filter(i => i.date.startsWith(monthStr));
  const eatingCount = monthIntentions.filter(i => i.status === 'eating').length;
  const skippingCount = monthIntentions.filter(i => i.status === 'skipping').length;
  const totalMarked = eatingCount + skippingCount;
  
  const messFee = budget.semesterFeePerStudent || 6000;
  const mealCost = budget.mealCostPerMeal || Math.round(messFee / 90);
  const valueConsumed = eatingCount * mealCost;
  const wasted = skippingCount * mealCost;
  const effPct = totalMarked ? Math.round((eatingCount / totalMarked) * 100) : 0;

  let streak = 0;
  const today = new Date();
  for (let d = today.getDate() - 1; d >= 1; d--) {
    const ds = `${todayStr.slice(0, 7)}-${String(d).padStart(2, '0')}`;
    const dayI = intentions.filter(i => i.date === ds);
    const allEat = ['breakfast','lunch','dinner'].every(m => dayI.find(i => i.meal === m && i.status === 'eating'));
    if (allEat) streak++; else break;
  }

  const arc = Math.round(effPct * 88 / 100);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <StudentSidebar session={session} />
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {session.name.split(' ')[0]} 👋</h1>
            <p>Here's your mess activity for today</p>
          </div>
        </div>

        <div className="content">
          <div className="ward-switcher">
            <div className="ward-card active">
              <div className="ward-av">
                {session?.profilePic && session.profilePic !== 'null' && session.profilePic !== 'undefined' ? (
                  <img src={session.profilePic.startsWith('http') ? session.profilePic : `http://localhost:3000/${session.profilePic.replace(/^\//, '')}`} alt="Profile" />
                ) : (
                  session?.name?.substring(0, 2).toUpperCase() || 'MB'
                )}
              </div>
              <div>
                <div className="ward-name">{session?.name || 'mikash bansal'}</div>
                <div className="ward-id">
                  {session?.id || session?._id ? `ID: ${session.id || session._id}` : 'Configure in Settings'}
                </div>
                <div className="ward-status">
                  <div className="status-dot" style={{ background: 'var(--accent)' }}></div>
                  <span style={{ color: 'var(--accent)' }}>
                    {session?.id || session?._id ? `${todayIntentions.filter(i => i.status === 'eating').length} meals eating` : 'No data'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="today-header">
            <h2>Today's Meals</h2>
          </div>

          <div className="meals-grid">
            {MEALS.map(m => {
              const intent = todayIntentions.find(i => i.meal === m.id);
              const locked = isCutoffPassed(m);
              
              return (
                <div key={m.id} className="meal-card">
                  <div className="meal-top"><span className="meal-emoji">{m.emoji}</span><span className="meal-time-chip">{m.time}</span></div>
                  <div className="meal-name">{m.name}</div>
                  <div className={`meal-cutoff ${locked ? 'closed' : 'urgent'}`} style={{marginBottom:'16px'}}>
                    {locked ? `Cutoff passed · ${m.cutoffLabel}` : `⏰ Cutoff at ${m.cutoffLabel}`}
                  </div>
                  
                  {locked && intent ? (
                    <div className={`meal-state ${intent.status === 'eating' ? 'eating' : 'skipping'}`}>
                      {intent.status === 'eating' ? '✓ Marked as Eating' : '✕ Marked as Skip'}
                    </div>
                  ) : locked ? (
                    <div className="meal-state" style={{background:'var(--surface2)', borderColor:'var(--border)', color:'var(--muted)'}}>
                      🔒 Not marked
                    </div>
                  ) : intent ? (
                    <>
                      <div className={`meal-state ${intent.status === 'eating' ? 'eating' : 'skipping'}`} style={{marginBottom:'8px'}}>
                        {intent.status === 'eating' ? '✓ Marked as Eating' : '✕ Marked as Skip'}
                      </div>
                      <div className="meal-actions">
                        <button className={`btn-eat ${intent.status === 'eating' ? 'selected' : ''}`} onClick={() => quickMark(m.id, 'eat')}>✓ Eat</button>
                        <button className={`btn-skip ${intent.status === 'skipping' ? 'selected' : ''}`} onClick={() => quickMark(m.id, 'skip')}>✕ Skip</button>
                      </div>
                    </>
                  ) : (
                    <div className="meal-actions">
                      <button className="btn-eat" onClick={() => quickMark(m.id, 'eat')}>✓ Eat</button>
                      <button className="btn-skip" onClick={() => quickMark(m.id, 'skip')}>✕ Skip</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">This Month — Meals Eaten</div><div className="stat-val" style={{color:'var(--accent)'}}>{eatingCount}</div><div className="stat-sub">out of {totalMarked} marked</div></div>
            <div className="stat-card"><div className="stat-label">Budget Efficiency</div><div className="stat-val" style={{color:'var(--gold)'}}>{effPct}%</div><div className="stat-sub">₹{valueConsumed} of ₹{messFee}</div></div>
            <div className="stat-card"><div className="stat-label">Meals Skipped</div><div className="stat-val" style={{color:'var(--danger)'}}>{skippingCount}</div><div className="stat-sub">this month</div></div>
            <div className="stat-card"><div className="stat-label">Streak — Days Eaten</div><div className="stat-val" style={{color:'var(--accent2)'}}>{streak}</div><div className="stat-sub">consecutive days</div></div>
          </div>
          
          <div className="lower-grid">
            <div className="panel">
               <div className="panel-head"><h3>Attendance Summary</h3></div>
               <div className="panel-body">
                  <div className="cal-nav">
                    <button className="cal-arr" onClick={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                        else setCalMonth(calMonth - 1);
                    }}>‹</button>
                    <div style={{fontWeight: 700, fontSize: '0.88rem'}}>
                        {new Date(calYear, calMonth).toLocaleString('default', { month: 'long' })} {calYear}
                    </div>
                    <button className="cal-arr" onClick={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                        else setCalMonth(calMonth + 1);
                    }}>›</button>
                  </div>
                  
                  <div className="cal-days-head" style={{marginBottom: '8px'}}>
                    {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                        <div key={d} className="cal-day-name">{d}</div>
                    ))}
                  </div>
                  
                  <div className="cal-grid">
                    {(() => {
                        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
                        const days = [];
                        const mStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
                        
                        for (let i = 0; i < firstDayIndex; i++) {
                            days.push(<div key={`empty-${i}`} className="cal-day other"></div>);
                        }
                        
                        for (let i = 1; i <= daysInMonth; i++) {
                            const dateStr = `${mStr}-${String(i).padStart(2, '0')}`;
                            const dayI = intentions.filter(intent => intent.date === dateStr);
                            let statusClass = '';
                            if (dayI.length > 0) {
                                const eats = dayI.filter(it => it.status === 'eating').length;
                                const skips = dayI.filter(it => it.status === 'skipping').length;
                                if (eats > 0 && skips === 0) statusClass = 'ate';
                                else if (skips > 0 && eats === 0) statusClass = 'skipped';
                                else if (eats > 0 && skips > 0) statusClass = 'partial';
                            }
                            
                            const isToday = dateStr === todayStr ? 'today' : '';
                            const isFuture = dateStr > todayStr ? 'future' : '';
                            
                            days.push(
                                <div key={i} className={`cal-day ${statusClass} ${isToday} ${isFuture}`}>
                                    {i}
                                </div>
                            );
                        }
                        return days;
                    })()}
                  </div>
                  
                  <div className="cal-legend">
                    <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent)'}}></div> Eaten</div>
                    <div className="legend-item"><div className="legend-dot" style={{background:'var(--danger)'}}></div> Skipped</div>
                    <div className="legend-item"><div className="legend-dot" style={{background:'var(--gold)'}}></div> Mixed</div>
                  </div>
               </div>
            </div>
            
            <div className="right-col">
              <div className="panel">
                <div className="panel-head"><h3>Budget Overview</h3></div>
                <div className="panel-body">
                   <div className="budget-ring-wrap">
                    <svg style={{width:'80px', height:'80px'}} viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f4c542" strokeWidth="4" strokeDasharray={`${arc} ${88 - arc}`} strokeDashoffset="25" strokeLinecap="round"/>
                      <text x="18" y="20" textAnchor="middle" fontSize="7" fill="var(--text)" fontWeight="800">{effPct}%</text>
                    </svg>
                    <div className="budget-stats">
                      <div><div style={{fontSize:'0.68rem',color:'var(--muted)'}}>Fees Paid</div><div style={{fontWeight:'700'}}>₹{messFee}</div></div>
                      <div><div style={{fontSize:'0.68rem',color:'var(--muted)'}}>Consumed</div><div style={{fontWeight:'700',color:'var(--gold)'}}>₹{valueConsumed}</div></div>
                    </div>
                  </div>
                  <div className="budget-breakdown">
                    <div className="bb-item"><span style={{display:'flex',alignItems:'center'}}><div className="bb-dot" style={{background:'var(--gold)'}}></div>Value consumed</span><span style={{color:'var(--gold)'}}>₹{valueConsumed}</span></div>
                    <div className="bb-item"><span style={{display:'flex',alignItems:'center'}}><div className="bb-dot" style={{background:'var(--danger)'}}></div>Skipped cost</span><span style={{color:'var(--danger)'}}>₹{wasted}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
