import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const GuardianSidebar = ({ session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const handleAvatarClick = () => {
    setShowSourceModal(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions or upload from gallery.");
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  React.useEffect(() => {
    if (showCameraModal) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCameraModal]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const size = Math.min(videoWidth, videoHeight);
    const sx = (videoWidth - size) / 2;
    const sy = (videoHeight - size) / 2;
    
    ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, 400, 400);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      uploadPhoto(file);
    }, 'image/jpeg');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', session.id || session._id);

    try {
      setIsUploading(true);
      setShowCameraModal(false);
      stopCamera();
      const res = await fetch('/api/auth/update-profile-pic', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const currentSession = JSON.parse(sessionStorage.getItem('mm_session')) || {};
        currentSession.profilePic = data.user.profilePic;
        sessionStorage.setItem('mm_session', JSON.stringify(currentSession));
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Error uploading profile pic:', err);
      alert('Error uploading profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_session');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!session) return null;

  const initials = session.name ? session.name.substring(0, 2).toUpperCase() : 'G';
  const profilePicUrl = session?.profilePic && session.profilePic !== 'null' && session.profilePic !== 'undefined' ? session.profilePic : '';

  return (
    <aside className="guardian-sidebar" style={{ width: '260px', minWidth: '260px', maxWidth: '260px', flexShrink: 0, height: '100vh', overflowY: 'hidden', overflowX: 'hidden', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Logo Section at the very top */}
      <div className="guardian-sidebar-logo" style={{flexShrink: 0, padding: '24px 20px 20px', borderBottom: '1px solid var(--border)'}}>
        <Link to="/guardian/dashboard" className="logo-text" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)', textDecoration: 'none', display: 'block' }}>Mess<span style={{ color: 'var(--text)' }}>Mate</span></Link>
        <div className="logo-sub" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>Guardian Portal</div>
      </div>

      {/* Profile Section below the Logo */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="ward-card active" style={{ borderColor: 'rgba(244, 197, 66, 0.35)', background: 'rgba(244, 197, 66, 0.05)', cursor: 'default' }}>
          <div className="ward-av" onClick={handleAvatarClick} style={{ background: 'linear-gradient(135deg, #2a1f04, #f4c542)', color: 'rgba(255, 255, 255, 0.9)', cursor: 'pointer', position: 'relative' }} title="Click to upload profile picture">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
            {isUploading ? (
              <span style={{ fontSize: '0.65rem', color: '#fff' }}>Uploading...</span>
            ) : profilePicUrl ? (
              <img src={profilePicUrl.startsWith('http') ? profilePicUrl : `http://localhost:3000/${profilePicUrl.replace(/^\//, '')}`} alt="Profile" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="ward-name" style={{ color: 'var(--gold)' }}>{session?.name || 'Guardian'}</div>
            <div className="ward-id">
              {session?.id || session?._id ? `ID: ${session.id || session._id}` : 'Configure in Settings'}
            </div>
            <div className="ward-status">
              <div className="status-dot" style={{ background: 'var(--gold)' }}></div>
              <span style={{ color: 'var(--gold)' }}>Guardian Portal Active</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="guardian-sidebar-nav" style={{ width: '100%', maxWidth: '260px', overflowX: 'hidden', overflowY: 'auto', flex: 1, boxSizing: 'border-box' }}>
        <div className="guardian-nav-label">Overview</div>
        <Link to="/guardian/dashboard" className={`guardian-nav-item ${isActive('/guardian/dashboard')}`}><span className="guardian-nav-icon">🏠</span> Dashboard</Link>
        <Link to="#" className="guardian-nav-item"><span className="guardian-nav-icon">📅</span> Attendance</Link>
        <Link to="/guardian/budget" className={`guardian-nav-item ${isActive('/guardian/budget')}`}><span className="guardian-nav-icon">💰</span> Budget</Link>
        
        <div className="guardian-nav-label">Alerts</div>
        <Link to="#" className="guardian-nav-item"><span className="guardian-nav-icon">🔔</span> Notifications</Link>
        <Link to="#" className="guardian-nav-item"><span className="guardian-nav-icon">⚙️</span> Preferences</Link>
      </nav>
      
      <div className="guardian-sidebar-bottom" style={{ marginTop: 'auto', padding: '24px 20px', borderTop: '1px solid var(--border)' }}>
        <a className="logout-btn" onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#7a8a96', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s', fontFamily: 'monospace' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#7a8a96'}>
          <span style={{fontSize: '1rem', marginTop: '-2px'}}>[→</span>
          <span style={{fontFamily: "'Syne', sans-serif"}}>Sign Out</span>
        </a>
      </div>

      {/* Choose Source Modal */}
      {showSourceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', width: '320px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', boxSizing: 'border-box'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem', fontFamily: "'Poppins', sans-serif", marginTop: 0 }}>Update Profile Picture</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { setShowSourceModal(false); setShowCameraModal(true); }}
                style={{
                  padding: '12px', borderRadius: '10px', background: 'var(--gold)',
                  color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                📸 Open Camera
              </button>
              <button 
                onClick={() => { setShowSourceModal(false); fileInputRef.current.click(); }}
                style={{
                  padding: '12px', borderRadius: '10px', background: 'var(--bg)',
                  color: '#fff', border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                📁 Upload from Gallery
              </button>
              <button 
                onClick={() => setShowSourceModal(false)}
                style={{
                  padding: '12px', borderRadius: '10px', background: 'transparent',
                  color: 'var(--muted)', border: 'none', cursor: 'pointer', marginTop: '6px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webcam Capture Modal */}
      {showCameraModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '24px', width: '348px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', boxSizing: 'border-box'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem', fontFamily: "'Poppins', sans-serif", marginTop: 0 }}>Capture Photo</h3>
            <div style={{
              width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden',
              margin: '0 auto 20px', border: '3px solid var(--gold)', background: '#000',
              position: 'relative'
            }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={capturePhoto}
                style={{
                  padding: '12px 24px', borderRadius: '10px', background: 'var(--gold)',
                  color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                }}
              >
                📸 Capture
              </button>
              <button 
                onClick={() => setShowCameraModal(false)}
                style={{
                  padding: '12px 24px', borderRadius: '10px', background: 'var(--bg)',
                  color: '#fff', border: '1px solid var(--border)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default GuardianSidebar;
