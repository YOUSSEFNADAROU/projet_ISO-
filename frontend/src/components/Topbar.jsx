import React from 'react';
import { Menu, LogOut, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Topbar.css';

const Topbar = ({ pageTitle, pageSubtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu size={24} />
        </button>
        <div className="topbar-title">
          {pageTitle && <h2>{pageTitle}</h2>}
          {pageSubtitle && <p>{pageSubtitle}</p>}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <UserCircle2 size={18} />
          <div>
            <strong>{user?.name || 'Utilisateur'}</strong>
            <span>{user?.email || 'connecté'}</span>
          </div>
        </div>
        <span className="topbar-date">{today}</span>
        <button
          className="topbar-logout"
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Topbar;
