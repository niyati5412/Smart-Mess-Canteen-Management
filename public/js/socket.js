const socket = io();
const session = JSON.parse(sessionStorage.getItem('mm_session') || '{}');

if (session.role === 'admin') {
  socket.emit('join-admin');
  socket.on('new-order', (data) => {
    showSocketToast(`🛒 New order! ₹${data.totalPrice} — ${data.time}`, 'var(--accent)');
    if (typeof loadOrders === 'function') loadOrders();
  });
} else if (session.role === 'student') {
  socket.emit('join-student', session.id);
  socket.on('order-status-update', (data) => {
    showSocketToast(`📦 ${data.message}`, 'var(--accent2)');
  });
}

function showSocketToast(msg, color) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></div><span>${msg}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3000);
}