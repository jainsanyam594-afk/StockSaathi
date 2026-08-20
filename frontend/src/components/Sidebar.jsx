import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Sidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/markets', label: 'Markets' },
    { path: '/learn', label: 'Learn' },
    { path: '/practice', label: 'Practice' },
    { path: '/predictions', label: 'Predictions' },
    { path: '/ai-buddy', label: 'AI Buddy' },
    { path: '/my-plan', label: 'My Plan' },
    { path: '/invest', label: 'Invest' },
    { path: '/daily-digest', label: 'Daily Digest' },
  ];

  return (
    <aside style={{ width: '210px', background: '#FEFDF9', borderRight: '1px solid rgba(14,26,20,0.12)', height: '100vh', position: 'sticky', top: 0, padding: '1.5rem 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 1.25rem 1.25rem', borderBottom: '1px solid rgba(14,26,20,0.07)', marginBottom: '0.75rem' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#1B6B4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>S</div>
        <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0F4230' }}>StockSaathi</span>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'block',
            padding: '0.6rem 1.25rem',
            fontSize: '0.9rem',
            textDecoration: 'none',
            color: isActive ? '#0F4230' : '#5A6960',
            background: isActive ? '#E4EFE7' : 'transparent',
            borderLeft: isActive ? '3px solid #1B6B4C' : '3px solid transparent',
            fontWeight: isActive ? '500' : '400',
          })}
        >
          {item.label}
        </NavLink>
      ))}

      {user && (
        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem 0', borderTop: '1px solid rgba(14,26,20,0.07)' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
            {user.email}
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(14,26,20,0.12)', background: '#FEFDF9', color: '#c0392b', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem' }}>
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;