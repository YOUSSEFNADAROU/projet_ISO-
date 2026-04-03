import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">Simulateur Audit ISO 2700x</div>
        <ul className="navbar-nav">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link></li>
          <li><Link to="/scenario" className={location.pathname === '/scenario' ? 'active' : ''}>Scénario</Link></li>
          <li><Link to="/controls" className={location.pathname === '/controls' ? 'active' : ''}>Contrôles</Link></li>
          <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
          <li><Link to="/report" className={location.pathname === '/report' ? 'active' : ''}>Rapport</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;