import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Budget.css';
import AdminSidebar from '../../components/AdminSidebar';

const DONUT_COLORS = [
  'var(--accent2)', 'var(--accent)', 'var(--gold)', 'var(--orange)', 'var(--purple)', '#e879a0',
];

const AdminBudget = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    fee: '', students: '', target: '', days: ''
  });

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchBudget();
    }
  }, [navigate]);

  const fetchBudget = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/budget');
      if (!res.ok) throw new Error();
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterFeePerStudent: parseInt(form.fee),
          totalStudents: parseInt(form.students),
          perMealCostTarget: parseInt(form.target),
          semesterDays: parseInt(form.days)
        })
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setShowModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = () => {
    if (data) {
      setForm({
        fee: data.semesterFeePerStudent || '',
        students: data.totalStudents || '',
        target: data.perMealCostTarget || '',
        days: data.semesterDays || ''
      });
    }
    setShowModal(true);
  };

  const exportCSV = () => {
    if (!data || !data.dailyLog) return;
    const rows = [['Date', 'Students Served', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Total Spend', 'Per Head', 'vs Budget']];
    data.dailyLog.forEach(r => {
      rows.push([...r]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_spend_log.csv`;
    a.click();
  };

  if (!session) return null;

  const fmtL = (num) => {
    if (typeof num !== 'number') return '—';
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const fmt = (num) => typeof num === 'number' ? `₹${num.toLocaleString('en-IN')}` : '—';

  let totalFeeCollected = 0, expensesTotal = 0, perMealCostAvg = 0, perMealCostTarget = 0, surplus = 0, expPct = 0, mealDiff = 0;
  let spent = 0, projTotal = 0, spentPct = 0, projPct = 0, mealAvgTotal = 0, dailyBudget = 0;
  let underBy = 0;

  if (data) {
    totalFeeCollected = data.semesterFeePerStudent * data.totalStudents;
    expensesTotal = data.expensesTotal;
    perMealCostAvg = data.perMealCostAvg;
    perMealCostTarget = data.perMealCostTarget;
    surplus = totalFeeCollected - expensesTotal;
    expPct = totalFeeCollected > 0 ? ((expensesTotal / totalFeeCollected) * 100).toFixed(1) : 0;
    mealDiff = perMealCostAvg - perMealCostTarget;

    spent = Object.entries(data.monthlyBreakdown || {}).filter(([k]) => !k.toLowerCase().includes('proj')).reduce((s, [, v]) => s + (v || 0), 0);
    projTotal = Object.values(data.monthlyBreakdown || {}).reduce((s, v) => s + (v || 0), 0);

    spentPct = totalFeeCollected > 0 ? ((spent / totalFeeCollected) * 100).toFixed(0) : 0;
    projPct = totalFeeCollected > 0 ? ((projTotal / totalFeeCollected) * 100).toFixed(0) : 0;

    mealAvgTotal = (data.mealCosts || []).reduce((a, m) => a + m.cost, 0);
    dailyBudget = data.semesterDays > 0 ? Math.round(data.semesterFeePerStudent / data.semesterDays) : 0;
    underBy = dailyBudget - mealAvgTotal;
  }

  // Pre-calculations for donut
  let catTotal = 0;
  let donutDashOffset = 25;
  const CIRC = 87.96;
  if (data && data.categoryBreakdown) {
    catTotal = data.categoryBreakdown.reduce((s, c) => s + c.amount, 0);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div>
            <h1>Budget Management</h1>
            <p>Semester fee collection, per-meal costs, and spend analysis</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className="tb-btn" onClick={exportCSV}>⬇ Export</div>
          <div className="tb-btn primary" onClick={openModal}>⚙ Set Budget</div>
        </div>
      </div>

      <div className="content">
        {error && (
          <div className="banner warn" style={{display:'flex'}}>
            ⚠ Backend is unreachable. Displaying last known data. Changes will not be saved until the server is back online.
          </div>
        )}

        {loading ? (
          <div style={{padding:'40px', textAlign:'center', color:'var(--muted)'}}>Loading budget...</div>
        ) : data ? (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="sc-label">Total Fee Collected</div>
                <div className="sc-val" style={{color:'var(--accent2)'}}>{fmtL(totalFeeCollected)}</div>
                <div className="sc-sub">{data.totalStudents} students · {fmt(data.semesterFeePerStudent)} each</div>
              </div>
              <div className="stat-card">
                <div className="sc-label">Expenditure ({data.currentMonth || 'Current Month'})</div>
                <div className="sc-val" style={{color:'var(--accent)'}}>{fmtL(expensesTotal)}</div>
                <div className="sc-sub"><span className="badge bgo">{expPct}% of fee</span></div>
              </div>
              <div className="stat-card">
                <div className="sc-label">Per-Meal Cost (Avg)</div>
                <div className="sc-val" style={{color:'var(--gold)'}}>{fmt(perMealCostAvg)}</div>
                <div className="sc-sub">
                  Target: {fmt(perMealCostTarget)} · 
                  <span className={`badge ${mealDiff > 0 ? 'br' : 'bg'}`}>
                    {mealDiff > 0 ? `+₹${mealDiff} over` : mealDiff < 0 ? `₹${Math.abs(mealDiff)} under` : 'On target'}
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="sc-label">Surplus This Month</div>
                <div className="sc-val" style={{color: surplus >= 0 ? 'var(--accent2)' : 'var(--danger)'}}>{fmtL(Math.abs(surplus))}</div>
                <div className="sc-sub">{surplus >= 0 ? 'Rolled to maintenance fund' : 'Deficit — review spending'}</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Semester Budget Progress</h3>
                <span style={{fontSize:'0.72rem', color:'var(--muted)'}}>Progress</span>
              </div>
              <div className="panel-body">
                <div className="semester-bar">
                  <div className="sb-row">
                    <span className="sc-label">Total Budget</span>
                    <span>{fmt(totalFeeCollected)}</span>
                  </div>
                  <div className="sb-track" style={{marginBottom:'12px'}}>
                    <div className="sb-fill" style={{width:`${Math.min(spentPct, 100)}%`}}></div>
                    <div className="sb-marker" style={{left:`${Math.min(projPct, 100)}%`}}></div>
                  </div>
                  <div className="sb-legends">
                    <div className="sbl-item"><div className="sbl-dot" style={{background:'var(--accent2)'}}></div>Spent: {fmtL(spent)} ({spentPct}%)</div>
                    <div className="sbl-item"><div className="sbl-dot" style={{background:'var(--gold)'}}></div>Projected: {fmtL(projTotal)} ({projPct}%)</div>
                    <div className="sbl-item"><div className="sbl-dot" style={{background:'var(--surface3)'}}></div>Remaining: {fmtL(totalFeeCollected - spent)}</div>
                  </div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginTop:'6px'}}>
                  {Object.entries(data.monthlyBreakdown || {}).map(([key, val]) => {
                    const isProj = key.toLowerCase().includes('proj');
                    return (
                      <div key={key} style={{padding:'12px', borderRadius:'10px', background: isProj ? 'var(--surface2)' : 'rgba(0,184,255,0.05)', border: `1px solid ${isProj ? 'var(--border)' : 'rgba(0,184,255,0.2)'}`, textAlign:'center'}}>
                        <div style={{fontFamily:"'Syne',sans-serif", fontWeight:800, color: isProj ? 'var(--muted)' : 'var(--accent)', fontSize:'1.1rem'}}>
                          {isProj ? '~' : ''}{fmtL(val)}
                        </div>
                        <div style={{fontSize:'0.65rem', color:'var(--muted)', marginTop:'3px'}}>{key}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="two-col">
              <div className="panel">
                <div className="panel-head"><h3>Expenditure Breakdown</h3></div>
                <div className="panel-body">
                  {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                    <div className="donut-row">
                      <svg className="donut-svg" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="3.5" />
                        {data.categoryBreakdown.map((cat, i) => {
                          const pct = cat.amount / catTotal;
                          const dash = +(pct * CIRC).toFixed(2);
                          const gap = +(CIRC - dash).toFixed(2);
                          const color = cat.color || DONUT_COLORS[i] || '#888';
                          const off = donutDashOffset;
                          donutDashOffset -= dash;
                          return <circle key={i} cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off + 25} strokeLinecap="round" />
                        })}
                      </svg>
                      <div className="donut-legend">
                        {data.categoryBreakdown.map((c, i) => {
                          const color = c.color || DONUT_COLORS[i] || '#888';
                          const pct = catTotal > 0 ? ((c.amount / catTotal) * 100).toFixed(0) : 0;
                          return (
                            <div key={i} className="dl-item">
                              <span className="dl-label"><div className="dl-dot" style={{background:color}}></div>{c.label}</span>
                              <span className="dl-val">{fmtL(c.amount)} <span style={{color:'var(--muted)', fontWeight:400, fontSize:'0.7rem'}}>({pct}%)</span></span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state"><div className="empty-icon">📊</div>No breakdown data available</div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h3>Cost Per Meal Type</h3></div>
                <div className="panel-body">
                  {data.mealCosts && data.mealCosts.length > 0 ? (
                    data.mealCosts.map((m, i) => {
                      const maxCost = Math.max(...data.mealCosts.map(x => x.cost));
                      const color = m.color || DONUT_COLORS[i] || 'var(--accent)';
                      const pct = maxCost > 0 ? (m.cost / maxCost * 100).toFixed(0) : 0;
                      return (
                        <div key={i} className="prog-row">
                          <span className="prog-label">{m.label}</span>
                          <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`, background:color}}></div></div>
                          <span className="prog-val" style={{color:color}}>{fmt(m.cost)}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="empty-state"><div className="empty-icon">🍽️</div>No meal cost data</div>
                  )}

                  <div style={{marginTop:'16px', padding:'12px', background:'rgba(0,184,255,0.05)', border:'1px solid rgba(0,184,255,0.2)', borderRadius:'10px', fontSize:'0.78rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                      <span style={{color:'var(--muted)'}}>Daily avg per student</span>
                      <span style={{fontFamily:"'Syne',sans-serif", fontWeight:800, color:'var(--accent)'}}>{fmt(mealAvgTotal)}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color:'var(--muted)'}}>Budget per student per day</span>
                      <span style={{color:'var(--accent2)', fontWeight:600}}>{dailyBudget > 0 ? fmt(dailyBudget) : '—'}</span>
                    </div>
                  </div>
                  
                  <div style={{marginTop:'10px', padding:'10px', borderRadius:'10px', fontSize:'0.75rem', background: dailyBudget > 0 ? (underBy >= 0 ? 'rgba(0,229,160,0.05)' : 'rgba(255,71,87,0.05)') : 'transparent', border: dailyBudget > 0 ? (underBy >= 0 ? '1px solid rgba(0,229,160,0.2)' : '1px solid rgba(255,71,87,0.2)') : 'none', color: dailyBudget > 0 ? (underBy >= 0 ? 'var(--accent2)' : 'var(--danger)') : 'var(--muted)'}}>
                    {dailyBudget > 0 ? (
                      underBy >= 0 ? `✓ ₹${underBy}/day under budget — good headroom` : `⚠ ₹${Math.abs(underBy)}/day over daily budget — review`
                    ) : 'Set semester days to see comparison.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Daily Spend Log</h3>
              </div>
              <div style={{overflowX:'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th><th>Served</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Snacks</th><th>Total</th><th>Per Head</th><th>vs Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.dailyLog || []).map((r, i) => {
                      const perHead = r[7];
                      const diff = typeof perHead === 'number' ? perHead - mealAvgTotal : null;
                      return (
                        <tr key={i}>
                          <td style={{fontWeight:500}}>{r[0]}</td>
                          <td>{r[1]}</td>
                          <td style={{color:'var(--muted)'}}>{fmt(r[2])}</td>
                          <td style={{color:'var(--muted)'}}>{fmt(r[3])}</td>
                          <td style={{color:'var(--muted)'}}>{fmt(r[4])}</td>
                          <td style={{color:'var(--muted)'}}>{fmt(r[5])}</td>
                          <td style={{fontFamily:"'Syne',sans-serif", fontWeight:700, color:'var(--accent)'}}>{fmt(r[6])}</td>
                          <td>{fmt(r[7])}</td>
                          <td>{diff !== null ? (diff >= 0 ? <span style={{color:'var(--danger)'}}>+₹{diff}</span> : <span style={{color:'var(--accent2)'}}>−₹{Math.abs(diff)}</span>) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚙ Set Budget Parameters</div>
            <div className="modal-sub">Changes recalculate all totals and surplus figures instantly.</div>
            
            <div className="modal-field">
              <label className="modal-label">Semester Fee Per Student (₹)</label>
              <input className="modal-input" type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} />
              <div className="field-hint">Total budget = fee × enrolled students</div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Total Students Enrolled</label>
              <input className="modal-input" type="number" value={form.students} onChange={e => setForm({...form, students: e.target.value})} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Per-Meal Cost Target (₹)</label>
              <input className="modal-input" type="number" value={form.target} onChange={e => setForm({...form, target: e.target.value})} />
              <div className="field-hint">Used to flag when actual cost drifts above target</div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Semester Duration (days)</label>
              <input className="modal-input" type="number" value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
              <div className="field-hint">Used to compute daily per-student budget (fee ÷ days)</div>
            </div>

            {(form.fee && form.students) ? (
              <div className="recalc-preview" style={{display:'block'}}>
                <div style={{fontSize:'0.7rem', color:'var(--muted)', fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:'8px'}}>Live Preview</div>
                <div className="recalc-row"><span style={{color:'var(--muted)'}}>Total fee collected</span><span style={{fontWeight:700, color:'var(--accent2)'}}>{fmtL(form.fee * form.students)}</span></div>
                <div className="recalc-row"><span style={{color:'var(--muted)'}}>Daily budget / student</span><span style={{fontWeight:700, color:'var(--accent)'}}>{form.days ? fmt(Math.round(form.fee / form.days)) : '—'}</span></div>
              </div>
            ) : null}

            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={handleUpdate}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminBudget;
