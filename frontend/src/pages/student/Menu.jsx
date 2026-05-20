import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS = [
  { key:'breakfast', name:'Breakfast', emoji:'🌅', time:'7:30–9:00 AM' },
  { key:'lunch',     name:'Lunch',     emoji:'☀️', time:'12:30–2:00 PM' },
  { key:'dinner',    name:'Dinner',    emoji:'🌙', time:'7:30–9:00 PM' },
  { key:'snacks',    name:'Snacks',    emoji:'☕', time:'4:30–5:30 PM' },
];

const StudentMenu = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = useMemo(() => new Date(), []);
  const todayName = useMemo(() => {
    const d = today.getDay();
    return d === 0 ? 'Sunday' : DAYS[d - 1];
  }, [today]);

  const [selectedDay, setSelectedDay] = useState(todayName);

  const monday = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    return d;
  }, [today]);
  
  const sunday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + 6);
    return d;
  }, [monday]);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchMenu();
    }
  }, [navigate]);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setMenuItems(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const weekLabel = `${monday.getDate()} ${mo[monday.getMonth()]} – ${sunday.getDate()} ${mo[sunday.getMonth()]}`;

  const todayItems = menuItems.filter(i => i.day === todayName);
  const selectedDayItems = menuItems.filter(i => i.day === selectedDay);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Weekly Menu</h1>
            <p>See what's being served all week</p>
          </div>
          <div className="topbar-right">
            <span style={{fontSize:'.72rem',color:'var(--muted)',background:'var(--surface2)',border:'1px solid var(--border)',padding:'6px 12px',borderRadius:'8px'}}>
              {weekLabel}
            </span>
          </div>
        </div>

        <div className="content">
          <div className="today-banner">
            <div style={{flexShrink:0}}>
              <div className="tb-tag">Today's Menu</div>
              <div className="tb-date">
                {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="tb-sub">
                {loading ? 'Loading...' : todayItems.length ? `${todayItems.length} items on today's menu` : 'No menu published for today yet'}
              </div>
            </div>
            <div className="tb-meals">
              {loading ? (
                <div className="state-box" style={{padding:'10px'}}><div className="spinner"></div></div>
              ) : !todayItems.length ? (
                <span style={{color:'var(--muted)',fontSize:'.78rem',fontStyle:'italic'}}>Menu not published yet</span>
              ) : (
                MEALS.map(meal => {
                  const items = todayItems.filter(i => i.meal === meal.key);
                  return (
                    <div className="tbm" key={meal.key}>
                      <div className="tbm-label">{meal.emoji} {meal.name.toUpperCase()}</div>
                      <div className="tbm-items">
                        {items.length ? items.map(i => i.name).join(' · ') : <span className="tbm-empty">—</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="week-tabs">
            {DAYS.map((day, i) => {
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              const isToday = day === todayName;
              const count = menuItems.filter(item => item.day === day).length;
              return (
                <div 
                  key={day} 
                  className={`week-tab ${day === selectedDay ? 'active' : ''} ${isToday ? 'today' : ''}`} 
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="week-tab-num">{d.getDate()}</span>
                  {day.slice(0,3)}
                  {count > 0 && <><br/><span style={{fontSize:'.58rem',color:'var(--muted)'}}>{count}</span></>}
                </div>
              );
            })}
          </div>

          <div className="legend">
            <div className="leg-item"><div className="leg-dot" style={{background:'var(--accent)'}}></div>Vegetarian</div>
            <div className="leg-item"><div className="leg-dot" style={{background:'var(--muted)'}}></div>Other</div>
          </div>

          <div className="menu-grid">
            {loading ? (
              <div style={{gridColumn:'1/-1'}}><div className="state-box"><div className="spinner"></div>Loading menu…</div></div>
            ) : error ? (
              <div style={{gridColumn:'1/-1'}}>
                <div className="state-box" style={{color:'var(--danger)'}}>
                  Failed to load menu: {error}<br/>
                  <button onClick={fetchMenu} style={{marginTop:'10px',padding:'6px 14px',borderRadius:'7px',background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--muted)',cursor:'pointer',fontSize:'.76rem'}}>Retry</button>
                </div>
              </div>
            ) : !selectedDayItems.length && menuItems.length ? (
              <div style={{gridColumn:'1/-1'}}><div className="state-box">No menu published for {selectedDay} yet.</div></div>
            ) : (
              MEALS.map(meal => {
                const items = selectedDayItems.filter(i => i.meal === meal.key);
                return (
                  <div className="meal-col" key={meal.key}>
                    <div className="meal-col-head">
                      <span className="mch-emoji">{meal.emoji}</span>
                      <div>
                        <div className="mch-name">{meal.name}</div>
                        <span className="mch-time">{meal.time}</span>
                      </div>
                    </div>
                    <div className="meal-col-body">
                      {items.length ? (
                        items.map(i => (
                          <div className="menu-item-row" key={i._id || i.name}>
                            <div className="mir-dot"></div>
                            <div className="mir-name">{i.name}</div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-col">Not set</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="sec-title">Estimated Full-Day Nutrition</div>
          <div className="nutrition-row">
            <div className="nut-card"><div className="nut-val" style={{color:'var(--accent)'}}>2,450</div><div className="nut-label">Calories (kcal)</div></div>
            <div className="nut-card"><div className="nut-val" style={{color:'var(--accent2)'}}>82g</div><div className="nut-label">Protein</div></div>
            <div className="nut-card"><div className="nut-val" style={{color:'var(--gold)'}}>340g</div><div className="nut-label">Carbohydrates</div></div>
            <div className="nut-card"><div className="nut-val" style={{color:'var(--orange)'}}>58g</div><div className="nut-label">Fat</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMenu;

