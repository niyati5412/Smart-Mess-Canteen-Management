import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Waste.css';
import AdminSidebar from '../../components/AdminSidebar';

const AdminWaste = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMeal, setFilterMeal] = useState('');

  const [form, setForm] = useState({
    mealType: '', foodItem: '', quantity: '', reason: ''
  });

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchWaste();
    }
  }, [navigate]);

  const fetchWaste = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/waste');
      if (res.ok) {
        const data = await res.json();
        setWaste(data);
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

  const submitWaste = async () => {
    if (!form.mealType || !form.foodItem || !form.quantity || !form.reason) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: form.mealType,
          foodItem: form.foodItem,
          quantity: parseFloat(form.quantity),
          reason: form.reason
        })
      });
      if (res.ok) {
        const newEntry = await res.json();
        setWaste(prev => [...prev, newEntry]);
        setForm({ mealType: '', foodItem: '', quantity: '', reason: '' });
        setShowForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteWaste = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`/api/waste/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWaste(prev => prev.filter(w => w.id !== id && w._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    if (!waste.length) return;
    const rows = [['Date', 'Meal Type', 'Food Item', 'Quantity', 'Reason']];
    waste.forEach(w => rows.push([w.date, w.mealType, w.foodItem, w.quantity, w.reason]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!session) return null;

  const initials = session.name ? session.name.substring(0, 2).toUpperCase() : 'A';

  // Stats
  const total = waste.length;
  const totalQty = waste.reduce((s, w) => s + (parseFloat(w.quantity) || 0), 0);
  
  const mealTotals = {};
  waste.forEach(w => { mealTotals[w.mealType] = (mealTotals[w.mealType] || 0) + (parseFloat(w.quantity) || 0); });
  const topMeal = Object.entries(mealTotals).sort((a, b) => b[1] - a[1])[0];
  
  const reasonCounts = {};
  waste.forEach(w => { reasonCounts[w.reason] = (reasonCounts[w.reason] || 0) + 1; });
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  // Charts data
  const mealColors = { Breakfast:'var(--accent2)', Lunch:'var(--accent)', Dinner:'var(--gold)', Snacks:'var(--orange)' };
  const maxMeal = Math.max(...Object.values(mealTotals), 0.01);
  const mealEntries = Object.entries(mealTotals).sort((a,b) => b[1]-a[1]);

  const maxReason = Math.max(...Object.values(reasonCounts), 0.01);
  const reasonColors = ['var(--danger)', 'var(--orange)', 'var(--gold)', 'var(--accent)', 'var(--accent2)'];
  const reasonEntries = Object.entries(reasonCounts).sort((a,b) => b[1]-a[1]);

  const filteredWaste = filterMeal ? waste.filter(w => w.mealType === filterMeal) : waste;

  const getMealChip = (meal) => {
    const map = { Breakfast:'chip-b', Lunch:'chip-l', Dinner:'chip-d', Snacks:'chip-s' };
    return <span className={`chip ${map[meal] || ''}`}>{meal || '—'}</span>;
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Waste Tracker</h1>
            <p>Log food waste, track patterns, reduce losses</p>
          </div>
          <div className="topbar-right">
            <div className="tb-btn" onClick={exportCSV}>⬇ Export CSV</div>
            <div className="tb-btn primary" onClick={() => setShowForm(!showForm)}>+ Log Waste</div>
          </div>
        </div>

        <div className="content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="sc-label">Total Entries</div>
              <div className="sc-val" style={{color:'var(--accent2)'}}>{total || '0'}</div>
              <div className="sc-sub">{total === 1 ? '1 entry logged' : `${total} entries logged`}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Quantity</div>
              <div className="sc-val" style={{color:'var(--gold)'}}>{totalQty.toFixed(1)}</div>
              <div className="sc-sub">total kg / plates wasted</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Most Wasted Meal</div>
              <div className="sc-val" style={{color:'var(--orange)', fontSize:'1.2rem'}}>{topMeal ? topMeal[0] : 'N/A'}</div>
              <div className="sc-sub">{topMeal ? `${topMeal[1].toFixed(1)} kg wasted` : 'no data yet'}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Top Reason</div>
              <div className="sc-val" style={{color:'var(--danger)', fontSize:'1rem', letterSpacing:0}}>{topReason ? topReason[0] : 'N/A'}</div>
              <div className="sc-sub">{topReason ? `${topReason[1]} times` : 'no data yet'}</div>
            </div>
          </div>

          {showForm && (
            <div className="panel" style={{marginBottom:'16px'}}>
              <div className="panel-head">
                <h3>♻️ Log New Waste Entry</h3>
                <span style={{fontSize:'0.72rem', color:'var(--muted)', cursor:'pointer'}} onClick={() => setShowForm(false)}>✕ Close</span>
              </div>
              <div className="panel-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Meal Type</label>
                    <select className="form-select" value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})}>
                      <option value="">Select meal…</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Food Item</label>
                    <input className="form-input" type="text" value={form.foodItem} onChange={e => setForm({...form, foodItem: e.target.value})} placeholder="e.g. Dal, Rice, Sabzi…" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Quantity (kg / plates)</label>
                    <input className="form-input" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="e.g. 2.5" min="0" step="0.1" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Reason</label>
                    <select className="form-select" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}>
                      <option value="">Select reason…</option><option>Overcooked</option><option>Low Attendance</option><option>Expired</option><option>Over-prepared</option><option>Quality Issue</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="form-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="form-btn submit" onClick={submitWaste}>+ Add Entry</button>
                </div>
              </div>
            </div>
          )}

          <div className="two-col">
            <div className="panel">
              <div className="panel-head"><h3>Waste by Meal Type</h3></div>
              <div className="panel-body">
                {mealEntries.length > 0 ? (
                  mealEntries.map(([meal, qty]) => (
                    <div key={meal} className="prog-row">
                      <span className="prog-label">{meal}</span>
                      <div className="prog-track"><div className="prog-fill" style={{width:`${(qty/maxMeal*100).toFixed(0)}%`, background:mealColors[meal]||'var(--accent2)'}}></div></div>
                      <span className="prog-val" style={{color:mealColors[meal]||'var(--accent2)'}}>{qty.toFixed(1)}</span>
                    </div>
                  ))
                ) : <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No data yet</div></div>}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><h3>Waste by Reason</h3></div>
              <div className="panel-body">
                {reasonEntries.length > 0 ? (
                  reasonEntries.map(([reason, count], i) => (
                    <div key={reason} className="prog-row">
                      <span className="prog-label" style={{fontSize:'0.72rem'}}>{reason}</span>
                      <div className="prog-track"><div className="prog-fill" style={{width:`${(count/maxReason*100).toFixed(0)}%`, background:reasonColors[i%reasonColors.length]}}></div></div>
                      <span className="prog-val" style={{color:reasonColors[i%reasonColors.length]}}>{count}x</span>
                    </div>
                  ))
                ) : <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No data yet</div></div>}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Waste Log</h3>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <select className="form-select" value={filterMeal} onChange={e => setFilterMeal(e.target.value)} style={{height:'30px', fontSize:'0.75rem', padding:'4px 10px', width:'auto'}}>
                  <option value="">All Meals</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option>
                </select>
                <span style={{fontSize:'0.72rem', color:'var(--muted)'}}>{filteredWaste.length} records</span>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table>
                <thead>
                  <tr><th>Date</th><th>Meal</th><th>Food Item</th><th>Quantity</th><th>Reason</th><th></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6"><div className="empty-state"><div className="spinner"></div><div className="empty-text">Loading waste data…</div></div></td></tr>
                  ) : filteredWaste.length > 0 ? (
                    [...filteredWaste].reverse().map(w => (
                      <tr key={w.id || w._id}>
                        <td style={{color:'var(--muted)'}}>{fmtDate(w.date)}</td>
                        <td>{getMealChip(w.mealType)}</td>
                        <td style={{fontWeight:500}}>{w.foodItem || '—'}</td>
                        <td style={{fontWeight:700, color:'var(--gold)'}}>{w.quantity || '—'}</td>
                        <td><span className="reason-chip">{w.reason || '—'}</span></td>
                        <td><button className="del-btn" onClick={() => deleteWaste(w.id || w._id)}>🗑</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">✅</div><div className="empty-text">No waste entries{filterMeal ? ` for ${filterMeal}` : ''}. Great work!</div></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWaste;
