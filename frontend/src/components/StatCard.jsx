import React from 'react';
import { motion } from 'framer-motion';
import './StatCard.css';

const StatCard = ({ title, value, color = 'blue', icon: Icon, trend }) => {
  const colorMap = {
    blue: '#2563eb',
    green: '#16a34a',
    orange: '#f59e0b',
    red: '#ef4444',
    cyan: '#06b6d4',
  };

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-header">
        {Icon && (
          <div className="stat-icon" style={{ backgroundColor: colorMap[color] + '20', color: colorMap[color] }}>
            <Icon size={24} />
          </div>
        )}
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;