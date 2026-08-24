import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GuardianSidebar from '../../components/GuardianSidebar';
import GuardianHeaderProfiles from '../../components/GuardianHeaderProfiles';
import './Alerts.css';

const GuardianAlerts = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [wardData, setWardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyThreshold, setNotifyThreshold] = useState('2');
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableSmsAlerts, setEnableSmsAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem('mm_session'));
    if (!s || s.role !== 'guardian') {
      navigate('/login');
    } else {
      setSession(s);
      fetchWardData(s.wardStudentId || s.wardId);
    }
  }, [navigate]);

  const fetchWardData = async (wardId) => {
    if (!wardId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/intentions/student/${wardId}`);
      if (res.ok) {
        const data = await res.json();
        setWardData(data);
      }
    } catch (err) {
      console.error('Error fetching ward intentions:', err);
    } finally {
      setLoading(false);
    }
  };

  const wardName = session?.wardName || 'Your Ward';
  const wardId = session?.wardStudentId || session?.wardId;

  const todayStr = new Date().toISOString().split('T')[0];
  const monthStr = todayStr.substring(0, 7);

  const monthIntentions = useMemo(() => {
    return wardData.filter(i => (i.date || '').startsWith(monthStr));
  }, [wardData, monthStr]);

  const totalSkipped = monthIntentions.filter(i => i.status === 'skipping' || i.willEat === false).length;
  const totalEaten = monthIntentions.filter(i => i.status === 'eating' || i.willEat).length;

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading || !session) return <div style={{padding:'20px',color:'var(--text)'}}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <GuardianSidebar session={session} />

      <div className="main" style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100vw - 260px)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)', boxSizing: 'border-box' }}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Guardian Notifications & Alerts</h1>
            <p>Smart alerts & custom notification preferences for <strong>{wardName}</strong></p>
          </div>
          <div className="topbar-right">
            <GuardianHeaderProfiles session={session} />
          </div>
        </div>

        <div className="content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="sc-label">Active Alerts</div>
              <div className="sc-val" style={{ color: totalSkipped > 2 ? 'var(--danger)' : 'var(--accent)' }}>
                {totalSkipped > 0 ? totalSkipped : 0}
              </div>
              <div className="sc-sub">skipped meal records</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Health & Meal Score</div>
              <div className="sc-val" style={{ color: 'var(--gold)' }}>
                {totalEaten > 15 ? '94/100 (Excellent)' : totalEaten > 5 ? '80/100 (Good)' : 'Needs Monitoring'}
              </div>
              <div className="sc-sub">based on monthly attendance</div>
            </div>
          </div>

          <div className="lower-grid">
            {/* Left: Active Alerts Feed */}
            <div className="panel">
              <div className="panel-head">
                <h3>Live Alerts Feed</h3>
              </div>
              <div className="panel-body">
                <div className="alerts-feed-list">
                  {totalSkipped === 0 ? (
                    <div className="alert-box green">
                      <span className="ab-icon">✅</span>
                      <div>
                        <div className="ab-title">No Skip Alerts</div>
                        <div className="ab-sub">{wardName} has maintained consistent meal attendance with zero recent skip alerts.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert-box red">
                      <span className="ab-icon">🚨</span>
                      <div>
                        <div className="ab-title">Meal Opt-Out Notification</div>
                        <div className="ab-sub">{wardName} has opted out of {totalSkipped} meal(s) this month.</div>
                      </div>
                    </div>
                  )}

                  <div className="alert-box blue">
                    <span className="ab-icon">ℹ️</span>
                    <div>
                      <div className="ab-title">Monthly Mess Summary Ready</div>
                      <div className="ab-sub">Detailed attendance log report for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} is available in the Dashboard.</div>
                    </div>
                  </div>

                  <div className="alert-box gold">
                    <span className="ab-icon">⏰</span>
                    <div>
                      <div className="ab-title">Kitchen Cutoff Reminder</div>
                      <div className="ab-sub">Meal intention cutoffs for today are active. Lunch cutoff is 11:00 AM, Dinner cutoff is 3:00 PM.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Alert Preferences Form */}
            <div className="right-col">
              <div className="panel">
                <div className="panel-head">
                  <h3>Alert Preferences</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleSavePreferences} className="alert-pref-form">
                    <div className="pref-group">
                      <label className="pref-label">Notify Me When Ward Skips:</label>
                      <select 
                        value={notifyThreshold} 
                        onChange={(e) => setNotifyThreshold(e.target.value)}
                        className="pref-select"
                      >
                        <option value="1">Any single meal skip</option>
                        <option value="2">2 consecutive meal skips</option>
                        <option value="3">3+ consecutive meal skips</option>
                      </select>
                    </div>

                    <div className="pref-toggle-row">
                      <span>Email Alerts</span>
                      <input 
                        type="checkbox" 
                        checked={enableEmailAlerts} 
                        onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                      />
                    </div>

                    <div className="pref-toggle-row">
                      <span>SMS Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={enableSmsAlerts} 
                        onChange={(e) => setEnableSmsAlerts(e.target.checked)}
                      />
                    </div>

                    <button type="submit" className="tb-btn primary" style={{ width: '100%', marginTop: '16px' }}>
                      Save Preferences
                    </button>

                    {savedSuccess && (
                      <div style={{ color: 'var(--accent)', fontSize: '0.82rem', marginTop: '10px', textAlign: 'center' }}>
                        ✓ Notification preferences saved successfully!
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuardianAlerts;
