import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Canteen.css';

const EMOJI = { snacks: '🥪', meals: '🍱', drinks: '🥤', sweets: '🍰', other: '🧴' };
const catEmoji = (cat) => EMOJI[(cat || '').toLowerCase()] || '🍽️';

const statusColor = { delivered: 'var(--accent2)', cancelled: 'var(--danger)', pending: 'var(--gold)', preparing: 'var(--accent2)', ready: 'var(--orange)' };

const StudentCanteen = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [canteenItems, setCanteenItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [activeCat, setActiveCat] = useState('all');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [liveTime, setLiveTime] = useState('');
  const [toasts, setToasts] = useState([]);
  const [processingItems, setProcessingItems] = useState({});

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchCanteenItems();
      fetchOrders(s.id);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = (msg, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const fetchCanteenItems = async () => {
    setLoadingItems(true);
    setItemsError(null);
    try {
      const res = await fetch('/api/canteen');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setCanteenItems(data);
    } catch (err) {
      setItemsError(err.message);
      addToast('Failed to load menu', 'var(--danger)');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchOrders = async (studentId) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?studentId=${studentId}&source=canteen&limit=10`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  const placeOrder = async (item) => {
    if (!item.available) {
      addToast('Item not available', 'var(--danger)');
      return;
    }
    
    setProcessingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.id,
          studentName: session.name,
          roll: session.roll || session.id,
          dept: session.dept || '',
          source: 'canteen',
          items: [{ id: item.id, name: item.name, price: item.price, quantity: 1 }],
          totalAmount: item.price
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Order failed (${res.status})`);
      }
      addToast(`✅ Order placed · ${item.name}`, 'var(--accent)');
      fetchOrders(session.id);
    } catch (err) {
      addToast(err.message || 'Order failed', 'var(--danger)');
    } finally {
      setProcessingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const availCount = canteenItems.filter(i => i.available).length;
  const cats = [...new Set(canteenItems.map(i => i.category).filter(Boolean))];
  const itemsToShow = activeCat === 'all' ? canteenItems : canteenItems.filter(i => (i.category || '').toLowerCase() === activeCat.toLowerCase());

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Campus Canteen</h1>
            <p>Browse &amp; order from today's canteen menu</p>
          </div>
        </div>

        <div className="content">
          <div className="status-banner">
            <div className={`status-dot ${!loadingItems && availCount === 0 ? 'closed' : ''}`}></div>
            <div className="status-info">
              <div className="status-title">{!loadingItems && availCount === 0 ? 'No items available right now' : 'Canteen is Open'}</div>
              <div className="status-sub">{!loadingItems && availCount === 0 ? 'Check back soon' : `${availCount} items available · tap to order`}</div>
            </div>
            <div className="status-time">{liveTime}</div>
          </div>

          <div className="canteen-layout">
            <div>
              <div className="cat-tabs">
                <button className={`cat-tab ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>
                  🍽️ All ({canteenItems.length})
                </button>
                {cats.map(cat => {
                  const count = canteenItems.filter(i => i.category === cat).length;
                  return (
                    <button key={cat} className={`cat-tab ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
                      {catEmoji(cat)} {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="food-grid">
                {loadingItems ? (
                  <div className="grid-state"><div className="spinner"></div><p>Loading menu…</p></div>
                ) : itemsError ? (
                  <div className="grid-state">
                    <div className="grid-icon">⚠️</div>
                    <p style={{color:'var(--danger)',marginBottom:'10px'}}>{itemsError}</p>
                    <button onClick={fetchCanteenItems} style={{padding:'7px 16px',borderRadius:'8px',background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--muted)',cursor:'pointer',fontSize:'.78rem'}}>Retry</button>
                  </div>
                ) : !itemsToShow.length ? (
                  <div className="grid-state"><div className="grid-icon">🍽️</div><p>No items in this category.</p></div>
                ) : (
                  itemsToShow.map(item => (
                    <div key={item.id} className={`food-card ${!item.available ? 'unavail' : ''}`} onClick={() => item.available && placeOrder(item)}>
                      <span className="food-emoji">{catEmoji(item.category)}</span>
                      <div className="food-name">{item.name}</div>
                      <div className="food-cat">{item.category || ''}</div>
                      <div className="food-footer">
                        <span className="food-price">₹{item.price}</span>
                        {!item.available ? (
                          <span className="pill pill-red" style={{fontSize:'.6rem'}}>Unavailable</span>
                        ) : (
                          <button 
                            className="add-btn" 
                            disabled={processingItems[item.id]} 
                            onClick={(e) => { e.stopPropagation(); placeOrder(item); }}
                          >
                            {processingItems[item.id] ? '…' : '+'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="panel">
                <div className="panel-head">
                  <h3>🛒 My Recent Orders</h3>
                  <button onClick={() => fetchOrders(session.id)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:'.72rem',cursor:'pointer'}}>↻</button>
                </div>
                <div className="panel-body" style={{padding: '0'}}>
                  {loadingOrders ? (
                    <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}><div className="spinner"></div></div>
                  ) : !orders.length ? (
                    <div style={{textAlign:'center',padding:'24px',color:'var(--muted)',fontSize:'.8rem'}}>No orders yet.<br/>Tap any item to order!</div>
                  ) : (
                    <div style={{padding: '14px 16px'}}>
                      {orders.map(o => {
                        const itemLabel = (o.items || []).map(i => `${i.name}${i.quantity > 1 ? ' ×' + i.quantity : ''}`).join(', ');
                        const sc = statusColor[o.status] || 'var(--muted)';
                        return (
                          <div className="order-item" key={o._id}>
                            <div className="oi-icon">🛒</div>
                            <div className="oi-body">
                              <div className="oi-name">{itemLabel}</div>
                              <div className="oi-status">{o.time || o.date || '—'} · <span style={{color: sc, fontWeight: 600}}>{o.status || '—'}</span></div>
                            </div>
                            <span className="oi-amt">−₹{o.totalAmount}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {canteenItems.length > 0 && (
                <div className="panel">
                  <div className="panel-head"><h3>📊 Menu Summary</h3></div>
                  <div className="panel-body">
                    {cats.map(cat => {
                      const items = canteenItems.filter(i => i.category === cat && i.available);
                      if (!items.length) return null;
                      const min = Math.min(...items.map(i => i.price));
                      const max = Math.max(...items.map(i => i.price));
                      return (
                        <div key={cat} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                          <span style={{fontSize:'.78rem'}}>{catEmoji(cat)} {cat}</span>
                          <div style={{textAlign:'right'}}>
                            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'.82rem',color:'var(--accent)',display:'block'}}>{items.length} items</span>
                            <span style={{fontSize:'.68rem',color:'var(--muted)'}}>₹{min}–₹{max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default StudentCanteen;

