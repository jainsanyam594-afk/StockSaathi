import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
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
    <aside style={{
      width: '210px',
      background: '#FEFDF9',
      borderRight: '1px solid rgba(14,26,20,0.12)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      padding: '1.5rem 0',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0 1.25rem 1.25rem',
        borderBottom: '1px solid rgba(14,26,20,0.07)',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: '#1B6B4C', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '600', fontSize: '16px',
        }}>S</div>
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
    </aside>
  );
}

export default Sidebar;