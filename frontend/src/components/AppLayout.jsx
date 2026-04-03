import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

const AppLayout = ({ children, pageTitle, pageSubtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth > 768;
  });
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth > 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const nextIsDesktop = window.innerWidth > 768;
      setIsDesktop(nextIsDesktop);
      setSidebarOpen(nextIsDesktop);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        persistent={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="layout-main">
        {/* Topbar */}
        <Topbar 
          pageTitle={pageTitle} 
          pageSubtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Page Content */}
        <motion.main 
          className="layout-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
