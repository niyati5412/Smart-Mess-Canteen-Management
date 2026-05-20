import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Intention.css';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00', cutoffHour: 7, cutoffLabel: '7:00 AM' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00', cutoffHour: 11, cutoffLabel: '11:00 AM' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00', cutoffHour: 15, cutoffLabel: '3:00 PM' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30', cutoffHour: 15, cutoffLabel: '3:30 PM' },
];

const StudentIntention = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [dbIntentions, setDbIntentions] = useState([]); // from API
  const [drafts, setDrafts] = useState({}); // local changes before saving
  
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  
  const [timeNow, setTimeNow] = useState(new Date());
  
  const [toasts, setToasts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchIntentions(s.id);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchIntentions = async (studentId) => {
    try {
      const res = await fetch(`/api/intentions/student/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setDbIntentions(data);
        
        // Populate drafts for selected date based on DB
        const todayStr = new Date().toISOString().split('T')[0];
        const initialDrafts = {};
        data.filter(i => i.date === todayStr).forEach(i => {
          initialDrafts[i.meal] = i.status === 'eating' ? 'eat' : 'skip';
        });
        setDrafts(initialDrafts);
      }
    } catch (e) {
      console.error("Could not fetch intentions", e);
      addToast('⚠️ Could not load intentions', 'var(--danger)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  const addToast = (msg, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const isCutoffPassed = (meal, dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) return true; // past days are locked
    if (dateStr > todayStr) return false; // future days are open
    return timeNow.getHours() >= meal.cutoffHour; // today depends on hour
  };

  // derived state for banner
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMeal = MEALS.find(m => !isCutoffPassed(m, todayStr));
  let bannerState = {};
  if (!nextMeal) {
    bannerState = { closed: true, text: "All cutoffs passed — no more changes today", timer: "—" };
  } else {
    const cutoff = new Date(); cutoff.setHours(nextMeal.cutoffHour, 0, 0, 0);
    const diff = cutoff - timeNow;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    bannerState = { 
      closed: false, 
      text: <span><strong>{nextMeal.name} cutoff</strong> closes at {nextMeal.cutoffLabel} — mark your intention now</span>,
      timer: h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`
    };
  }

  // week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diffToMonday = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diffToMonday));
    monday.setDate(monday.getDate() + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekOffset]);

  const changeWeek = (dir) => {
    setWeekOffset(prev => prev + dir);
  };

  const handleDaySelect = (dStr) => {
    setSelectedDateStr(dStr);
    const newDrafts = {};
    dbIntentions.filter(i => i.date === dStr).forEach(i => {
      newDrafts[i.meal] = i.status === 'eating' ? 'eat' : 'skip';
    });
    setDrafts(newDrafts);
  };

  const toggleIntention = (mealId) => {
    const meal = MEALS.find(m => m.id === mealId);
    if (isCutoffPassed(meal, selectedDateStr)) {
      addToast(`🔒 ${meal.name} cutoff has passed`, 'var(--danger)');
      return;
    }
    setDrafts(prev => {
      const current = prev[mealId];
      if (current === 'eat') return { ...prev, [mealId]: 'skip' };
      if (current === 'skip') return { ...prev, [mealId]: 'eat' };
      return { ...prev, [mealId]: 'eat' };
    });
  };

  const setSpecificIntention = (mealId, action) => {
    const meal = MEALS.find(m => m.id === mealId);
    if (isCutoffPassed(meal, selectedDateStr)) {
      addToast(`🔒 ${meal.name} cutoff has passed`, 'var(--danger)');
      return;
    }
    setDrafts(prev => ({
      ...prev,
      [mealId]: prev[mealId] === action ? null : action
    }));
  };

  const saveAll = async () => {
    setIsSaving(true);
    let saved = 0, errors = 0;
    
    for (const m of MEALS) {
      if (isCutoffPassed(m, selectedDateStr)) continue;
      const action = drafts[m.id];
      if (!action) continue;
      try {
        const res = await fetch('/api/intentions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            studentId: session.id, 
            studentName: session.name, 
            meal: m.id, 
            date: selectedDateStr, 
            status: action === 'eat' ? 'eating' : 'skipping' 
          })
        });
        if (!res.ok) throw new Error(res.status);
        saved++;
      } catch (e) {
        errors++;
      }
    }
    
    if (errors === 0) addToast(`✅ ${saved} intentions saved`, 'var(--accent)');
    else addToast(`⚠️ ${saved} saved, ${errors} failed`, 'var(--gold)');
    
    await fetchIntentions(session.id);
    setIsSaving(false);
  };

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  // Mini stats based on selected date drafts
  const eatingCount = MEALS.filter(m => drafts[m.id] === 'eat').length;
  const skippingCount = MEALS.filter(m => drafts[m.id] === 'skip').length;
  const totalMarked = eatingCount + skippingCount;
  
  const openMealsCount = MEALS.filter(m => !isCutoffPassed(m, selectedDateStr)).length;

  const renderHistoryTable = (dates) => {
    return dates.map(d => {
      const ds = d.toISOString().split('T')[0];
      const dayData = dbIntentions.filter(x => x.date === ds);
      
      return (
        <tr key={ds}>
          <td>{d.toDateString().slice(0,10)}</td>
          {MEALS.map(m => {
            const f = dayData.find(i => i.meal === m.id);
            if (!f) return <td key={m.id}><span className="pill pill-muted">—</span></td>;
            if (f.status === 'eating') return <td key={m.id}><span className="pill pill-green">Eat</span></td>;
            return <td key={m.id}><span className="pill pill-red">Skip</span></td>;
          })}
        </tr>
      );
    });
  };

  const getDayDotClass = (dStr) => {
    const dayData = dbIntentions.filter(x => x.date === dStr);
    const count = dayData.length;
    if (count === 4) return 'dot-all';
    if (count > 0) return 'dot-partial';
    return 'dot-empty';
  };

  return (
    <div className="intention-container">
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Meal Intentions</h1>
            <p>Mark your plans before cutoff — help the kitchen prepare right</p>
          </div>
        </div>

        <div className="content">
          <div className="cutoff-banner" style={bannerState.closed ? {background:'rgba(255,71,87,.06)', borderColor:'rgba(255,71,87,.2)'} : {}}>
            <div className="cb-dot" style={bannerState.closed ? {background:'var(--danger)', animation:'none'} : {}}></div>
            <div className="cb-text">{bannerState.text}</div>
            <div className="cb-timer">{bannerState.timer}</div>
          </div>

          <div className="mini-stats">
            <div className="mini-stat"><div className="ms-label">This day — Marked</div><div className="ms-val" style={{color:'var(--accent)'}}>{totalMarked}</div></div>
            <div className="mini-stat"><div className="ms-label">Eating</div><div className="ms-val" style={{color:'var(--accent)'}}>{eatingCount}</div></div>
            <div className="mini-stat"><div className="ms-label">Skipping</div><div className="ms-val" style={{color:'var(--danger)'}}>{skippingCount}</div></div>
            <div className="mini-stat"><div className="ms-label">Unmarked</div><div className="ms-val" style={{color:'var(--gold)'}}>{MEALS.length - totalMarked}</div></div>
          </div>

          <div className="week-nav">
            <button className="wn-arr" onClick={() => changeWeek(-1)}>‹</button>
            <div className="wn-days">
              {weekDates.map((d, i) => {
                const dStr = d.toISOString().split('T')[0];
                const isSelected = selectedDateStr === dStr;
                const isToday = todayStr === dStr;
                return (
                  <div key={i} className={`wn-day ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`} onClick={() => handleDaySelect(dStr)}>
                    <div className="wn-day-name">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</div>
                    <div className="wn-day-num">{d.getDate()}</div>
                    <div className={`wn-day-dot ${getDayDotClass(dStr)}`}></div>
                  </div>
                );
              })}
            </div>
            <div className="wn-label">{weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weekOffset === 1 ? 'Next Week' : 'Other Week'}</div>
            <button className="wn-arr" onClick={() => changeWeek(1)}>›</button>
          </div>

          <div className="day-grid">
            {MEALS.map(m => {
              const intent = drafts[m.id];
              const locked = isCutoffPassed(m, selectedDateStr);
              return (
                <div key={m.id} className={`intention-card ${intent ? 'state-' + intent : ''}`}>
                  <div className="ic-top"><span className="ic-emoji">{m.emoji}</span><span className="ic-time">{m.time}</span></div>
                  <div className="ic-name">{m.name}</div>
                  <div className={`ic-cutoff ${locked ? 'closed' : 'open'}`}>
                    {locked ? `🔒 Cutoff passed · ${m.cutoffLabel}` : `⏰ Cutoff at ${m.cutoffLabel}`}
                  </div>
                  
                  <div className="ic-actions">
                    {locked && intent ? (
                      <>
                        <button className={`ic-btn eat-btn ${intent==='eat'?'selected':''}`} disabled>✓ I'm Eating</button>
                        <button className={`ic-btn skip-btn ${intent==='skip'?'selected':''}`} disabled>✕ Skipping</button>
                      </>
                    ) : locked ? (
                      <div className="ic-locked"><div className="lock">🔒</div><span style={{opacity:0.6}}>Not marked</span></div>
                    ) : (
                      <>
                        <button className={`ic-btn eat-btn ${intent==='eat'?'selected':''}`} onClick={() => setSpecificIntention(m.id, 'eat')}>✓ I'm Eating</button>
                        <button className={`ic-btn skip-btn ${intent==='skip'?'selected':''}`} onClick={() => setSpecificIntention(m.id, 'skip')}>✕ Skipping</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-grid">
            <div className="panel">
              <div className="panel-head"><h3>This Week — Log</h3></div>
              <div className="panel-body" style={{padding:0, overflowX: 'auto'}}>
                <table className="panel-table">
                  <thead><tr><th>Day</th><th>Bkfst</th><th>Lunch</th><th>Dinner</th><th>Snacks</th></tr></thead>
                  <tbody>
                    {renderHistoryTable(weekDates)}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="panel">
              <div className="panel-head"><h3>Upcoming — Next 3 Days</h3></div>
              <div className="panel-body" style={{padding:0, overflowX: 'auto'}}>
                <table className="panel-table">
                  <thead><tr><th>Day</th><th>Bkfst</th><th>Lunch</th><th>Dinner</th><th>Snacks</th></tr></thead>
                  <tbody>
                    {renderHistoryTable([1,2,3].map(i => {
                      const d = new Date(); d.setDate(d.getDate() + i); return d;
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
        
        <div className="save-bar">
          <div className="save-info">
            <strong>{openMealsCount === 0 ? 'All cutoffs passed for this day' : `${eatingCount+skippingCount} of ${openMealsCount} open meals marked`}</strong>
          </div>
          <button className="btn-save-all" onClick={saveAll} disabled={openMealsCount === 0 || isSaving}>
            {isSaving ? 'Saving...' : 'Save All Intentions'}
            {!isSaving && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>
      </div>

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="toast show">
            <div className="toast-dot" style={{background: t.color}}></div>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentIntention;

