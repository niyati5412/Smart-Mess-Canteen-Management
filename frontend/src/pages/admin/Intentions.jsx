import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import './Intentions.css';

const MEALS = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7:30–9:00', cutoff: '7:00 AM' },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', time: '12:30–2:00', cutoff: '11:00 AM' },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7:30–9:00', cutoff: '3:00 PM' },
  { id: 'snacks', name: 'Snacks', emoji: '☕', time: '4:30–5:30', cutoff: '3:30 PM' },
];

const AdminIntentions = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMeal, setFilterMeal] = useState('all'); // all, breakfast, lunch, dinner, snacks
  const [filterStatus, setFilterStatus] = useState('all'); // all, eating, skipping, pending

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'admin') {
      navigate('/login');
    } else {
      setSession(s);
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/intentions')
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setStudents(uData.filter(u => u.role === 'student'));
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setIntentions(iData);
      }
    } catch (err) {
      console.error('Error fetching admin intentions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateIntentions = useMemo(() => {
    return intentions.filter(i => i.date === selectedDate);
  }, [intentions, selectedDate]);

  // Overall Statistics for Selected Date
  const totalStudents = students.length;
  
  const mealStats = useMemo(() => {
    const stats = {};
    MEALS.forEach(m => {
      const mealInts = selectedDateIntentions.filter(i => i.meal === m.id);
      const eating = mealInts.filter(i => i.status === 'eating').length;
      const skipping = mealInts.filter(i => i.status === 'skipping').length;
      const pending = Math.max(0, totalStudents - (eating + skipping));
      const eatPct = totalStudents > 0 ? Math.round((eating / totalStudents) * 100) : 0;
      stats[m.id] = { eating, skipping, pending, eatPct };
    });
    return stats;
  }, [selectedDateIntentions, totalStudents]);

  const totalEatingAllMeals = Object.values(mealStats).reduce((acc, curr) => acc + curr.eating, 0);
  const totalSkippingAllMeals = Object.values(mealStats).reduce((acc, curr) => acc + curr.skipping, 0);
  const maxPossibleMeals = totalStudents * 4;
  const overallEatPct = maxPossibleMeals > 0 ? Math.round((totalEatingAllMeals / maxPossibleMeals) * 100) : 0;

  // Student Attendance Matrix for Selected Date
  const studentRows = useMemo(() => {
    return students.map(student => {
      const studentIdStr = String(student._id || student.id);
      const studentInts = selectedDateIntentions.filter(i => 
        String(i.studentId) === studentIdStr || i.studentName === student.name
      );

      const statusMap = {};
      MEALS.forEach(m => {
        const found = studentInts.find(i => i.meal === m.id);
        statusMap[m.id] = found ? found.status : 'pending';
      });

      return {
        id: studentIdStr,
        name: student.name,
        email: student.email,
        statusMap
      };
    });
  }, [students, selectedDateIntentions]);

  // Filtered Student Rows
  const filteredStudents = useMemo(() => {
    return studentRows.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.includes(searchQuery);

      if (!matchSearch) return false;

      if (filterStatus !== 'all') {
        if (filterMeal !== 'all') {
          return s.statusMap[filterMeal] === filterStatus;
        } else {
          return Object.values(s.statusMap).includes(filterStatus);
        }
      }

      return true;
    });
  }, [studentRows, searchQuery, filterMeal, filterStatus]);

  // CSV Export
  const exportCSV = () => {
    let csv = `Date,Student Name,Email,Student ID,Breakfast,Lunch,Dinner,Snacks\n`;
    studentRows.forEach(s => {
      csv += `"${selectedDate}","${s.name}","${s.email}","${s.id}","${s.statusMap.breakfast}","${s.statusMap.lunch}","${s.statusMap.dinner}","${s.statusMap.snacks}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mess_Intentions_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Student Intentions & Attendance Overview</h1>
            <p>Live count of students eating vs skipping meals</p>
          </div>
          <div className="topbar-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="date-picker-input"
            />
            <button className="tb-btn primary" onClick={exportCSV}>⬇ Export CSV Report</button>
          </div>
        </div>

        <div className="content">
          {/* Summary Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="sc-label">Total Registered Students</div>
              <div className="sc-val" style={{ color: 'var(--accent)' }}>{totalStudents}</div>
              <div className="sc-sub">Active mess members</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Eating Today</div>
              <div className="sc-val" style={{ color: 'var(--accent2)' }}>{totalEatingAllMeals}</div>
              <div className="sc-sub">{overallEatPct}% overall participation</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Skipping Today</div>
              <div className="sc-val" style={{ color: 'var(--danger)' }}>{totalSkippingAllMeals}</div>
              <div className="sc-sub">Meals opted out</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Date Selected</div>
              <div className="sc-val" style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>{selectedDate}</div>
              <div className="sc-sub">Showing status for this date</div>
            </div>
          </div>

          {/* Per Meal Breakdown Cards */}
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>
            Meal Preparation Quantities — {selectedDate}
          </div>
          <div className="meal-breakdown-grid">
            {MEALS.map(m => {
              const st = mealStats[m.id] || { eating: 0, skipping: 0, pending: 0, eatPct: 0 };
              return (
                <div key={m.id} className="meal-stat-card">
                  <div className="msc-header">
                    <span className="msc-emoji">{m.emoji}</span>
                    <div>
                      <div className="msc-title">{m.name}</div>
                      <div className="msc-time">{m.time} · Cutoff {m.cutoff}</div>
                    </div>
                  </div>

                  <div className="msc-numbers">
                    <div className="msc-num-item">
                      <div className="msc-val" style={{ color: 'var(--accent)' }}>{st.eating}</div>
                      <div className="msc-lbl">Eating</div>
                    </div>
                    <div className="msc-num-item">
                      <div className="msc-val" style={{ color: 'var(--danger)' }}>{st.skipping}</div>
                      <div className="msc-lbl">Skipping</div>
                    </div>
                    <div className="msc-num-item">
                      <div className="msc-val" style={{ color: 'var(--gold)' }}>{st.pending}</div>
                      <div className="msc-lbl">Pending</div>
                    </div>
                  </div>

                  <div className="msc-prog-bar">
                    <div className="msc-prog-fill" style={{ width: `${st.eatPct}%` }}></div>
                  </div>
                  <div className="msc-pct-text">{st.eatPct}% of students eating</div>
                </div>
              );
            })}
          </div>

          {/* Student Table Section */}
          <div className="panel" style={{ marginTop: '24px' }}>
            <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3>Student Attendance Status Matrix ({filteredStudents.length} Students)</h3>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Search student name or ID..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="search-input"
                />
                
                <select value={filterMeal} onChange={(e) => setFilterMeal(e.target.value)} className="filter-select">
                  <option value="all">All Meals</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                  <option value="all">All Statuses</option>
                  <option value="eating">Eating Only</option>
                  <option value="skipping">Skipping Only</option>
                  <option value="pending">Pending/Unmarked</option>
                </select>
              </div>
            </div>

            <div className="panel-body" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="panel-table intentions-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email / ID</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                    <th>Snacks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                        No student records found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td>
                          <strong style={{ color: 'var(--text)' }}>{s.name}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                            {s.email}
                          </span>
                        </td>
                        {MEALS.map(m => {
                          const st = s.statusMap[m.id];
                          if (st === 'eating') {
                            return <td key={m.id}><span className="pill pill-green">✓ Eating</span></td>;
                          } else if (st === 'skipping') {
                            return <td key={m.id}><span className="pill pill-red">✕ Skipping</span></td>;
                          } else {
                            return <td key={m.id}><span className="pill pill-muted">⏳ Unmarked</span></td>;
                          }
                        })}
                      </tr>
                    ))
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

export default AdminIntentions;
