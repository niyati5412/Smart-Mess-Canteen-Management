import React, { useEffect, useState } from 'react';

const GuardianHeaderProfiles = ({ session }) => {
  const [wardInfo, setWardInfo] = useState(null);

  const wardId = session?.wardStudentId || session?.wardId;

  useEffect(() => {
    if (wardId) {
      fetch('/api/auth/users')
        .then(res => res.json())
        .then(users => {
          if (Array.isArray(users)) {
            const found = users.find(u => u._id === wardId || u.id === wardId || u.studentId === wardId);
            if (found) setWardInfo(found);
          }
        })
        .catch(err => console.error('Error fetching ward info:', err));
    }
  }, [wardId]);

  if (!session) return null;

  const guardianPic = session?.profilePic && session.profilePic !== 'null' && session.profilePic !== 'undefined' ? session.profilePic : '';
  const guardianInitials = session?.name ? session.name.substring(0, 2).toUpperCase() : 'G';

  const wardName = wardInfo?.name || session?.wardName || 'Ward Student';
  const wardPic = wardInfo?.profilePic && wardInfo.profilePic !== 'null' && wardInfo.profilePic !== 'undefined' ? wardInfo.profilePic : '';
  const wardInitials = wardName ? wardName.substring(0, 2).toUpperCase() : 'S';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
      {/* Guardian Profile Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '5px 12px 5px 6px', borderRadius: '30px',
        background: 'var(--surface2)', border: '1px solid var(--border)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg, #f4c542, #b8860b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0,
          border: '1.5px solid var(--gold)'
        }}>
          {guardianPic ? (
            <img 
              src={guardianPic.startsWith('http') ? guardianPic : `http://localhost:3000/${guardianPic.replace(/^\//, '')}`} 
              alt={session.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : guardianInitials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{session.name || 'Guardian'}</span>
            <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(244, 197, 66, 0.2)', color: 'var(--gold)', fontWeight: 700 }}>Guardian</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'monospace' }}>ID: {(session.id || session._id || '').slice(-6)}</span>
        </div>
      </div>

      {/* Linked Ward Student Profile Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '5px 12px 5px 6px', borderRadius: '30px',
        background: 'rgba(0, 229, 160, 0.08)', border: '1px solid rgba(0, 229, 160, 0.3)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg, #00e5a0, #008f62)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0,
          border: '1.5px solid var(--accent)'
        }}>
          {wardPic ? (
            <img 
              src={wardPic.startsWith('http') ? wardPic : `http://localhost:3000/${wardPic.replace(/^\//, '')}`} 
              alt={wardName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : wardInitials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>{wardName}</span>
            <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(0, 229, 160, 0.2)', color: 'var(--accent)', fontWeight: 700 }}>Student Ward</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
            {wardId ? `ID: ${wardId.slice(-6)}` : 'Not Linked'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GuardianHeaderProfiles;
