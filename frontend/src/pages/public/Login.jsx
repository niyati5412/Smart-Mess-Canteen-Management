import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = () => {
  const [currentRole, setCurrentRole] = useState('student');
  const [view, setView] = useState('login'); // 'login', 'forgot', 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('oauth_token');
    if (token) {
      const user = {
        id:         params.get('oauth_id'),
        name:       decodeURIComponent(params.get('oauth_name') || ''),
        email:      params.get('oauth_email'),
        role:       params.get('oauth_role'),
        profilePic: decodeURIComponent(params.get('oauth_profilePic') || ''),
        token:      token
      };

      sessionStorage.setItem('mm_session', JSON.stringify(user));

      const REDIRECTS = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        guardian: '/guardian/dashboard',
      };
      navigate(REDIRECTS[user.role] || '/');
    }
  }, [navigate]);

  const roleMeta = {
    student: { title: 'Student Login', sub: 'Enter your campus credentials to access your meal dashboard.', indicator: 'Signing in as Student', indicatorClass: '', btnClass: '' },
    admin: { title: 'Admin Login', sub: 'Access your mess management console and live analytics.', indicator: 'Signing in as Administrator', indicatorClass: 'blue', btnClass: 'blue' },
    guardian: { title: 'Guardian Login', sub: "View your ward's meal participation and monthly reports.", indicator: 'Signing in as Guardian', indicatorClass: 'gold', btnClass: 'gold' },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.user.role !== currentRole) {
        setError(`This account is registered as ${data.user.role}. Please select ${data.user.role} from the left panel and try again.`);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('mm_session', JSON.stringify(data.user));
      
      const REDIRECTS = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        guardian: '/guardian/dashboard',
      };
      navigate(REDIRECTS[data.user.role] || '/');
      
    } catch (err) {
      setError('Unable to reach the server. Please make sure the server is running and try again.');
      setIsLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setView('otp');
  };

  return (
    <div className="login-page">
      <div className="left-panel">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <nav className="panel-nav">
          <Link to="/" className="logo">Mess<span>Mate</span></Link>
          <Link to="/" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to home
          </Link>
        </nav>
        <div className="role-section">
          <div className="panel-label">Welcome Back</div>
          <h1 className="panel-title">Sign in to your <em>MessMate</em> account</h1>
          <p className="panel-sub">Choose your role to continue to the right dashboard.</p>
          <span className="role-label">SELECT YOUR ROLE</span>
          <div className="roles">
            <div className={`role-card ${currentRole === 'student' ? 'active' : ''}`} onClick={() => setCurrentRole('student')}>
              <div className="role-icon">🎓</div>
              <div className="role-info"><div className="role-name">Student</div><div className="role-desc">Mark meal intentions &amp; track your budget</div></div>
            </div>
            <div className={`role-card blue ${currentRole === 'admin' ? 'active' : ''}`} onClick={() => setCurrentRole('admin')}>
              <div className="role-icon">⚙️</div>
              <div className="role-info"><div className="role-name">Administrator</div><div className="role-desc">Manage mess operations &amp; analytics</div></div>
            </div>
            <div className={`role-card gold ${currentRole === 'guardian' ? 'active' : ''}`} onClick={() => setCurrentRole('guardian')}>
              <div className="role-icon">👨‍👩‍👦</div>
              <div className="role-info"><div className="role-name">Guardian</div><div className="role-desc">View your ward's meal participation</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-container">
          {view === 'login' && (
            <div className="view active">
              <div className={`role-indicator ${roleMeta[currentRole].indicatorClass}`}>
                <span className="ri-dot"></span>
                <span>{roleMeta[currentRole].indicator}</span>
              </div>
              <div className="form-header">
                <h2 className="form-title">{roleMeta[currentRole].title}</h2>
                <p className="form-sub">{roleMeta[currentRole].sub}</p>
              </div>
              
              {error && <div className="role-error-box">{error}</div>}
              
              <form onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="email">Email / Student ID</label>
                  <div className="input-wrap">
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@campus.edu" />
                  </div>
                </div>
                <div className="field">
                  <div className="field-row">
                    <label htmlFor="password">Password</label>
                    <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setView('forgot'); }}>Forgot password?</a>
                  </div>
                  <div className="input-wrap">
                    <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      👁️
                    </button>
                  </div>
                </div>
                
                <button type="submit" className={`btn-login ${roleMeta[currentRole].btnClass}`} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Sign In'}
                </button>
              </form>

              <div className="divider">or continue with</div>
              
              <button 
                type="button" 
                className="google-btn" 
                onClick={() => {
                  window.location.href = `${API_URL}/api/auth/google?role=${currentRole}`;
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '12px',
                  marginBottom: '16px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--surface2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.68 1.54 14.99 1 12 1 7.35 1 3.37 3.68 1.39 7.56l3.89 3.02C6.23 7.82 8.87 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.54z" />
                  <path fill="#FBBC05" d="M5.28 14.58c-.24-.73-.38-1.51-.38-2.33s.14-1.6.38-2.33L1.39 6.9c-.83 1.66-1.3 3.53-1.3 5.5s.47 3.84 1.3 5.5l3.89-3.02z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.13 0-5.77-2.78-6.72-5.54l-3.89 3.02C3.37 20.32 7.35 23 12 23z" />
                </svg>
                Sign in with Google
              </button>

              <div className="signup-prompt">
                Don't have an account? <Link to="/signup">Create one →</Link>
              </div>
            </div>
          )}

          {view === 'forgot' && (
            <div className="view active">
              <div className="role-indicator"><span className="ri-dot"></span><span>Password Reset</span></div>
              <div className="form-header">
                <h2 className="form-title">Reset your password</h2>
                <p className="form-sub">Enter your registered email. We'll send a 6-digit verification code.</p>
              </div>
              {error && <div className="role-error-box">{error}</div>}
              <form onSubmit={handleForgot}>
                <div className="field">
                  <label>Registered Email</label>
                  <div className="input-wrap">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@campus.edu" />
                  </div>
                </div>
                <button type="submit" className="btn-login">Send Verification Code</button>
              </form>
              <div className="signup-prompt" style={{marginTop:'24px'}}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>← Back to login</a>
              </div>
            </div>
          )}

          {view === 'otp' && (
            <div className="view active">
              <div className="role-indicator"><span className="ri-dot"></span><span>Verify Your Identity</span></div>
              <div className="form-header">
                <h2 className="form-title">Enter the code</h2>
                <p className="form-sub">We sent a 6-digit code to <strong>{email}</strong>.</p>
              </div>
              <button className="btn-login" onClick={() => setView('login')}>Verify &amp; Continue</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;