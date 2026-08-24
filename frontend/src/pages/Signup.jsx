import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Role specific state
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [campusName, setCampusName] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [relationship, setRelationship] = useState('');
  const [wardId, setWardId] = useState('');
  
  // Image
  const [profilePic, setProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState('👤');

  // Account
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Toggles
  const [toggles, setToggles] = useState({ t1: false, t2: false, t3: false });

  // Errors & Loading
  const [errors, setErrors] = useState({});
  const [roleShake, setRoleShake] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const roleMeta = {
    student:  { label: 'Student',       btnClass: 'green', badge: 'badge-green' },
    admin:    { label: 'Administrator', btnClass: 'blue',  badge: 'badge-blue'  },
    guardian: { label: 'Guardian',      btnClass: 'gold',  badge: 'badge-gold'  },
  };

  const handleRoleSelect = (r) => {
    setRole(r);
    setRoleShake(false);
  };

  const handleNext = (current) => {
    let newErrors = {};
    if (current === 1) {
      if (!role) {
        setRoleShake(true);
        setTimeout(() => setRoleShake(false), 400);
        return;
      }
    } else if (current === 2) {
      setApiError('');
      if (!firstName.trim()) newErrors.firstName = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = true;
      if (role === 'student' && !email.trim().toLowerCase().endsWith('@chitkara.edu.in')) {
        newErrors.emailDomain = true;
        setApiError('Student registration is restricted to @chitkara.edu.in email addresses.');
        setErrors(newErrors);
        return;
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    } else if (current === 3) {
      if (password.length < 8) newErrors.password = true;
      if (password !== confirmPass) newErrors.confirmPass = true;
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(current + 1);
  };

  const handleBack = (current) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(current - 1);
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicPreview(`<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;" />`);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkStrength = (val) => {
    let score = 0;
    if (val.length >= 8)  score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
      { pct: '10%', color: 'var(--danger)',  label: 'Too short' },
      { pct: '25%', color: 'var(--danger)',  label: 'Weak' },
      { pct: '50%', color: 'var(--warning)', label: 'Fair' },
      { pct: '75%', color: 'var(--gold)',    label: 'Good' },
      { pct: '90%', color: 'var(--accent)',  label: 'Strong' },
      { pct: '100%',color: 'var(--accent)',  label: 'Very strong 💪' },
    ];
    return levels[Math.min(score, 5)];
  };

  const submitForm = async () => {
    setApiError('');
    if (role === 'student' && !email.trim().toLowerCase().endsWith('@chitkara.edu.in')) {
      setApiError('Student registration is restricted to @chitkara.edu.in email addresses.');
      return;
    }
    setIsSubmitting(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    try {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('role', role);
      
      if (role === 'guardian' && wardId.trim()) formData.append('wardStudentId', wardId.trim());
      if (profilePic) formData.append('profilePic', profilePic);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSubmitting(false);
        setApiError('❌ ' + (data.message || 'Registration failed. Please try again.'));
        return;
      }

      sessionStorage.setItem('mm_session', JSON.stringify(data.user));
      setSuccess(true);
      
      const REDIRECTS = {
        student:  '/student/dashboard',
        admin:    '/admin/dashboard',
        guardian: '/guardian/dashboard'
      };
      
      setTimeout(() => {
        navigate(REDIRECTS[role] || '/login');
      }, 3000);

    } catch (err) {
      setIsSubmitting(false);
      setApiError('❌ Cannot reach server. Make sure backend is running.');
      console.error('Register error:', err);
    }
  };

  const btnClass = role ? roleMeta[role].btnClass : 'green';

  if (success) {
    const msgs = {
      student:  'Welcome to MessMate! Your student account is ready. Start tracking your meals right away.',
      admin:    'Your administrator account is live. Head to your dashboard to manage mess operations.',
      guardian: "Your guardian account is set up. You'll receive meal participation updates for your ward.",
    };
    
    return (
      <div className="signup-container">
        <main className="signup-main">
          <div className="success-screen">
            <div className="success-ring">🎉</div>
            <h1 className="success-title">Account Created!</h1>
            <p className="success-sub">{msgs[role]}</p>
            <div className="success-cards">
              <div className="success-card"><div className="sc-icon">🎯</div><div className="sc-label">Mark your first meal intention</div></div>
              <div className="success-card"><div className="sc-icon">📊</div><div className="sc-label">Explore your dashboard</div></div>
              <div className="success-card"><div className="sc-icon">🔔</div><div className="sc-label">Set up notifications</div></div>
            </div>
            <div className="success-redirect">Redirecting to your dashboard in 3 seconds…</div>
            <div className="progress-bar"><div className="progress-fill"></div></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <aside className="signup-sidebar">
        <div className="sidebar-grid"></div>
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <nav className="signup-nav">
          <Link to="/" className="signup-logo">Mess<span>Mate</span></Link>
          <Link to="/" className="signup-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Home
          </Link>
        </nav>
        <div className="steps-label">SETUP PROGRESS</div>
        <ul className="steps-list">
          {[
            { id: 1, name: 'Choose Role', desc: 'Student, Admin or Guardian' },
            { id: 2, name: 'Personal Info', desc: 'Name, email & contact' },
            { id: 3, name: 'Account Setup', desc: 'Password & preferences' },
            { id: 4, name: 'Review', desc: 'Confirm & create account' }
          ].map((s) => (
            <li key={s.id} className={`step-item ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
              <div className="step-circle">
                {step > s.id ? <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6l4 4 8-9" stroke="#0a0d0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> : `0${s.id}`}
              </div>
              <div className="step-text">
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="signup-sidebar-footer">
          <div className="signup-security-badge">
            <div className="security-badge-icon">🔐</div>
            <div>
              <h4>Secure & Private</h4>
              <p>Your data is encrypted and never shared with third parties. Role-based access ensures only you see your information.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="signup-main">
        <div className="form-wrap">
          
          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="step-panel">
              <div className="panel-header">
                <div className="panel-eyebrow">Step 1 of 4</div>
                <h1 className="panel-title">Who are <em>you</em>?</h1>
                <p className="panel-sub">Select your role on the platform. This determines your dashboard, permissions, and available features.</p>
              </div>
              <div className={`role-grid ${roleShake ? 'shake' : ''}`}>
                <div className={`role-option green ${role === 'student' ? 'selected' : ''}`} onClick={() => handleRoleSelect('student')}>
                  <div className="role-ico">🎓</div>
                  <div className="role-body"><div className="role-name">Student</div><div className="role-desc">Mark meal intentions, track budget efficiency & view attendance history</div></div>
                  <div className="role-check"><svg className="checkmark" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div className={`role-option blue ${role === 'admin' ? 'selected' : ''}`} onClick={() => handleRoleSelect('admin')}>
                  <div className="role-ico">⚙️</div>
                  <div className="role-body"><div className="role-name">Administrator</div><div className="role-desc">Manage mess operations, view live demand analytics & generate reports</div></div>
                  <div className="role-check"><svg className="checkmark" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div className={`role-option gold ${role === 'guardian' ? 'selected' : ''}`} onClick={() => handleRoleSelect('guardian')}>
                  <div className="role-ico">👨‍👩‍👦</div>
                  <div className="role-body"><div className="role-name">Guardian / Parent</div><div className="role-desc">Monitor your ward's meal participation and receive monthly reports</div></div>
                  <div className="role-check"><svg className="checkmark" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
              </div>
              <div className="btn-row">
                <button className={`btn-next ${btnClass}`} onClick={() => handleNext(1)}>
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFO */}
          {step === 2 && (
            <div className="step-panel">
              <div className="panel-header">
                <div className="panel-eyebrow">Step 2 of 4</div>
                <h1 className="panel-title">Your <em>details</em></h1>
                <p className="panel-sub">Basic information to set up your account. All fields marked with <span style={{color:'var(--accent)'}}>*</span> are required.</p>
              </div>
              
              <div className="field-row-2">
                <div className="field">
                  <label>First Name <span className="req">*</span></label>
                  <div className="input-wrap">
                    <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" className={errors.firstName ? 'error' : ''} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                  </div>
                  {errors.firstName && <div className="field-err" style={{display:'block'}}>First name is required.</div>}
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <div className="input-wrap">
                    <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>
              </div>
              
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <div className="input-wrap">
                  <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input type="email" className={errors.email || errors.emailDomain ? 'error' : ''} value={email} onChange={e => setEmail(e.target.value)} placeholder={role === 'student' ? "name@chitkara.edu.in" : "john@campus.edu"} />
                </div>
                {errors.email && <div className="field-err" style={{display:'block'}}>Please enter a valid email address.</div>}
                {errors.emailDomain && <div className="field-err" style={{display:'block'}}>Student registration is restricted to @chitkara.edu.in email addresses.</div>}
                {role === 'student' && !errors.email && !errors.emailDomain && (
                  <div className="field-hint" style={{color:'var(--accent)'}}>Must be your official @chitkara.edu.in email address</div>
                )}
              </div>
              
              <div className="field">
                <label>Phone Number</label>
                <div className="input-wrap">
                  <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="field-hint">Optional — used for urgent mess notifications</div>
              </div>

              {role === 'student' && (
                <div>
                  <div className="field-row-2">
                    <div className="field">
                      <label>Student ID <span className="req">*</span></label>
                      <div className="input-wrap">
                        <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. 2024CS001" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Academic Year <span className="req">*</span></label>
                      <div className="input-wrap">
                        <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                          <option value="" disabled>Select year</option>
                          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Postgraduate</option>
                        </select>
                        <svg className="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label>Department / Branch</label>
                    <div className="input-wrap">
                      <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
                    </div>
                  </div>
                </div>
              )}

              {role === 'admin' && (
                <div>
                  <div className="field">
                    <label>Campus / Institution Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      <input type="text" value={campusName} onChange={e => setCampusName(e.target.value)} placeholder="e.g. NIT Solan" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Admin Role / Designation</label>
                    <div className="input-wrap">
                      <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                      <select value={adminRole} onChange={e => setAdminRole(e.target.value)}>
                        <option value="" disabled>Select role</option>
                        <option>Mess Manager</option><option>Hostel Warden</option><option>Campus Director</option><option>IT Administrator</option><option>Other</option>
                      </select>
                      <svg className="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {role === 'guardian' && (
                <div>
                  <div className="field">
                    <label>Relationship to Student <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <select value={relationship} onChange={e => setRelationship(e.target.value)}>
                        <option value="" disabled>Select relationship</option>
                        <option>Parent (Father)</option><option>Parent (Mother)</option><option>Legal Guardian</option><option>Sibling</option><option>Other</option>
                      </select>
                      <svg className="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                  <div className="field">
                    <label>Ward's Student ID <span className="req">*</span></label>
                    <div className="input-wrap">
                      <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      <input type="text" value={wardId} onChange={e => setWardId(e.target.value)} placeholder="e.g. 0ee75402-1d86-4a9e-..." />
                    </div>
                    <div className="field-hint">The system ID of the student you're linked to</div>
                  </div>
                </div>
              )}

              <div className="field">
                <label>Profile Picture</label>
                <div style={{display:'flex', alignItems:'center', gap:'16px', marginTop:'4px'}}>
                  <div style={{width:'72px', height:'72px', borderRadius:'50%', background:'var(--surface2)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', overflow:'hidden', flexShrink:0, transition:'border-color 0.2s'}} dangerouslySetInnerHTML={{__html: picPreview}}>
                  </div>
                  <div style={{flex:1}}>
                    <label htmlFor="profilePic" style={{display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:'0.82rem', fontWeight:500, cursor:'pointer', transition:'all 0.2s'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Choose Photo
                    </label>
                    <input type="file" id="profilePic" accept="image/*" style={{display:'none'}} onChange={handlePicChange} />
                    <div className="field-hint" style={{marginTop:'6px'}}>JPG, PNG or WebP — max 10MB (optional)</div>
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => handleBack(2)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button className={`btn-next ${btnClass}`} onClick={() => handleNext(2)}>
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ACCOUNT SETUP */}
          {step === 3 && (
            <div className="step-panel">
              <div className="panel-header">
                <div className="panel-eyebrow">Step 3 of 4</div>
                <h1 className="panel-title">Secure your <em>account</em></h1>
                <p className="panel-sub">Set a strong password and configure your notification preferences.</p>
              </div>
              
              <div className="field">
                <label>Password <span className="req">*</span></label>
                <div className="input-wrap">
                  <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPass ? 'text' : 'password'} className={errors.password ? 'error' : ''} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="pass-strength" style={{display:'block'}}>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{width: checkStrength(password).pct, background: checkStrength(password).color}}></div>
                    </div>
                    <div className="strength-text" style={{color: checkStrength(password).color}}>{checkStrength(password).label}</div>
                  </div>
                )}
                {errors.password && <div className="field-err" style={{display:'block'}}>Password must be at least 8 characters.</div>}
              </div>

              <div className="field">
                <label>Confirm Password <span className="req">*</span></label>
                <div className="input-wrap">
                  <svg className="inp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showConfirm ? 'text' : 'password'} className={errors.confirmPass ? 'error' : ''} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat your password" />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPass && <div className="field-err" style={{display:'block'}}>Passwords do not match.</div>}
              </div>

              <div style={{marginBottom:'24px'}}>
                <div className="field-hint" style={{marginBottom:'14px', fontWeight:600, color:'var(--text)', fontSize:'0.82rem'}}>NOTIFICATION PREFERENCES</div>
                <div className={`toggle-row ${toggles.t1 ? 'checked' : ''}`} onClick={() => setToggles({...toggles, t1: !toggles.t1})}>
                  <div className="toggle-box"><svg className="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div className="toggle-text"><h4>Meal cutoff reminders</h4><p>Receive a notification 2 hours before each meal's intention cutoff</p></div>
                </div>
                <div className={`toggle-row ${toggles.t2 ? 'checked' : ''}`} onClick={() => setToggles({...toggles, t2: !toggles.t2})}>
                  <div className="toggle-box"><svg className="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div className="toggle-text"><h4>Monthly summary email</h4><p>Get a monthly report of your meal participation and budget efficiency</p></div>
                </div>
                <div className={`toggle-row ${toggles.t3 ? 'checked' : ''}`} onClick={() => setToggles({...toggles, t3: !toggles.t3})}>
                  <div className="toggle-box"><svg className="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0a0d0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div className="toggle-text"><h4>Menu updates</h4><p>Be notified when the weekly mess menu is published or changed</p></div>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => handleBack(3)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button className={`btn-next ${btnClass}`} onClick={() => handleNext(3)}>
                  <span>Review Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="step-panel">
              <div className="panel-header">
                <div className="panel-eyebrow">Step 4 of 4</div>
                <h1 className="panel-title">Almost <em>there!</em></h1>
                <p className="panel-sub">Review your information before creating your account.</p>
              </div>
              
              <div className="review-cards">
                <div className="review-card">
                  <div className="review-header">
                    <h3>Role</h3>
                    <button className="review-edit" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="review-body">
                    <div className="review-row">
                      <span className="rkey">Selected Role</span>
                      <span className="rval"><span className={`review-role-badge ${roleMeta[role].badge}`}>{roleMeta[role].label}</span></span>
                    </div>
                  </div>
                </div>
                
                <div className="review-card">
                  <div className="review-header">
                    <h3>Personal Information</h3>
                    <button className="review-edit" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div className="review-body">
                    <div className="review-row"><span className="rkey">Full Name</span><span className="rval">{firstName} {lastName}</span></div>
                    <div className="review-row"><span className="rkey">Email</span><span className="rval">{email}</span></div>
                    <div className="review-row"><span className="rkey">Phone</span><span className="rval">{phone || '—'}</span></div>
                    {role === 'student' && (
                      <>
                        <div className="review-row"><span className="rkey">Student ID</span><span className="rval">{studentId || '—'}</span></div>
                        <div className="review-row"><span className="rkey">Academic Year</span><span className="rval">{academicYear || '—'}</span></div>
                        <div className="review-row"><span className="rkey">Department</span><span className="rval">{department || '—'}</span></div>
                      </>
                    )}
                    {role === 'admin' && (
                      <>
                        <div className="review-row"><span className="rkey">Campus</span><span className="rval">{campusName || '—'}</span></div>
                        <div className="review-row"><span className="rkey">Designation</span><span className="rval">{adminRole || '—'}</span></div>
                      </>
                    )}
                    {role === 'guardian' && (
                      <>
                        <div className="review-row"><span className="rkey">Relationship</span><span className="rval">{relationship || '—'}</span></div>
                        <div className="review-row"><span className="rkey">Ward's ID</span><span className="rval">{wardId || '—'}</span></div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="review-card">
                  <div className="review-header">
                    <h3>Account Preferences</h3>
                    <button className="review-edit" onClick={() => setStep(3)}>Edit</button>
                  </div>
                  <div className="review-body">
                    <div className="review-row"><span className="rkey">Password</span><span className="rval">••••••••</span></div>
                    <div className="review-row"><span className="rkey">Cutoff reminders</span><span className="rval">{toggles.t1 ? '✓ Enabled' : '— Disabled'}</span></div>
                    <div className="review-row"><span className="rkey">Monthly report</span><span className="rval">{toggles.t2 ? '✓ Enabled' : '— Disabled'}</span></div>
                    <div className="review-row"><span className="rkey">Menu updates</span><span className="rval">{toggles.t3 ? '✓ Enabled' : '— Disabled'}</span></div>
                  </div>
                </div>
              </div>

              {apiError && <div className="api-error-box show">{apiError}</div>}
              
              <div className="terms-box">
                By creating an account, you agree to MessMate's <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
                Your meal data is used solely to improve campus operations and will never be sold or shared externally.
              </div>
              
              <div className="btn-row">
                <button className="btn-back" onClick={() => handleBack(4)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button className={`btn-next ${btnClass}`} onClick={submitForm} disabled={isSubmitting}>
                  {!isSubmitting ? (
                    <>
                      <span>Create Account</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </>
                  ) : (
                    <div className="btn-spinner" style={{display:'block'}}></div>
                  )}
                </button>
              </div>
            </div>
          )}

          {!success && (
            <div className="login-link">
              Already have an account? <Link to="/login">Sign in →</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Signup;
