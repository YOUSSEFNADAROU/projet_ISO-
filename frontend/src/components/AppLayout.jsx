import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

const AppLayout = ({ children, pageTitle, pageSubtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="layout-main">
        {/* Topbar */}
        <Topbar 
          pageTitle={pageTitle} 
          pageSubtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          menuOpen={sidebarOpen}
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
