import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Orders.css';

const ITEMS = {
  dal: { id: 'dal', name: 'Extra Dal + Rice', price: 45, icon: '🍛', desc: 'Full plate — steamed rice with dal tadka' },
  roti: { id: 'roti', name: 'Extra Roti (4 pcs)', price: 20, icon: '🫓', desc: 'Soft wheat rotis, served hot' },
  paneer: { id: 'paneer', name: 'Paneer Sabzi', price: 60, icon: '🥘', desc: 'Cottage cheese in tomato-onion gravy' },
  salad: { id: 'salad', name: 'Fresh Salad Bowl', price: 25, icon: '🥗', desc: 'Cucumber, tomato, onion, lemon' },
  curd: { id: 'curd', name: 'Curd (200ml)', price: 15, icon: '🧀', desc: 'Homestyle set curd' },
  chai: { id: 'chai', name: 'Chai (250ml)', price: 12, icon: '🍵', desc: 'Masala ginger chai' },
  lassi: { id: 'lassi', name: 'Lassi (300ml)', price: 30, icon: '🥛', desc: 'Sweet or salted' },
};

const CATEGORIES = [
  { title: '🍱 Mains', items: ['dal', 'roti', 'paneer'] },
  { title: '🥗 Sides & Salads', items: ['salad', 'curd'] },
  { title: '🥤 Beverages', items: ['chai', 'lassi'] },
];

const StudentOrders = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [toasts, setToasts] = useState([]);
  
  const todayDateStr = useMemo(() => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), []);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchOrders(s.id);
    }
  }, [navigate]);

  const addToast = (msg, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const fetchOrders = async (studentId) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.reverse()); // latest first
      }
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

  const changeQty = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + delta;
      return { ...prev, [id]: Math.max(0, newQty) };
    });
  };

  const removeItem = (id) => {
    setCart(prev => ({ ...prev, [id]: 0 }));
  };

  const placeOrder = async () => {
    const entries = Object.entries(cart).filter(([, q]) => q > 0);
    if (!entries.length) {
      addToast("Add items first", "var(--danger)");
      return;
    }
    
    setIsPlacingOrder(true);
    
    const orderItems = entries.map(([key, qty]) => ({ 
      name: ITEMS[key].name, 
      quantity: qty, 
      price: ITEMS[key].price 
    }));
    
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + 5; // adding 5 service charge
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId: session.id, 
          studentName: session.name || "", 
          roll: session.roll || "", 
          dept: session.dept || "", 
          items: orderItems, 
          meal: "Lunch", 
          totalAmount: total 
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.status);
      }
      
      addToast("Order placed successfully 🎉", "var(--accent2)");
      setCart({}); // clear cart
      fetchOrders(session.id);
    } catch (e) {
      addToast("Network error: " + e.message, "var(--danger)");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const cartEntries = Object.entries(cart).filter(([, q]) => q > 0);
  const cartItemCount = cartEntries.reduce((s, [, q]) => s + q, 0);
  const cartSubtotal = cartEntries.reduce((s, [k, q]) => s + ITEMS[k].price * q, 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + 5 : 0;

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Extra Orders</h1>
            <p>Order additional items from today's mess menu</p>
          </div>
        </div>

        <div className="content">
          <div className="order-layout">
            <div className="menu-section">
              <div className="panel" style={{marginBottom: 0}}>
                <div className="panel-head">
                  <h3>Today's Order Menu — <span>{todayDateStr}</span></h3>
                  <span className="pill pill-green">Kitchen Open</span>
                </div>
                <div className="panel-body">
                  {CATEGORIES.map(cat => (
                    <div key={cat.title}>
                      <div className="menu-cat-label">{cat.title}</div>
                      <div className="menu-items">
                        {cat.items.map(id => {
                          const item = ITEMS[id];
                          const qty = cart[id] || 0;
                          return (
                            <div className="menu-item" key={id}>
                              <span className="item-icon">{item.icon}</span>
                              <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-desc">{item.desc}</div>
                              </div>
                              <span className="item-price">₹{item.price}</span>
                              <div className="qty-control">
                                <button className="qty-btn" onClick={() => changeQty(id, -1)}>−</button>
                                <span className="qty-num">{qty}</span>
                                <button className="qty-btn" onClick={() => changeQty(id, 1)}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" style={{marginTop: '16px'}}>
                <div className="panel-head"><h3>Order History</h3></div>
                <div className="panel-body" style={{paddingTop: '4px', paddingBottom: '4px'}}>
                  {loadingOrders ? (
                    <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Loading...</div>
                  ) : !orders.length ? (
                    <div style={{textAlign:'center',padding:'20px',color:'var(--muted)',fontSize:'.8rem'}}>No past orders found.</div>
                  ) : (
                    orders.map(order => (
                      <div className="order-hist-item" key={order._id || order.id}>
                        <div className="oh-icon">🛒</div>
                        <div className="oh-body">
                          <div className="oh-top">
                            <span className="oh-id">#{order.id || String(order._id).slice(-6).toUpperCase()}</span>
                            <span className="pill pill-blue">{order.status || 'completed'}</span>
                            <span className="oh-date">{new Date(order.date || order.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="oh-items">
                            {(order.items || []).map(i => `${i.name} ×${i.quantity}`).join(" · ")}
                          </div>
                          <div className="oh-price">₹{order.totalAmount}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="cart-panel">
                <div className="cart-head">
                  <h3>Your Order</h3>
                  <span className="cart-count">{cartItemCount} items</span>
                </div>
                <div className="cart-body">
                  {!cartEntries.length ? (
                    <div className="cart-empty">
                      <div className="big">🛒</div>
                      Add items to place an order
                    </div>
                  ) : (
                    <>
                      <div className="cart-items">
                        {cartEntries.map(([k, q]) => (
                          <div className="cart-item" key={k}>
                            <span className="ci-name">{ITEMS[k].name}</span>
                            <span className="ci-qty">×{q}</span>
                            <span className="ci-price">₹{ITEMS[k].price * q}</span>
                            <button className="ci-remove" onClick={() => removeItem(k)}>✕</button>
                          </div>
                        ))}
                      </div>
                      <div id="cartSummary">
                        <hr className="cart-divider" />
                        <div className="cart-row"><span className="label">Subtotal</span><span>₹{cartSubtotal}</span></div>
                        <div className="cart-row"><span className="label">Service charge</span><span>₹5</span></div>
                        <hr className="cart-divider" />
                        <div className="cart-total"><span>Total</span><span>₹{cartTotal}</span></div>
                        <button className="btn-order" onClick={placeOrder} disabled={isPlacingOrder}>
                          {isPlacingOrder ? 'Placing...' : 'Place Order →'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
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

export default StudentOrders;

