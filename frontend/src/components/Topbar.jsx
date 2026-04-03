import React from 'react';
import { Menu } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ pageTitle, pageSubtitle, onMenuClick, menuOpen }) => {
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="topbar-title">
          {pageTitle && <h2>{pageTitle}</h2>}
          {pageSubtitle && <p>{pageSubtitle}</p>}
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
      </div>
    </header>
  );
};

export default Topbar;
