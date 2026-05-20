import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Orders.css';
import AdminSidebar from '../../components/AdminSidebar';

const AV_COLORS = ['#00b8ff','#00e5a0','#a78bfa','#f4c542','#ff6b35'];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchOrders();
    }
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => (o.id === id || o._id === id) ? updated : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllDelivered = async () => {
    const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    if (!active.length) return;
    try {
      const res = await fetch('/api/orders/mark-all-delivered', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAvColor = (name) => {
    const s = name && name.length > 0 ? name : '?';
    const c0 = s.charCodeAt(0) || 0;
    const c1 = s.length > 1 ? s.charCodeAt(1) || 0 : 0;
    return AV_COLORS[(c0 + c1) % AV_COLORS.length];
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  };

  const filteredOrders = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || (o.studentName || '').toLowerCase().includes(q) || (o.orderId || '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const tot = orders.length;
  const pend = orders.filter(o => o.status === 'pending').length;
  const prep = orders.filter(o => o.status === 'preparing' || o.status === 'ready').length;
  const del = orders.filter(o => o.status === 'delivered').length;
  const rev = orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const tabs = ['all','pending','preparing','ready','delivered','cancelled'];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />
      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div>
            <h1>Order Manager</h1>
            <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="topbar-right">
          <span className="live-dot"></span>
          <span style={{fontSize:'0.72rem', color:'var(--accent2)', marginRight:'4px'}}>Live</span>
          <button className="tb-btn" onClick={fetchOrders}>↻ Refresh</button>
          <button className="tb-btn primary" onClick={markAllDelivered}>✅ Mark All Delivered</button>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="sc-label">Total Orders</div>
            <div className="sc-val" style={{color:'var(--accent)'}}>{tot}</div>
            <div><span className="badge bb">{orders.filter(o => o.status !== 'cancelled').length} active</span></div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Pending</div>
            <div className="sc-val" style={{color:'var(--gold)'}}>{pend}</div>
            <div><span className="badge bgo">Needs action</span></div>
          </div>
          <div className="stat-card">
            <div className="sc-label">In Progress</div>
            <div className="sc-val" style={{color:'var(--accent)'}}>{prep}</div>
            <div><span className="badge bb">In kitchen</span></div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Delivered</div>
            <div className="sc-val" style={{color:'var(--accent2)'}}>{del}</div>
            <div><span className="badge bg">Completed</span></div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Revenue</div>
            <div className="sc-val" style={{color:'var(--purple)'}}>₹{rev}</div>
            <div><span className="badge bg">{orders.filter(o => o.paymentStatus === 'paid').length} paid</span></div>
          </div>
        </div>

        <div className="filter-bar">
          {tabs.map(t => (
            <button key={t} className={`filter-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'all' ? 'All' : t === 'pending' ? '⏳ Pending' : t === 'preparing' ? '🔵 Preparing' : t === 'ready' ? '🟠 Ready' : t === 'delivered' ? '✅ Delivered' : '✗ Cancelled'}
              <span className="tab-count">{t === 'all' ? orders.length : orders.filter(o => o.status === t).length}</span>
            </button>
          ))}
          <div className="filter-sep"></div>
          <div className="search-wrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="search-box" type="text" placeholder="Search name, order ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="orders-grid">
          {loading ? (
            <div className="state-box"><div className="spinner"></div><p>Loading orders…</p></div>
          ) : error ? (
            <div className="state-box"><div className="icon">⚠️</div><p style={{color:'var(--danger)'}}>{error}</p><button className="tb-btn" style={{margin:'14px auto 0'}} onClick={fetchOrders}>Retry</button></div>
          ) : filteredOrders.length === 0 ? (
            <div className="state-box"><div className="icon">📋</div><p>No orders found.</p></div>
          ) : (
            [...filteredOrders].reverse().map(o => {
              const mealCls = { Breakfast:'p-meal-b', Lunch:'p-meal-l', Dinner:'p-meal-d', Snacks:'p-meal-s' }[o.meal] || 'p-meal-l';
              const progVal = { pending:15, preparing:50, ready:80, delivered:100, cancelled:0 }[o.status] || 0;
              const progClr = { pending:'var(--gold)', preparing:'var(--accent)', ready:'var(--orange)', delivered:'var(--accent2)', cancelled:'var(--danger)' }[o.status];

              return (
                <div key={o.id || o._id} className="order-card">
                  <div className="status-bar"><div className="status-bar-fill" style={{width:`${progVal}%`, background:progClr}}></div></div>
                  <div className="card-top">
                    <div>
                      <div className="card-oid">{o.orderId || '—'}</div>
                      <div className="card-name">{o.studentName || 'Unknown'}</div>
                      <div className="card-roll">{o.roll || ''} · {o.dept || ''}</div>
                      <div style={{display:'flex', gap:'5px', marginTop:'6px', flexWrap:'wrap'}}>
                        <span className={`pill p-${o.status}`}><span className="pd"></span>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                        <span className={`pill ${o.paymentStatus === 'paid' ? 'p-paid' : 'p-unpaid'}`}>{o.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}</span>
                        <span className={`pill ${mealCls}`}>{o.meal || '—'}</span>
                      </div>
                    </div>
                    <div className="card-av" style={{background: getAvColor(o.studentName)}}>{getInitials(o.studentName)}</div>
                  </div>
                  <div className="card-body">
                    <div className="items-list">
                      {(o.items || []).map((i, idx) => (
                        <div key={idx} className="item-row">
                          <span className="item-name">{i.name}</span>
                          <div className="item-right">
                            <span className="item-qty">×{i.quantity}</span>
                            <span className="item-price">₹{i.price * i.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card-meta">
                      <div className="card-total" style={{color:'var(--accent2)'}}>Total: ₹{o.totalAmount || 0}</div>
                      <div className="card-time">🕐 {o.time || '—'}</div>
                    </div>
                  </div>
                  <div className="card-footer">
                    {o.status === 'pending' && <><button className="act-btn blue" onClick={() => updateStatus(o.id || o._id, 'preparing')}>🔵 Preparing</button><button className="act-btn red" onClick={() => updateStatus(o.id || o._id, 'cancelled')}>✗ Cancel</button></>}
                    {o.status === 'preparing' && <><button className="act-btn orange" onClick={() => updateStatus(o.id || o._id, 'ready')}>🟠 Mark Ready</button><button className="act-btn red" onClick={() => updateStatus(o.id || o._id, 'cancelled')}>✗ Cancel</button></>}
                    {o.status === 'ready' && <><button className="act-btn green" onClick={() => updateStatus(o.id || o._id, 'delivered')}>✅ Delivered</button><button className="act-btn red" onClick={() => updateStatus(o.id || o._id, 'cancelled')}>✗ Cancel</button></>}
                    {o.status === 'delivered' && <span style={{fontSize:'0.72rem', color:'var(--accent2)'}}>✓ Order complete</span>}
                    {o.status === 'cancelled' && <span style={{fontSize:'0.72rem', color:'var(--muted)'}}>Order cancelled</span>}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
