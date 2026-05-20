import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuardianSidebar from '../../components/GuardianSidebar';
import './Budget.css';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NOW = new Date();

const GuardianBudget = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  
  const currentMonthValue = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}`;
  const [activeMonth, setActiveMonth] = useState(currentMonthValue);

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
    setLoading(true);
    try {
      const [intentRes, budgetRes] = await Promise.all([
        fetch(`/api/intentions/student/${wardId}`),
        fetch('/api/budget')
      ]);
      const raw = await intentRes.json();
      const budget = await budgetRes.json();
      
      setBudgetData(budget);

      const parsedData = raw.map(i => ({
        date: (i.date || '').toString().slice(0, 10),
        meal: i.meal || i.mealType || 'lunch',
        willEat: i.willEat !== undefined ? i.willEat : (i.status === 'eating'),
      }));
      
      setAllData(parsedData);
      
      const months = [...new Set(parsedData.map(i => i.date.slice(0, 7)))].sort().reverse();
      if (months.length > 0 && !months.includes(currentMonthValue)) {
        setActiveMonth(months[0]);
      } else {
        setActiveMonth(currentMonthValue);
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

  const exportCSV = () => {
    const data = allData.filter(i => i.date.startsWith(activeMonth));
    if (!data.length) return;
    
    const mealCost = budgetData?.perMealCostAvg || budgetData?.perMealCostTarget || 67;
    const rows = [['Date', 'Meal', 'Status', 'Cost (₹)']];
    
    data.sort((a, b) => a.date.localeCompare(b.date)).forEach(i => {
      rows.push([i.date, i.meal, i.willEat ? 'Eating' : 'Skipping', i.willEat ? mealCost : 0]);
    });
    
    const total = data.filter(i => i.willEat).length * mealCost;
    rows.push(['', '', 'Total Consumed', total]);
    
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${activeMonth}.csv`;
    a.click();
  };

  if (!session) return null;

  const name = session.name || 'Guardian';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const wardName = session.wardName || 'Your Ward';
  const wardInitials = wardName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  
  const mealCost = budgetData?.perMealCostAvg || budgetData?.perMealCostTarget || 67;
  const semesterFee = budgetData?.semesterFeePerStudent || 6000;
  
  const monthData = allData.filter(i => i.date.startsWith(activeMonth));
  
  // Hero calculations (for the active month, but the hero shows semester numbers? In original EJS it calculated based on all month data? Ah wait, the original EJS `renderHero` was called with `filterByMonth(activeMonth)` meaning it showed month-specific consumption but compared it to semester fee, which is slightly odd but I'll stick to original logic: passed `filterByMonth(activeMonth)` into `renderAll`)
  // Oh wait, `renderHero` in EJS used `data` (which was `filterByMonth(activeMonth)`). Let's calculate based on `monthData`.
  const eaten = monthData.filter(i => i.willEat).length;
  const skipped = monthData.filter(i => !i.willEat).length;
  const consumed = eaten * mealCost;
  const wasted = skipped * mealCost;
  const pctConsumed = semesterFee > 0 ? Math.round((consumed / semesterFee) * 100) : 0;
  const pctWasted = semesterFee > 0 ? Math.round((wasted / semesterFee) * 100) : 0;
  
  // Progress bar color
  let fpBg = 'linear-gradient(90deg,var(--danger),#ff6b35)';
  if (pctConsumed >= 80) fpBg = 'linear-gradient(90deg,var(--accent3),#00cc7a)';
  else if (pctConsumed >= 50) fpBg = 'linear-gradient(90deg,var(--accent),#ffb300)';

  const eff = monthData.length > 0 ? Math.round((eaten / monthData.length) * 100) : 0;
  
  // Donut chart
  const byMeal = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
  monthData.filter(i => i.willEat).forEach(i => { if (byMeal[i.meal] !== undefined) byMeal[i.meal]++; });
  const totalEaten = Object.values(byMeal).reduce((a, b) => a + b, 0);

  // Month tabs
  let availableMonths = [...new Set(allData.map(i => i.date.slice(0, 7)))].sort().reverse();
  if (!availableMonths.includes(currentMonthValue)) availableMonths.unshift(currentMonthValue);

  const formatMonth = (m) => {
    const [y, mo] = m.split('-');
    return `${MONTH_NAMES[parseInt(mo) - 1].slice(0, 3)} ${y}`;
  };

  const fullMonthLabel = (m) => {
    const [y, mo] = m.split('-');
    return `${MONTH_NAMES[parseInt(mo) - 1]} ${y}`;
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  // Projection
  const today = NOW.getDate();
  const daysLeft = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).getDate() - today;
  const dailyRate = today > 0 ? eaten / today : 0;
  const projectedMeals = Math.round(eaten + dailyRate * daysLeft);
  const projected = projectedMeals * mealCost;
  const projEff = semesterFee > 0 ? Math.round((projected / semesterFee) * 100) : 0;

  // Meal log
  const byDate = {};
  monthData.forEach(i => {
    if (!byDate[i.date]) byDate[i.date] = {};
    byDate[i.date][i.meal] = i.willEat;
  });
  const logRows = Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a));

  // Bar chart
  let barMonths = [...new Set(allData.map(i => i.date.slice(0, 7)))].sort().slice(-6);
  if (!barMonths.includes(currentMonthValue)) barMonths.push(currentMonthValue);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <GuardianSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Budget Overview</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>{wardName}'s mess fee & consumption details</span>
              <span style={{ color: 'var(--muted)' }}>•</span>
              <span style={{ color: 'var(--gold)', fontWeight: 500 }}>Logged in as: {session?.name} (ID: {session?.id || session?._id})</span>
            </p>
          </div>
          <div className="topbar-right">
            <button className="tb-btn" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="tb-btn primary" onClick={() => alert('Report sent via email!')}>📧 Email Report</button>
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div className="state-box"><div className="spinner"></div>Loading budget data...</div>
          ) : (
            <>
              <div className="budget-hero">
                <div className="hero-top">
                  <div className="hero-ward">
                    <div className="hero-av">{wardInitials}</div>
                    <div>
                      <div className="hero-name">{wardName}</div>
                      <div className="hero-sub">Mess Fee Tracker · <span>{NOW.getFullYear()}–{NOW.getFullYear()+1}</span></div>
                    </div>
                  </div>
                  <div className="hero-period">{fullMonthLabel(activeMonth)}</div>
                </div>
                
                <div className="big-nums">
                  <div className="big-num">
                    <div className="bn-label">SEMESTER FEE</div>
                    <div className="bn-val" style={{color:'var(--text)'}}>{fmt(semesterFee)}</div>
                    <div className="bn-sub">Total mess fee paid</div>
                  </div>
                  <div className="big-num">
                    <div className="bn-label">CONSUMED ({formatMonth(activeMonth)})</div>
                    <div className="bn-val" style={{color:'var(--accent)'}}>{fmt(consumed)}</div>
                    <div className="bn-sub">{eaten} meals eaten this period</div>
                    <div className="bn-pill" style={{background:'rgba(244,197,66,0.1)', color:'var(--accent)'}}>{pctConsumed}% of fee</div>
                  </div>
                  <div className="big-num">
                    <div className="bn-label">WASTED (SKIPPED)</div>
                    <div className="bn-val" style={{color:'var(--danger)'}}>{fmt(wasted)}</div>
                    <div className="bn-sub">{skipped} meals skipped</div>
                    <div className="bn-pill" style={{background:'rgba(255,71,87,0.1)', color:'var(--danger)'}}>{pctWasted}% wasted</div>
                  </div>
                </div>
                
                <div className="fee-progress">
                  <div className="fp-top">
                    <span className="fp-label">Fee utilization</span>
                    <span className="fp-pct">{pctConsumed}%</span>
                  </div>
                  <div className="fp-track">
                    <div className="fp-fill" style={{width: `${Math.min(pctConsumed, 100)}%`, background: fpBg}}></div>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:'6px'}}>
                    <span style={{fontSize:'0.65rem', color:'var(--muted)'}}>₹0</span>
                    <span style={{fontSize:'0.65rem', color:'var(--muted)'}}>{fmt(semesterFee)}</span>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Per Meal Value</div>
                  <div className="stat-val" style={{color:'var(--accent2)'}}>₹{mealCost}</div>
                  <div className="stat-sub">Cost per meal serving</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Meals Eaten</div>
                  <div className="stat-val" style={{color:'var(--accent3)'}}>{eaten}</div>
                  <div className="stat-sub">₹{(eaten * mealCost).toLocaleString('en-IN')} consumed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Meals Skipped</div>
                  <div className="stat-val" style={{color:'var(--danger)'}}>{skipped}</div>
                  <div className="stat-sub">₹{(skipped * mealCost).toLocaleString('en-IN')} wasted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Efficiency Score</div>
                  <div className="stat-val" style={{color:'var(--accent)'}}>{eff}%</div>
                  <div className="stat-sub">{eff >= 80 ? '🟢 Excellent' : eff >= 60 ? '🟡 Average' : '🔴 Low'} utilization</div>
                </div>
              </div>

              <div className="month-tabs">
                {availableMonths.map(m => (
                  <button key={m} className={`month-tab ${m === activeMonth ? 'active' : ''}`} onClick={() => setActiveMonth(m)}>
                    {formatMonth(m)}
                  </button>
                ))}
              </div>

              {activeMonth === currentMonthValue && (
                <div className="proj-card">
                  <div className="proj-icon">🔮</div>
                  <div>
                    <div className="proj-title">Projected Month-End Spend</div>
                    <div className="proj-sub">Based on {dailyRate.toFixed(1)} meals/day rate. Projected {projEff}% of semester fee utilization. {projEff >= 85 ? '✅ On track!' : projEff < 60 ? '⚠️ Low utilization' : '📊 Moderate'}</div>
                  </div>
                  <div className="proj-right">
                    <div className="proj-val">{fmt(projected)}</div>
                    <div className="proj-vsub">~{projectedMeals} total meals by month end</div>
                  </div>
                </div>
              )}

              <div className="two-col">
                <div className="panel">
                  <div className="panel-head">
                    <h3>Meal Breakdown</h3>
                    <span className="panel-action">{fullMonthLabel(activeMonth)}</span>
                  </div>
                  <div className="panel-body">
                    <div className="donut-wrap">
                      <svg className="donut-svg" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="4.5"/>
                        {MEALS.map((m, i) => {
                          const pct = totalEaten > 0 ? (byMeal[m] / totalEaten) * 100 : 0;
                          const offsetVal = MEALS.slice(0, i).reduce((sum, mx) => sum + (totalEaten > 0 ? (byMeal[mx] / totalEaten) * 100 : 0), 0);
                          const strokeColors = { breakfast: '#f4c542', lunch: '#00b8ff', dinner: '#00e5a0', snacks: '#ff6b35' };
                          if (pct === 0) return null;
                          return <circle key={m} cx="18" cy="18" r="14" fill="none" stroke={strokeColors[m]} strokeWidth="4.5" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={25 - offsetVal} strokeLinecap="butt" />
                        })}
                        <text x="18" y="17" textAnchor="middle" fontSize="5" fill="#7a8a96" fontFamily="Poppins">eaten</text>
                        <text x="18" y="22" textAnchor="middle" fontSize="6.5" fill="var(--text)" fontFamily="Poppins" fontWeight="800">{totalEaten}</text>
                      </svg>
                      <div className="donut-legend">
                        {MEALS.map(m => {
                          const pct = totalEaten > 0 ? Math.round((byMeal[m] / totalEaten) * 100) : 0;
                          const bgColors = { breakfast: '#f4c542', lunch: '#00b8ff', dinner: '#00e5a0', snacks: '#ff6b35' };
                          return (
                            <div key={m} className="dl-row">
                              <div className="dl-dot" style={{background: bgColors[m]}}></div>
                              <span className="dl-label" style={{textTransform:'capitalize'}}>{m}</span>
                              <span className="dl-val">{byMeal[m]} meals</span>
                              <span className="dl-pct">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <h3>Monthly Spend</h3>
                    <span className="panel-action">Per meal ₹{mealCost}</span>
                  </div>
                  <div className="panel-body">
                    <div className="bar-chart">
                      {barMonths.length === 0 ? (
                        <div className="state-box">No data available</div>
                      ) : (
                        barMonths.map(m => {
                          const d = allData.filter(i => i.date.startsWith(m));
                          const mEaten = d.filter(i => i.willEat).length;
                          const spend = mEaten * mealCost;
                          const maxSpend = Math.max(...barMonths.map(mx => allData.filter(i => i.date.startsWith(mx)).filter(i => i.willEat).length * mealCost), 1);
                          const widthPct = Math.round((spend / maxSpend) * 100);
                          const isActive = m === activeMonth;
                          return (
                            <div key={m} className="bc-row">
                              <span className="bc-label">{formatMonth(m).replace('20', "'")}</span>
                              <div className="bc-track">
                                <div className="bc-fill" style={{width:`${widthPct}%`, background: isActive ? 'var(--accent)' : 'rgba(0,184,255,0.7)', color: isActive ? '#0a0d0f' : '#e8edf2'}}>
                                  {widthPct > 15 ? fmt(spend) : ''}
                                </div>
                              </div>
                              <span className="bc-val" style={{color: isActive ? 'var(--accent)' : 'var(--muted)'}}>{fmt(spend)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h3>Meal Log — <span style={{color:'var(--muted)', fontWeight:500}}>{fullMonthLabel(activeMonth)}</span></h3>
                  <a href="#" className="panel-action" onClick={(e) => { e.preventDefault(); exportCSV(); }}>Export →</a>
                </div>
                <div className="panel-body" style={{padding:0}}>
                  {logRows.length === 0 ? (
                    <div className="state-box">No meal data for this period</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table>
                        <thead>
                          <tr><th>Date</th><th>Meals</th><th style={{textAlign:'center'}}>Status</th><th style={{textAlign:'right'}}>Spend</th></tr>
                        </thead>
                        <tbody>
                          {logRows.map(([date, meals]) => {
                            const dEaten = Object.values(meals).filter(Boolean).length;
                            const dSkipped = Object.values(meals).filter(v => !v).length;
                            const daySpend = dEaten * mealCost;
                            const d = new Date(date + 'T00:00:00');
                            const dateStr = isNaN(d) ? date : d.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'});
                            
                            return (
                              <tr key={date}>
                                <td style={{fontWeight:500}}>{dateStr}</td>
                                <td>
                                  <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                                    {MEALS.map(m => {
                                      if (meals[m] === undefined) return <span key={m} className="pill pill-muted">—</span>;
                                      return meals[m] ? <span key={m} className="pill pill-green">✓ {m}</span> : <span key={m} className="pill pill-red">✕ {m}</span>;
                                    })}
                                  </div>
                                </td>
                                <td style={{textAlign:'center'}}>
                                  {dEaten === 4 ? <span className="pill pill-green">All meals</span> : dSkipped === 4 ? <span className="pill pill-red">Skipped all</span> : <span className="pill pill-gold">Partial</span>}
                                </td>
                                <td style={{textAlign:'right', fontWeight:700, color: dEaten > 0 ? 'var(--accent3)' : 'var(--muted)'}}>{fmt(daySpend)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td style={{fontWeight:700}}>Total</td>
                            <td style={{fontSize:'0.75rem', color:'var(--muted)'}}>{eaten} eaten · {skipped} skipped</td>
                            <td></td>
                            <td style={{textAlign:'right', fontWeight:800, fontSize:'1rem', color:'var(--accent)'}}>{fmt(eaten * mealCost)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianBudget;
