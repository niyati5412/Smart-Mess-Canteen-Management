import React, { useEffect, useState, useMemo } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Link, useNavigate } from 'react-router-dom';
import './Feedback.css';

const TODAY = new Date().toISOString().split('T')[0];
const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

const StudentFeedback = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Feedback state
  const [mealRatings, setMealRatings] = useState({});
  const [mealComments, setMealComments] = useState({});
  const [submittingMeal, setSubmittingMeal] = useState({});
  
  const [generalCategory, setGeneralCategory] = useState('Food Quality');
  const [generalPriority, setGeneralPriority] = useState('low');
  const [generalMeal, setGeneralMeal] = useState('General');
  const [generalText, setGeneralText] = useState('');
  const [submittingGeneral, setSubmittingGeneral] = useState(false);

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'student') {
      navigate('/login');
    } else {
      setSession(s);
      fetchFeedback(s.id);
    }
  }, [navigate]);

  const addToast = (msg, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const fetchFeedback = async (studentId) => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.filter(f => f.studentId === studentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  const submitMealFeedback = async (meal) => {
    if (submittingMeal[meal] || feedbacks.some(f => f.meal === meal && f.date === TODAY && f.rating)) return;
    
    const rating = mealRatings[meal];
    if (!rating) {
      addToast('Select rating first', 'var(--gold)');
      return;
    }
    const comment = mealComments[meal] || '';
    
    setSubmittingMeal(prev => ({ ...prev, [meal]: true }));
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: session.id, 
          studentName: session.name, 
          meal, 
          rating, 
          category: meal, 
          priority: 'low', 
          comment, 
          date: TODAY 
        })
      });
      addToast('Feedback saved', 'var(--accent)');
      fetchFeedback(session.id);
    } catch (err) {
      addToast('Error saving feedback', 'var(--danger)');
      setSubmittingMeal(prev => ({ ...prev, [meal]: false }));
    }
  };

  const submitGeneral = async () => {
    if (!generalText.trim()) {
      addToast('Write something first', 'var(--gold)');
      return;
    }
    
    setSubmittingGeneral(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: session.id, 
          studentName: session.name, 
          meal: generalMeal.toLowerCase(), 
          rating: null, 
          category: generalCategory, 
          priority: generalPriority, 
          comment: generalText.trim(), 
          date: TODAY 
        })
      });
      setGeneralText('');
      addToast('Feedback submitted', 'var(--accent)');
      fetchFeedback(session.id);
    } catch (err) {
      addToast('Error submitting feedback', 'var(--danger)');
    } finally {
      setSubmittingGeneral(false);
    }
  };

  const renderStars = (meal) => {
    const isSubmitted = feedbacks.some(f => f.meal === meal && f.date === TODAY && f.rating);
    const currentRating = isSubmitted ? feedbacks.find(f => f.meal === meal && f.date === TODAY && f.rating).rating : (mealRatings[meal] || 0);
    
    return (
      <>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(val => (
            <span 
              key={val} 
              className={`star ${val <= currentRating ? 'active' : ''}`} 
              onClick={() => !isSubmitted && setMealRatings(prev => ({ ...prev, [meal]: val }))}
              style={{cursor: isSubmitted ? 'default' : 'pointer'}}
            >
              ⭐
            </span>
          ))}
        </div>
        <div className="star-rating-label">
          {currentRating ? ratingLabels[currentRating] : 'Tap to rate'}
        </div>
      </>
    );
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const rated = feedbacks.filter(f => f.rating);
    if (!rated.length) return { avg: 0, count: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    
    const sum = rated.reduce((acc, curr) => acc + curr.rating, 0);
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rated.forEach(f => { if (f.rating) dist[f.rating]++; });
    
    return {
      avg: (sum / rated.length).toFixed(1),
      count: rated.length,
      dist
    };
  }, [feedbacks]);

  if (!session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <StudentSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div>
            <h1>Meal Feedback</h1>
            <p>Rate today's meals and share suggestions with the mess team</p>
          </div>
        </div>

        <div className="content">
          <span className="sec-label">Today's Meals — {new Date().toLocaleDateString('en-IN')}</span>
          <div className="sec-title" style={{marginBottom: '16px'}}>Rate what you ate</div>

          <div className="menu-cards">
            {/* Breakfast */}
            <div className="menu-card">
              <div className="mc-top"><span className="mc-emoji">🌅</span><span className="mc-ate-badge ate">Ate ✓</span></div>
              <div className="mc-name">Breakfast</div>
              <div className="mc-items">Poha · Chai · Banana · Boiled Eggs</div>
              {renderStars('breakfast')}
              <textarea 
                className="mc-comment" 
                placeholder="Anything to add? (optional)" 
                rows="2"
                value={mealComments['breakfast'] || ''}
                onChange={e => setMealComments(prev => ({...prev, breakfast: e.target.value}))}
                disabled={feedbacks.some(f => f.meal === 'breakfast' && f.date === TODAY && f.rating)}
              />
              <button 
                className="btn-submit-meal" 
                onClick={() => submitMealFeedback('breakfast')}
                disabled={feedbacks.some(f => f.meal === 'breakfast' && f.date === TODAY && f.rating) || submittingMeal['breakfast']}
              >
                {feedbacks.some(f => f.meal === 'breakfast' && f.date === TODAY && f.rating) ? '✓ Submitted' : 'Submit Rating'}
              </button>
            </div>

            {/* Lunch */}
            <div className="menu-card" style={{opacity: 0.55}}>
              <div className="mc-top"><span className="mc-emoji">☀️</span><span className="mc-ate-badge skip">Skipped ✕</span></div>
              <div className="mc-name">Lunch</div>
              <div className="mc-items">Dal Tadka · Jeera Rice · Roti · Sabzi · Curd</div>
              <div style={{fontSize: '.75rem', color: 'var(--muted)', padding: '20px 0', textAlign: 'center'}}>
                You skipped this meal —<br/>no rating needed
              </div>
            </div>

            {/* Dinner */}
            <div className="menu-card">
              <div className="mc-top"><span className="mc-emoji">🌙</span><span className="mc-ate-badge pending">Pending</span></div>
              <div className="mc-name">Dinner</div>
              <div className="mc-items">Rajma · Steamed Rice · Papad · Salad · Lassi</div>
              <div style={{fontSize: '.75rem', color: 'var(--muted)', padding: '20px 0', textAlign: 'center', lineHeight: 1.6}}>
                Meal hasn't happened yet.<br/>Come back after 7:30 PM to rate.
              </div>
            </div>

            {/* Snacks */}
            <div className="menu-card">
              <div className="mc-top"><span className="mc-emoji">☕</span><span className="mc-ate-badge ate">Opted In ✓</span></div>
              <div className="mc-name">Evening Snacks</div>
              <div className="mc-items">Samosa · Chai · Biscuits</div>
              {renderStars('snacks')}
              <textarea 
                className="mc-comment" 
                placeholder="Anything to add? (optional)" 
                rows="2"
                value={mealComments['snacks'] || ''}
                onChange={e => setMealComments(prev => ({...prev, snacks: e.target.value}))}
                disabled={feedbacks.some(f => f.meal === 'snacks' && f.date === TODAY && f.rating)}
              />
              <button 
                className="btn-submit-meal" 
                onClick={() => submitMealFeedback('snacks')}
                disabled={feedbacks.some(f => f.meal === 'snacks' && f.date === TODAY && f.rating) || submittingMeal['snacks']}
              >
                {feedbacks.some(f => f.meal === 'snacks' && f.date === TODAY && f.rating) ? '✓ Submitted' : 'Submit Rating'}
              </button>
            </div>
          </div>

          <span className="sec-label">General</span>
          <div className="sec-title">Share a suggestion or complaint</div>

          <div className="general-grid">
            <div className="panel">
              <div className="panel-head"><h3>New Feedback</h3></div>
              <div className="panel-body">
                <div className="field">
                  <label>Category</label>
                  <div className="chip-wrap">
                    {['Food Quality', 'Hygiene', 'Portion Size', 'Menu Variety', 'Serving Speed', 'Staff Behaviour', 'Timings', 'Other'].map(cat => (
                      <div key={cat} className={`chip ${generalCategory === cat ? 'selected' : ''}`} onClick={() => setGeneralCategory(cat)}>
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <div className="priority-row">
                    <div className={`priority-opt sel-low ${generalPriority === 'low' ? 'active' : ''}`} onClick={() => setGeneralPriority('low')}>🟢 Low</div>
                    <div className={`priority-opt sel-medium ${generalPriority === 'medium' ? 'active' : ''}`} onClick={() => setGeneralPriority('medium')}>🟡 Medium</div>
                    <div className={`priority-opt sel-high ${generalPriority === 'high' ? 'active' : ''}`} onClick={() => setGeneralPriority('high')}>🔴 High</div>
                  </div>
                </div>
                <div className="field">
                  <label>Your Feedback <span style={{color: 'var(--accent)'}}>*</span></label>
                  <textarea 
                    className="feedback-area" 
                    placeholder="Describe your experience, suggestion, or complaint…" 
                    rows="4"
                    value={generalText}
                    onChange={e => setGeneralText(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Meal Reference (optional)</label>
                  <div className="chip-wrap">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'General'].map(cat => (
                      <div key={cat} className={`chip ${generalMeal === cat ? 'selected' : ''}`} onClick={() => setGeneralMeal(cat)}>
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={submitGeneral} disabled={submittingGeneral}>
                  <span>{submittingGeneral ? 'Submitting...' : 'Submit Feedback'}</span>
                  {!submittingGeneral && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div className="panel">
                <div className="panel-head"><h3>Your Mess Ratings — This Month</h3></div>
                <div className="panel-body">
                  <div className="rating-summary">
                    <div className="overall-score">
                      <div className="score-big">{metrics.avg}</div>
                      <div className="score-stars">{'⭐'.repeat(Math.round(metrics.avg))}</div>
                      <div className="score-count">{metrics.count} ratings</div>
                    </div>
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(val => (
                        <div className="rb-row" key={val}>
                          <span className="rb-label">{val}</span>
                          <div className="rb-track">
                            <div className="rb-fill" style={{width: metrics.count ? `${(metrics.dist[val] / metrics.count) * 100}%` : '0%'}}></div>
                          </div>
                          <span className="rb-count">{metrics.dist[val]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel" style={{flex: 1}}>
                <div className="panel-head"><h3>Your Past Submissions</h3></div>
                <div className="panel-body" style={{paddingTop: '8px', paddingBottom: '8px'}}>
                  <div className="past-list">
                    {!feedbacks.length ? (
                      <div style={{padding:'20px',color:'var(--muted)'}}>No feedback submitted yet</div>
                    ) : (
                      feedbacks.map(f => (
                        <div className="past-item" key={f._id || Math.random()}>
                          <div className="past-icon" style={{background: 'rgba(0,229,160,0.1)'}}>💬</div>
                          <div className="past-body">
                            <div className="past-top">
                              <span className="past-category" style={{background: 'rgba(0,229,160,0.1)', color: 'var(--accent)'}}>{f.category}</span>
                              <span className="past-date">{new Date(f.date || f.createdAt).toLocaleDateString()}</span>
                            </div>
                            {f.rating && <div className="past-stars">{'⭐'.repeat(f.rating)}</div>}
                            <div className="past-text">{f.comment}</div>
                            {f.priority && <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '6px', textTransform: 'capitalize'}}>Priority: {f.priority}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

export default StudentFeedback;

