import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';
import AdminSidebar from '../../components/AdminSidebar';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS = [
  {key:'breakfast',name:'Breakfast',emoji:'🌅',time:'7:30–9:00 AM'},
  {key:'lunch',    name:'Lunch',    emoji:'☀️',time:'12:30–2:00 PM'},
  {key:'dinner',   name:'Dinner',   emoji:'🌙',time:'7:30–9:00 PM'},
  {key:'snacks',   name:'Snacks',   emoji:'☕',time:'4:30–5:30 PM'},
];
const MEAL_CHIPS = { breakfast:'chip-b', lunch:'chip-l', dinner:'chip-d', snacks:'chip-s' };

const AdminMenu = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('');
  const [search, setSearch] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkItem, setBulkItem] = useState({ name: '', meal: 'breakfast', day: '' });

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      
      const d = new Date().getDay();
      const today = d === 0 ? 'Sunday' : DAYS[d - 1];
      setActiveDay(today);
      setBulkItem(prev => ({ ...prev, day: today }));

      fetchMenu();
    }
  }, [navigate]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setAllItems(data);
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

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAllItems(prev => prev.filter(i => i.id !== id && i._id !== id));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const addQuickItem = async (mealKey, inputId) => {
    const input = document.getElementById(inputId);
    const name = input.value.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, meal: mealKey, day: activeDay })
      });
      if (res.ok) {
        const newItem = await res.json();
        setAllItems(prev => [...prev, newItem]);
        input.value = '';
      }
    } catch (e) {
      console.error('Quick add failed:', e);
    }
  };

  const addBulkItem = async () => {
    if (!bulkItem.name.trim()) return;
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkItem)
      });
      if (res.ok) {
        const newItem = await res.json();
        setAllItems(prev => [...prev, newItem]);
        setActiveDay(bulkItem.day);
        setBulkItem(prev => ({ ...prev, name: '' }));
      }
    } catch (e) {
      console.error('Bulk add failed:', e);
    }
  };

  const exportCSV = () => {
    if (!allItems.length) return;
    const rows = [['ID','Name','Meal','Day','Created At']];
    allItems.forEach(i => {
      rows.push([i.id || i._id, i.name, i.meal, i.day, i.createdAt || '']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!session) return null;

  const initials = session.name ? session.name.substring(0, 2).toUpperCase() : 'A';
  const todayName = (new Date().getDay() === 0) ? 'Sunday' : DAYS[new Date().getDay() - 1];

  const filteredItems = search ? allItems.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.day.toLowerCase().includes(search.toLowerCase()) || 
    i.meal.toLowerCase().includes(search.toLowerCase())
  ) : allItems;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />

      {/* Main Content */}
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Menu Manager</h1>
            <p>{allItems.length} items across 7 days · Edit by day and meal</p>
          </div>
          <div className="topbar-right">
            <button className="tb-btn" onClick={exportCSV}>⬇ Export</button>
            <button className="tb-btn primary" onClick={() => setShowBulk(!showBulk)}>＋ Add Item</button>
          </div>
        </div>

        <div className="content">
          <div className="day-tabs">
            {DAYS.map(day => {
              const count = allItems.filter(i => i.day === day).length;
              return (
                <div key={day} className={`day-tab ${day === activeDay ? 'active' : ''} ${day === todayName ? 'today-tab' : ''}`} onClick={() => setActiveDay(day)}>
                  <div className="day-tab-name">{day.slice(0, 3)}</div>
                  <div className="day-tab-label">{day.slice(0, 3)}</div>
                  <div className="day-tab-count">{count} items</div>
                </div>
              );
            })}
          </div>

          <div className="meal-grid">
            {loading ? (
              <div style={{gridColumn: '1 / -1'}}><div className="state-box"><div className="spinner"></div>Loading menu…</div></div>
            ) : (
              MEALS.map(meal => {
                const items = allItems.filter(i => i.day === activeDay && i.meal === meal.key);
                return (
                  <div key={meal.key} className="meal-card">
                    <div className="mc-head">
                      <span className="mc-emoji">{meal.emoji}</span>
                      <div>
                        <div className="mc-title">{meal.name}</div>
                        <div className="mc-time">{meal.time}</div>
                      </div>
                      <span className="mc-count">{items.length}</span>
                    </div>
                    <div className="mc-body">
                      <div className="item-list">
                        {items.length > 0 ? items.map(item => (
                          <div key={item.id || item._id} className="item-row">
                            <span className="item-name">{item.name}</span>
                            <button className="item-del" onClick={() => deleteItem(item.id || item._id)}>✕</button>
                          </div>
                        )) : <div className="empty-meal">Nothing added yet</div>}
                      </div>
                      <div className="add-row">
                        <input className="add-input" id={`inp-${meal.key}`} placeholder="Add item…" onKeyDown={(e) => { if (e.key === 'Enter') addQuickItem(meal.key, `inp-${meal.key}`) }} />
                        <button className="add-btn-sm" onClick={() => addQuickItem(meal.key, `inp-${meal.key}`)}>＋</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {showBulk && (
            <div className="panel">
              <div className="panel-head">
                <h3>＋ Add Menu Item</h3>
                <span style={{fontSize:'.72rem',color:'var(--muted)',cursor:'pointer'}} onClick={() => setShowBulk(false)}>✕ Close</span>
              </div>
              <div className="panel-body">
                <div className="bulk-grid">
                  <div>
                    <div className="bf-label">Item Name *</div>
                    <input className="bf-input" value={bulkItem.name} onChange={(e) => setBulkItem({...bulkItem, name: e.target.value})} placeholder="e.g. Dal Tadka, Poha…" />
                  </div>
                  <div>
                    <div className="bf-label">Meal *</div>
                    <select className="bf-input" value={bulkItem.meal} onChange={(e) => setBulkItem({...bulkItem, meal: e.target.value})}>
                      {MEALS.map(m => <option key={m.key} value={m.key}>{m.emoji} {m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="bf-label">Day *</div>
                    <select className="bf-input" value={bulkItem.day} onChange={(e) => setBulkItem({...bulkItem, day: e.target.value})}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <button className="btn-bulk" onClick={addBulkItem}>＋ Add</button>
                </div>
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel-head">
              <h3>📋 All Menu Items</h3>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'7px',padding:'5px 10px',color:'var(--text)',fontSize:'.74rem',fontFamily:"'DM Sans',sans-serif",outline:'none',width:'150px'}} />
                <button className="tb-btn" style={{height:'28px', fontSize:'.7rem'}} onClick={fetchMenu}>↻ Refresh</button>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table>
                <thead>
                  <tr><th>Item Name</th><th>Meal</th><th>Day</th><th>Added</th><th></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5"><div className="state-box"><div className="spinner"></div>Loading…</div></td></tr>
                  ) : filteredItems.length > 0 ? (
                    [...filteredItems].reverse().map(i => {
                      const date = i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : '—';
                      return (
                        <tr key={i.id || i._id}>
                          <td style={{fontWeight:500}}>{i.name}</td>
                          <td><span className={`chip ${MEAL_CHIPS[i.meal] || ''}`}>{i.meal}</span></td>
                          <td style={{color:'var(--muted)'}}>{i.day}</td>
                          <td style={{color:'var(--muted)'}}>{date}</td>
                          <td><button className="item-del" onClick={() => deleteItem(i.id || i._id)}>🗑</button></td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan="5"><div className="state-box">No items match.</div></td></tr>
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

export default AdminMenu;
