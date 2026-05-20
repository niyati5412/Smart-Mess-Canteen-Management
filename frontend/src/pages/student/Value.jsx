import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Value.css';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const StudentValue = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [intentions, setIntentions] = useState([]);
  const [budget, setBudget] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [activePeriod, setActivePeriod] = useState(null); // 'semester' or { year, month }
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      setActivePeriod({ year: today.getFullYear(), month: today.getMonth() });
      fetchData(s.id);
    }
  }, [navigate, today]);

  const fetchData = async (studentId) => {
    setLoading(true);
    try {
      const [iRes, bRes] = await Promise.all([
        fetch(`/api/intentions/student/${studentId}`),
        fetch('/api/budget')
      ]);
      const iData = await iRes.json();
      const bData = await bRes.json();
      setIntentions(iData);
      setBudget(bData);
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

  // Data processing based on active period
  const filteredData = useMemo(() => {
    if (!activePeriod) return [];
    if (activePeriod === 'semester') return intentions;
    const { year, month } = activePeriod;
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return intentions.filter(i => i.date.startsWith(prefix));
  }, [intentions, activePeriod]);

  const messFee = budget.semesterFeePerStudent || 6000;
  const mealCost = budget.mealCostPerMeal || Math.round(messFee / 90);
  
  const eatingCount = filteredData.filter(i => i.status === 'eating').length;
  const skippingCount = filteredData.filter(i => i.status === 'skipping').length;
  const totalMarked = eatingCount + skippingCount;
  
  const effPct = totalMarked ? Math.round((eatingCount / totalMarked) * 100) : 0;
  const consumed = eatingCount * mealCost;
  const wasted = skippingCount * mealCost;
  
  const periodLabel = activePeriod === 'semester' 
    ? 'Semester' 
    : activePeriod ? `${MONTH_NAMES[activePeriod.month]} ${activePeriod.year}` : '';

  // Efficiency Panel Processing
  const mealEff = {};
  ['breakfast','lunch','dinner','snacks'].forEach(m => {
    const md = filteredData.filter(i => i.meal === m);
    mealEff[m] = md.length ? Math.round((md.filter(i => i.status === 'eating').length / md.length) * 100) : 0;
  });

  const standingLabel = effPct >= 90 ? 'Excellent' : effPct >= 75 ? 'Good Standing' : 'Needs Improvement';
  const standingColor = effPct >= 75 ? 'var(--accent)' : 'var(--danger)';
  const standingMsg = effPct >= 90
    ? "You're maximising your mess fee. Keep it up!"
    : effPct >= 75
      ? `You're using ${effPct}% of your mess fee value. Target is 90%+. Skipping 1–2 fewer meals per week would get you there.`
      : `Only ${effPct}% efficiency. Try to eat more meals to get better value from your fee.`;

  const arc = Math.round(effPct * 88 / 100);
  const arcRed = 88 - arc;

  // Week by Week Processing
  const weeks = {};
  filteredData.forEach(i => {
    const d = new Date(i.date);
    const day1 = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const wk = 'W' + Math.ceil((d.getDate() + day1) / 7);
    if (!weeks[wk]) weeks[wk] = { eat: 0 };
    if (i.status === 'eating') weeks[wk].eat++;
  });
  const wKeys = Object.keys(weeks).sort();
  const weeklyFee = Math.round(messFee / 4);
  const weekData = wKeys.map(k => ({ 
    label: k, 
    eat: weeks[k].eat, 
    pct: Math.round((weeks[k].eat / 28) * 100), 
    value: weeks[k].eat * mealCost 
  }));
  const maxPct = weekData.length ? Math.max(...weekData.map(w => w.pct), 1) : 1;
  const bestWk = weekData.length ? weekData.reduce((a, b) => a.eat > b.eat ? a : b) : null;
  const worstWk = weekData.length ? weekData.reduce((a, b) => a.eat < b.eat ? a : b) : null;

  // Daily Log Processing
  const byDate = {};
  filteredData.forEach(i => { 
    if (!byDate[i.date]) byDate[i.date] = {}; 
    byDate[i.date][i.meal] = i.status; 
  });
  const dates = Object.keys(byDate).sort().reverse();

  const exportCSV = () => {
    const rows = ['Date,Breakfast,Lunch,Dinner,Snacks,Day Value,Efficiency'];
    dates.forEach(ds => {
      const row = byDate[ds];
      const meals = ['breakfast','lunch','dinner','snacks'];
      const eatC = meals.filter(m => row[m] === 'eating').length;
      const vals = meals.map(m => row[m] === 'eating' ? 'Ate' : row[m] === 'skipping' ? 'Skip' : '—');
      rows.push(`${ds},${vals.join(',')},Rs${eatC * mealCost},${Math.round((eatC / 4) * 100)}%`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meal-log.csv';
    a.click();
  };

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Budget &amp; Value</h1>
            <p>See how efficiently you're using your mess fee</p>
          </div>
          <div className="topbar-right">
            <div className="select-row">
              {[0, 1, 2].map(i => {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const isActive = activePeriod !== 'semester' && activePeriod?.year === d.getFullYear() && activePeriod?.month === d.getMonth();
                return (
                  <div 
                    key={i} 
                    className={`sel-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setActivePeriod({ year: d.getFullYear(), month: d.getMonth() })}
                  >
                    {MONTH_NAMES[d.getMonth()].slice(0, 3)} {d.getFullYear()}
                  </div>
                );
              })}
              <div 
                className={`sel-chip ${activePeriod === 'semester' ? 'active' : ''}`}
                onClick={() => setActivePeriod('semester')}
              >
                Semester
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div style={{color:'var(--text)', padding:'20px'}}>Loading...</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Mess Fee Paid</div>
                  <div className="stat-val" style={{color:'var(--text)'}}>₹{messFee.toLocaleString('en-IN')}</div>
                  <div className="stat-sub">{periodLabel} semester fee</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Value Consumed</div>
                  <div className="stat-val" style={{color:'var(--accent)'}}>₹{consumed.toLocaleString('en-IN')}</div>
                  <div className="stat-sub">
                    <span className="badge badge-green">↑ {effPct}% efficiency</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Wasted (Skipped)</div>
                  <div className="stat-val" style={{color:'var(--danger)'}}>₹{wasted.toLocaleString('en-IN')}</div>
                  <div className="stat-sub">
                    {skippingCount} meals skipped · <span className="badge badge-red">{100 - effPct}%</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg. Cost Per Meal</div>
                  <div className="stat-val" style={{color:'var(--gold)'}}>₹{mealCost}</div>
                  <div className="stat-sub">Based on {totalMarked} total meals</div>
                </div>
              </div>

              <div className="two-col">
                <div className="panel">
                  <div className="panel-head"><h3>Efficiency Overview</h3></div>
                  <div className="panel-body">
                    <div className="eff-wrap">
                      <svg className="eff-ring" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="4"/>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#00e5a0" strokeWidth="4" strokeDasharray={`${arc} ${arcRed}`} strokeDashoffset="25" strokeLinecap="round"/>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ff4757" strokeWidth="4" strokeDasharray={`${arcRed} ${arc}`} strokeDashoffset={-(arc+25)} strokeLinecap="round"/>
                        <text x="18" y="19" textAnchor="middle" fontSize="6.5" fill="var(--text)" fontFamily="Syne" fontWeight="800">{effPct}%</text>
                        <text x="18" y="24" textAnchor="middle" fontSize="3.5" fill="#7a8a96">Efficiency</text>
                      </svg>
                      <div className="eff-info">
                        <div className="eff-title" style={{color: standingColor}}>{standingLabel}</div>
                        <div className="eff-sub">{standingMsg}</div>
                      </div>
                    </div>
                    {['breakfast','lunch','dinner','snacks'].map(m => {
                      const pct = mealEff[m];
                      const col = pct >= 85 ? 'var(--accent)' : pct >= 65 ? 'var(--gold)' : 'var(--orange, #ff9a3c)';
                      return (
                        <div className="prog-row" key={m}>
                          <span className="prog-label">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                          <div className="prog-track">
                            <div className="prog-fill" style={{width: `${pct}%`, background: col}}></div>
                          </div>
                          <span className="prog-val" style={{color: col}}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="panel">
                  <div className="panel-head"><h3>Week-by-Week Value</h3></div>
                  <div className="panel-body">
                    {!wKeys.length ? (
                      <div style={{textAlign:'center',color:'var(--muted)',fontSize:'.8rem',padding:'30px'}}>No data for this period</div>
                    ) : (
                      <>
                        <div className="bar-chart">
                          {weekData.map(w => (
                            <div className="bar-col" key={w.label}>
                              <div className="bar-fill primary" style={{height: `${Math.round((w.pct / maxPct) * 100)}%`}}></div>
                              <span className="bar-lbl">{w.label}</span>
                            </div>
                          ))}
                        </div>
                        {bestWk && worstWk && (
                          <div style={{display:'flex',gap:'16px',marginTop:'8px'}}>
                            <div style={{flex:1,background:'var(--surface2)',borderRadius:'10px',padding:'12px',border:'1px solid var(--border)'}}>
                              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:'4px'}}>Best Week</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:'800',color:'var(--accent)'}}>{bestWk.label}</div>
                              <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>₹{bestWk.value.toLocaleString('en-IN')} of ₹{weeklyFee.toLocaleString('en-IN')}</div>
                            </div>
                            <div style={{flex:1,background:'var(--surface2)',borderRadius:'10px',padding:'12px',border:'1px solid var(--border)'}}>
                              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:'4px'}}>Worst Week</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:'800',color:'var(--danger)'}}>{worstWk.label}</div>
                              <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>₹{worstWk.value.toLocaleString('en-IN')} of ₹{weeklyFee.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h3>Daily Meal Log — {periodLabel}</h3>
                  <span style={{fontSize:'0.72rem',color:'var(--accent)',cursor:'pointer'}} onClick={exportCSV}>Export CSV →</span>
                </div>
                <div className="panel-body" style={{padding:0}}>
                  <div className="table-wrap">
                    <table className="value-table">
                      <thead>
                        <tr><th>Date</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Snacks</th><th>Day Value</th><th>Efficiency</th></tr>
                      </thead>
                      <tbody>
                        {!dates.length ? (
                          <tr><td colSpan="7" style={{textAlign:'center',color:'var(--muted)',padding:'24px',fontSize:'.8rem'}}>No data for this period</td></tr>
                        ) : (
                          dates.map(ds => {
                            const row = byDate[ds];
                            const meals = ['breakfast','lunch','dinner','snacks'];
                            const eatC = meals.filter(m => row[m] === 'eating').length;
                            const effP = Math.round((eatC / 4) * 100);
                            const effCls = effP === 100 ? 'pill-green' : effP >= 75 ? 'pill-gold' : 'pill-red';
                            const lbl = new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                            
                            const getCell = (s) => {
                              if (!s) return <span className="td-muted">—</span>;
                              if (s === 'eating') return <span className="pill pill-green">Ate</span>;
                              return <span className="pill pill-red">Skip</span>;
                            };

                            return (
                              <tr key={ds}>
                                <td style={{fontWeight:500}}>{lbl}</td>
                                {meals.map(m => <td key={m}>{getCell(row[m])}</td>)}
                                <td style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:'var(--accent)'}}>₹{eatC * mealCost}</td>
                                <td><span className={`pill ${effCls}`}>{effP}%</span></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentValue;

