/* ============================================================
   MessMate — Student Portal Shared JavaScript
   main.js  |  Used by: all student portal pages
   ============================================================ */

/* ── SIDEBAR TOGGLE ────────────────────────────────────────── */
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('overlay');
  const open = s.classList.toggle('open');
  o.style.display = open ? 'block' : 'none';
}

/* ── TOAST NOTIFICATION ─────────────────────────────────────── */
function showToast(msg, color = 'var(--accent)') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-dot" style="background:${color}"></div><span>${msg}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 350);
  }, 2800);
}

/* ── SESSION HELPERS ────────────────────────────────────────── */
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('mm_session')); } catch (e) { return null; }
}

/**
 * Require a valid student session.
 * Redirects to login if missing/wrong role.
 * Populates sidebar user avatar, name, id from session.
 */
function requireStudentSession(loginPath = '/login') {
  const s = getSession();
  if (!s) { window.location.replace(loginPath); return null; }

  if (s.role && s.role !== 'student') {
    const map = {
      admin:    '/admin/dashboard',
      guardian: '/guardian/dashboard'
    };
    window.location.replace(map[s.role] || loginPath);
    return null;
  }

  const name     = s.name || 'Student';
  const initials = name.trim().split(' ').filter(Boolean)
                       .map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const avatarEl = document.getElementById('userAvatar');
  const nameEl   = document.getElementById('userName');
  const idEl     = document.getElementById('userId');
  const emailEl  = document.getElementById('userEmail');

  if (avatarEl) {
    if (s.profilePic) {
      avatarEl.innerHTML = `<img src="${s.profilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${name}">`;
    } else {
      avatarEl.textContent = initials;
    }
  }
  if (nameEl)  nameEl.textContent  = name;
  if (idEl)    idEl.textContent    = s.id || s.studentId || '';
  if (emailEl) emailEl.textContent = s.email || '';

  return s;
}

/* ── FORMATTING HELPERS ─────────────────────────────────────── */
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function fmtL(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'k';
  return '₹' + n;
}

/* ── SEEDED ATTENDANCE GENERATOR ────────────────────────────── */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getAttendanceStatus(date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const r = seededRand(seed);
  const isSunday = date.getDay() === 0;
  if (isSunday) {
    if (r < 0.20) return 3;
    if (r < 0.50) return 2;
    return 1;
  }
  if (r < 0.12) return 3;
  if (r < 0.30) return 2;
  return 1;
}

/* ── CONFIRM OVERLAY CLOSE ───────────────────────────────────── */
function closeConfirm() {
  const el = document.getElementById('confirmOverlay');
  if (el) el.classList.remove('open');
}

/* ── ADMIN SESSION CHECK ─────────────────────────────────────── */
function requireAdminSession(loginPath = '/login') {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem('mm_session')); } catch (e) {}
  if (!s) { window.location.href = loginPath; return null; }
  if (s.role !== 'admin') {
    const map = { student: '/student/dashboard', guardian: '/guardian/dashboard' };
    window.location.href = map[s.role] || loginPath;
    return null;
  }
  const name     = s.name || 'Admin';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const av  = document.getElementById('sidebarAvatar') || document.getElementById('userAvatar');
  const nm  = document.getElementById('sidebarName')   || document.getElementById('userName');
  const em  = document.getElementById('sidebarEmail')  || document.getElementById('userEmail');
  if (av) {
    if (s.profilePic) {
      av.innerHTML = `<img src="${s.profilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${name}">`;
    } else {
      av.textContent = initials;
    }
  }
  if (nm) nm.textContent = name;
  if (em) em.textContent = s.email || '';
  return s;
}

/* ── GUARDIAN SESSION CHECK ──────────────────────────────────── */
function requireGuardianSession(loginPath = '/login') {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem('mm_session')); } catch (e) {}
  if (!s) { window.location.href = loginPath; return null; }
  if (s.role !== 'guardian') {
    const map = { student: '/student/dashboard', admin: '/admin/dashboard' };
    window.location.href = map[s.role] || loginPath;
    return null;
  }
  return s;
}

/* ── CSV DOWNLOAD ────────────────────────────────────────────── */
function downloadCSV(rows, filename) {
  const csv = rows.map(r =>
    r.map(c => {
      const v = String(c == null ? '' : c).replace(/"/g, '""');
      return /[,"\n]/.test(v) ? '"' + v + '"' : v;
    }).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'export.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}