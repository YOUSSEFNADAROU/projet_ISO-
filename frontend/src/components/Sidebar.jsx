import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CheckSquare, BarChart3, FileCheck, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ open, persistent, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/home', label: 'Accueil', icon: Home },
    { path: '/controls', label: 'Contrôles', icon: CheckSquare },
    { path: '/dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { path: '/report', label: 'Rapport', icon: FileCheck },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {open && !persistent && (
        <motion.div 
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        className={`sidebar ${open ? 'open' : ''}`}
        initial={false}
        animate={{ x: open ? 0 : -260 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <span className="logo-icon">🔐</span>
            </div>
            <div>
              <h1>ISO Audit</h1>
              <p>Simulator</p>
            </div>
          </div>
          {open && !persistent && (
            <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => !persistent && onClose()}
              >
                <Icon size={20} className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
                {active && (
                  <motion.div
                    className="sidebar-indicator"
                    layoutId="sidebar-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p>ISO 27001/27002</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
