import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Canteen.css';
import AdminSidebar from '../../components/AdminSidebar';

const EMOJI = { snacks:'🥪', meals:'🍱', drinks:'🥤', sweets:'🍰', other:'🧴' };

const AdminCanteen = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({ name: '', category: 'Snacks', price: '', stock: '50', available: 'true' });

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchItems();
    }
  }, [navigate]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/canteen');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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

  const addItem = async () => {
    if (!form.name || !form.price) {
      alert("Name and Price are required.");
      return;
    }
    try {
      const res = await fetch('/api/canteen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: parseInt(form.price),
          stock: parseInt(form.stock || '50'),
          available: form.available === 'true'
        })
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => [...prev, newItem]);
        setForm({ name: '', category: 'Snacks', price: '', stock: '50', available: 'true' });
        setShowAddForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateItem = async (id, data) => {
    try {
      const res = await fetch(`/api/canteen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => (i.id === id || i._id === id) ? updated : i));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAvail = async (id, current) => {
    await updateItem(id, { available: !current });
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/canteen/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id && i._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    if (!items.length) return;
    const rows = [['ID', 'Name', 'Category', 'Price', 'Stock', 'Available']];
    items.forEach(i => rows.push([i.id || i._id, i.name, i.category, i.price, i.stock ?? '', i.available ? 'Yes' : 'No']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canteen_items_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!session) return null;

  const initials = session.name ? session.name.substring(0, 2).toUpperCase() : 'A';
  
  const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
  const avail = items.filter(i => i.available);
  const low = items.filter(i => (i.stock ?? 999) <= 5);

  const filteredItems = items.filter(i => {
    const matchCat = activeCat === 'all' || (i.category || '').toLowerCase() === activeCat.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div>
            <h1>Canteen Management</h1>
            <p>Manage items, pricing, stock & availability</p>
          </div>
        </div>
        <div className="topbar-right">
          <button className="tb-btn" onClick={exportCSV}>⬇ Export</button>
          <button className="tb-btn primary" onClick={() => setShowAddForm(!showAddForm)}>＋ Add Item</button>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="sc-label">Total Items</div>
            <div className="sc-val" style={{color:'var(--accent)'}}>{items.length}</div>
            <div className="sc-sub">{avail.length} available · {items.length - avail.length} unavailable</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Available Now</div>
            <div className="sc-val" style={{color:'var(--accent2)'}}>{avail.length}</div>
            <div className="sc-sub">out of {items.length} items</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Categories</div>
            <div className="sc-val" style={{color:'var(--gold)'}}>{cats.length}</div>
            <div className="sc-sub">{cats.join(', ') || '—'}</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Low / No Stock</div>
            <div className="sc-val" style={{color:'var(--danger)'}}>{low.length}</div>
            <div className="sc-sub">{low.length ? low.map(i=>i.name).join(', ') : 'All stocked well ✓'}</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>🏪 Item Catalog</h3>
            <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
              <input type="text" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'5px 10px',color:'var(--text)',fontSize:'.76rem',fontFamily:"'DM Sans',sans-serif",outline:'none',width:'160px'}} />
              <button className="tb-btn" onClick={fetchItems} style={{height:'30px', fontSize:'.72rem'}}>↻ Refresh</button>
            </div>
          </div>
          <div className="panel-body">
            <div className="cat-tabs">
              <button className={`cat-tab ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>🍽 All ({items.length})</button>
              {cats.map(cat => {
                const count = items.filter(i => i.category === cat).length;
                return <button key={cat} className={`cat-tab ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>{EMOJI[(cat||'').toLowerCase()]||'🏷️'} {cat} ({count})</button>
              })}
            </div>

            {loading ? (
              <div className="state-box"><div className="spinner"></div>Loading items…</div>
            ) : filteredItems.length > 0 ? (
              <div>
                {filteredItems.map(item => {
                  const id = item.id || item._id;
                  const stock = item.stock ?? 0;
                  const stockColor = stock <= 0 ? 'var(--danger)' : stock <= 5 ? 'var(--gold)' : 'var(--text)';
                  return (
                    <div key={id} className="catalog-item">
                      <span className="ci-emoji">{EMOJI[(item.category||'').toLowerCase()]||'🏷️'}</span>
                      <div>
                        <div className="ci-name">{item.name} {stock <= 5 && <span className="pill pill-red" style={{fontSize:'.55rem'}}>Low</span>}</div>
                        <div className="ci-cat">{item.category || '—'}</div>
                      </div>
                      <div className="ci-price-wrap">
                        <span className="ci-prefix">₹</span>
                        <input className="ci-price-inp" type="number" defaultValue={item.price} min="1" onBlur={e => { if(+e.target.value !== item.price) updateItem(id, {price: +e.target.value}) }} />
                      </div>
                      <input className="ci-stock-inp" type="number" defaultValue={stock} min="0" style={{color: stockColor}} onBlur={e => { if(+e.target.value !== stock) updateItem(id, {stock: +e.target.value}) }} />
                      <button className={`avail-toggle ${item.available ? 'on' : 'off'}`} onClick={() => toggleAvail(id, item.available)}></button>
                      <button className="del-btn" onClick={() => deleteItem(id)}>🗑</button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="state-box">No items match.</div>
            )}

            {showAddForm && (
              <div>
                <div className="add-form">
                  <div className="af-field"><label className="af-label">Item Name *</label><input className="af-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Paneer Wrap" /></div>
                  <div className="af-field">
                    <label className="af-label">Category *</label>
                    <select className="af-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option>Snacks</option><option>Meals</option><option>Drinks</option><option>Sweets</option><option>Other</option>
                    </select>
                  </div>
                  <div className="af-field"><label className="af-label">Price (₹) *</label><input className="af-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="55" min="1" /></div>
                  <div className="af-field"><label className="af-label">Stock</label><input className="af-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="50" min="0" /></div>
                  <div className="af-field">
                    <label className="af-label">Available</label>
                    <select className="af-input" value={form.available} onChange={e => setForm({...form, available: e.target.value})}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                  <button className="btn-add" onClick={addItem}>＋ Add</button>
                </div>
                <div style={{marginTop:'8px', textAlign:'right'}}><span style={{fontSize:'.7rem', color:'var(--muted)', cursor:'pointer'}} onClick={() => setShowAddForm(false)}>✕ Cancel</span></div>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>📊 Category Breakdown</h3></div>
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Category</th><th>Items</th><th>Available</th><th>Unavailable</th><th>Avg Price</th><th>Low Stock</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6"><div className="state-box"><div className="spinner"></div>Loading…</div></td></tr>
                ) : cats.length > 0 ? (
                  cats.map(cat => {
                    const cItems = items.filter(i => i.category === cat);
                    const cAvail = cItems.filter(i => i.available).length;
                    const cLow = cItems.filter(i => (i.stock ?? 999) <= 5).length;
                    const avg = cItems.length ? Math.round(cItems.reduce((s,i) => s+(i.price||0),0)/cItems.length) : 0;
                    return (
                      <tr key={cat}>
                        <td><span style={{marginRight:'6px'}}>{EMOJI[(cat||'').toLowerCase()]||'🏷️'}</span>{cat}</td>
                        <td style={{fontFamily:"'Syne',sans-serif", fontWeight:700}}>{cItems.length}</td>
                        <td><span className="pill pill-green">{cAvail}</span></td>
                        <td><span className={`pill ${cItems.length - cAvail > 0 ? 'pill-red' : 'pill-muted'}`}>{cItems.length - cAvail}</span></td>
                        <td style={{color:'var(--gold)', fontWeight:600}}>₹{avg}</td>
                        <td>{cLow > 0 ? <span className="pill pill-red">{cLow} low</span> : <span className="pill pill-green">OK</span>}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan="6"><div className="state-box">No items yet</div></td></tr>
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

export default AdminCanteen;
