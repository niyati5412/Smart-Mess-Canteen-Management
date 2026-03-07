/* ============================================================
   MessMate — Student Portal Shared JavaScript
   student-main.js  |  Used by: all student portal pages
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
 * @param {string} [loginPath='../login.html'] - relative path to login page
 */
function requireStudentSession(loginPath = '../login.html') {
  const s = getSession();
  if (!s) { window.location.replace(loginPath); return null; }

  if (s.role && s.role !== 'student') {
    const map = {
      admin: '../admin/dashboard.html',
      guardian: '../guardian/dashboard.html'
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

  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl)   nameEl.textContent   = name;
  if (idEl)     idEl.textContent     = s.id || s.studentId || '';
  if (emailEl)  emailEl.textContent  = s.email || '';

  return s;
}

/* ── FORMATTING HELPERS ─────────────────────────────────────── */
/** Format a number as Indian currency: ₹1,23,456 */
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/** Format a number as lakhs shorthand: ₹1.2L */
function fmtL(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'k';
  return '₹' + n;
}

/* ── SEEDED ATTENDANCE GENERATOR ────────────────────────────── */
/**
 * Stable pseudo-random for a given date seed.
 * Returns 0–1, same value every call for the same seed.
 */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * Returns attendance status for a given Date.
 * 1 = all meals eaten, 2 = partial, 3 = skipped all
 */
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

/* ============================================================
   MessMate — Admin Portal Shared JavaScript
   Added to student-main.js for unified shared JS
   Used by: all admin portal pages
   ============================================================ */

/* ── CONFIRM OVERLAY CLOSE ───────────────────────────────────── */
function closeConfirm() {
  const el = document.getElementById('confirmOverlay');
  if (el) el.classList.remove('open');
}

/* ── ADMIN SESSION CHECK ─────────────────────────────────────── */
/**
 * Require a valid admin session.
 * Redirects to login if missing/wrong role.
 * Populates sidebar avatar, name, email from session.
 * @param {string} [loginPath='../login.html']
 */
function requireAdminSession(loginPath = '../login.html') {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem('mm_session')); } catch (e) {}
  if (!s) { window.location.href = loginPath; return null; }
  if (s.role !== 'admin') {
    const map = { student: '../student/dashboard.html', guardian: '../guardian/dashboard.html' };
    window.location.href = map[s.role] || loginPath;
    return null;
  }
  const name     = s.name || 'Admin';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const av  = document.getElementById('sidebarAvatar') || document.getElementById('userAvatar');
  const nm  = document.getElementById('sidebarName')   || document.getElementById('userName');
  const em  = document.getElementById('sidebarEmail')  || document.getElementById('userEmail');
  if (av) av.textContent = initials;
  if (nm) nm.textContent = name;
  if (em) em.textContent = s.email || '';
  return s;
}

/* ── GUARDIAN SESSION CHECK ──────────────────────────────────── */
/**
 * Require a valid guardian session.
 * Redirects to login if missing/wrong role.
 * Returns session object or null.
 * @param {string} [loginPath='../login.html']
 */
function requireGuardianSession(loginPath = '../login.html') {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem('mm_session')); } catch (e) {}
  if (!s) { window.location.href = loginPath; return null; }
  if (s.role !== 'guardian') {
    const map = { student: '../student/dashboard.html', admin: '../admin/dashboard.html' };
    window.location.href = map[s.role] || loginPath;
    return null;
  }
  return s;
}

/* ── CSV DOWNLOAD ────────────────────────────────────────────── */
/**
 * Download a 2D array as a CSV file.
 * @param {Array[]} rows  - array of arrays (first row = headers)
 * @param {string}  filename
 */
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