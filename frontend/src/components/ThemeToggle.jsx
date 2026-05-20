import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('mm-theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mm-theme', next);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="global-theme-toggle"
      title="Toggle Light/Dark Mode"
      aria-label="Toggle Theme"
    >
      <span className={`toggle-icon ${theme === 'dark' ? 'sun' : 'moon'}`}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;
