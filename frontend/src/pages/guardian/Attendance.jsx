import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GuardianSidebar from '../../components/GuardianSidebar';
import GuardianHeaderProfiles from '../../components/GuardianHeaderProfiles';
import './Attendance.css';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30' },
];

const GuardianAttendance = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [wardData, setWardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);
  const [filterMeal, setFilterMeal] = useState('all');

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'guardian') {
      navigate('/login');
    } else {
      setSession(s);
      fetchWardData(s.wardStudentId || s.wardId);
    }
  }, [navigate]);

  const fetchWardData = async (wardId) => {
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
    } catch (err) {
      console.error('Error fetching ward intentions:', err);
    } finally {
      setLoading(false);
    }
  };

  const wardName = session?.wardName || 'Your Ward';
  const wardId = session?.wardStudentId || session?.wardId;

  const monthStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const monthIntentions = useMemo(() => {
    return wardData.filter(i => (i.date || '').startsWith(monthStr));
  }, [wardData, monthStr]);

  // Attendance stats for selected month
  const totalEatenMonth = monthIntentions.filter(i => i.status === 'eating' || i.willEat).length;
  const totalSkippedMonth = monthIntentions.filter(i => i.status === 'skipping' || i.willEat === false).length;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const maxPossible = daysInMonth * 4;
  const monthEffPct = maxPossible > 0 ? Math.round((totalEatenMonth / maxPossible) * 100) : 0;

  // Selected Day Details
  const selectedDayIntentions = useMemo(() => {
    return wardData.filter(i => (i.date || '').startsWith(selectedDayStr));
  }, [wardData, selectedDayStr]);

  const exportMonthlyCSV = () => {
    let csv = `Date,Meal,Status\n`;
    monthIntentions.forEach(i => {
      csv += `"${i.date}","${i.meal || i.mealType}","${i.status === 'eating' || i.willEat ? 'Eating' : 'Skipping'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ward_Attendance_${wardName.replace(/\s+/g, '_')}_${monthStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <GuardianSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Ward Mess Attendance Logs</h1>
            <p>Detailed attendance history & meal records for <strong>{wardName}</strong> (ID: {wardId || 'Not linked'})</p>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GuardianHeaderProfiles session={session} />
            <button className="tb-btn primary" onClick={exportMonthlyCSV} disabled={!wardId}>
              ⬇ Export CSV
            </button>
          </div>
        </div>

        <div className="content">
          {/* Stats Bar */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="sc-label">Meals Eaten ({new Date(calYear, calMonth).toLocaleString('default', { month: 'short' })})</div>
              <div className="sc-val" style={{ color: 'var(--accent)' }}>{totalEatenMonth}</div>
              <div className="sc-sub">out of {maxPossible} possible meals</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Meals Skipped</div>
              <div className="sc-val" style={{ color: 'var(--danger)' }}>{totalSkippedMonth}</div>
              <div className="sc-sub">opted out this month</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Monthly Participation Rate</div>
              <div className="sc-val" style={{ color: 'var(--gold)' }}>{monthEffPct}%</div>
              <div className="sc-sub">attendance efficiency</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Selected Date</div>
              <div className="sc-val" style={{ color: 'var(--accent2)', fontSize: '1.2rem' }}>{selectedDayStr}</div>
              <div className="sc-sub">click calendar day to view</div>
            </div>
          </div>

          <div className="lower-grid">
            {/* Left: Calendar Picker */}
            <div className="panel">
              <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Monthly Attendance Calendar</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="cal-arr-btn" onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                    else setCalMonth(calMonth - 1);
                  }}>‹</button>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {new Date(calYear, calMonth).toLocaleString('default', { month: 'long' })} {calYear}
                  </span>
                  <button className="cal-arr-btn" onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                    else setCalMonth(calMonth + 1);
                  }}>›</button>
                </div>
              </div>

              <div className="panel-body">
                <div className="cal-grid-header">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} className="cal-head-day">{d}</div>
                  ))}
                </div>

                <div className="cal-grid-body">
                  {(() => {
                    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
                    const days = [];

                    for (let i = 0; i < firstDayIndex; i++) {
                      days.push(<div key={`empty-${i}`} className="cal-day-box empty"></div>);
                    }

                    for (let i = 1; i <= daysInMonth; i++) {
                      const dateStr = `${monthStr}-${String(i).padStart(2, '0')}`;
                      const dayI = wardData.filter(intent => (intent.date || '').startsWith(dateStr));
                      let bg = 'var(--surface2)';
                      let color = 'var(--text)';
                      let badgeText = '';

                      if (dayI.length > 0) {
                        const eats = dayI.filter(it => it.status === 'eating' || it.willEat).length;
                        const skips = dayI.filter(it => it.status === 'skipping' || it.willEat === false).length;
                        if (eats > 0 && skips === 0) { bg = 'rgba(0,229,160,0.15)'; color = 'var(--accent)'; badgeText = '✓ Ate All'; }
                        else if (skips > 0 && eats === 0) { bg = 'rgba(255,71,87,0.15)'; color = 'var(--danger)'; badgeText = '✕ Skipped'; }
                        else if (eats > 0 && skips > 0) { bg = 'rgba(244,197,66,0.15)'; color = 'var(--gold)'; badgeText = '● Mixed'; }
                      }

                      const isSelected = selectedDayStr === dateStr;

                      days.push(
                        <div 
                          key={i} 
                          className={`cal-day-box ${isSelected ? 'selected' : ''}`}
                          style={{ background: bg, color: color }}
                          onClick={() => setSelectedDayStr(dateStr)}
                        >
                          <div className="cal-day-num">{i}</div>
                          {badgeText && <div className="cal-day-tag">{badgeText}</div>}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>

                <div className="cal-legend-row">
                  <div className="leg-item"><span className="dot ate"></span> All Meals Eaten</div>
                  <div className="leg-item"><span className="dot skipped"></span> Meals Skipped</div>
                  <div className="leg-item"><span className="dot mixed"></span> Mixed Status</div>
                  <div className="leg-item"><span className="dot empty"></span> Not Marked</div>
                </div>
              </div>
            </div>

            {/* Right: Selected Day Breakdown */}
            <div className="right-col">
              <div className="panel">
                <div className="panel-head">
                  <h3>Day Details — {selectedDayStr}</h3>
                </div>
                <div className="panel-body">
                  <div className="meal-details-list">
                    {MEALS.map(m => {
                      const intent = selectedDayIntentions.find(i => (i.meal === m.id || i.mealType === m.id));
                      const isEating = intent && (intent.status === 'eating' || intent.willEat);
                      const isSkipping = intent && (intent.status === 'skipping' || intent.willEat === false);

                      return (
                        <div key={m.id} className={`meal-detail-card ${isEating ? 'eat' : isSkipping ? 'skip' : 'pending'}`}>
                          <div className="mdc-left">
                            <span className="mdc-emoji">{m.emoji}</span>
                            <div>
                              <div className="mdc-name">{m.name}</div>
                              <div className="mdc-time">{m.time}</div>
                            </div>
                          </div>
                          <div className="mdc-right">
                            {isEating ? (
                              <span className="pill pill-green">✓ Eaten</span>
                            ) : isSkipping ? (
                              <span className="pill pill-red">✕ Skipped</span>
                            ) : (
                              <span className="pill pill-muted">⏳ Not Marked</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

export default GuardianAttendance;
