import React from 'react';
import { motion } from 'framer-motion';
import './ResultsDistribution.css';

const ResultsDistribution = ({ conforme = 0, partiel = 0, nonConforme = 0 }) => {
  const total = conforme + partiel + nonConforme;
  
  const getPercent = (value) => total > 0 ? Math.round((value / total) * 100) : 0;
  
  const conformePercent = getPercent(conforme);
  const partielPercent = getPercent(partiel);
  const nonConformePercent = getPercent(nonConforme);

  return (
    <div className="results-distribution">
      <div className="distribution-item">
        <div className="item-header">
          <span className="item-label">Conformes</span>
          <span className="item-count">{conforme}</span>
        </div>
        <motion.div 
          className="progress-bar-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="progress-bar-fill conforme"
            initial={{ width: 0 }}
            animate={{ width: `${conformePercent}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
        <span className="item-percent">{conformePercent}%</span>
      </div>

      <div className="distribution-item">
        <div className="item-header">
          <span className="item-label">Partiellement Conformes</span>
          <span className="item-count">{partiel}</span>
        </div>
        <motion.div 
          className="progress-bar-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.div
            className="progress-bar-fill partiel"
            initial={{ width: 0 }}
            animate={{ width: `${partielPercent}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </motion.div>
        <span className="item-percent">{partielPercent}%</span>
      </div>

      <div className="distribution-item">
        <div className="item-header">
          <span className="item-label">Non Conformes</span>
          <span className="item-count">{nonConforme}</span>
        </div>
        <motion.div 
          className="progress-bar-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.div
            className="progress-bar-fill non-conforme"
            initial={{ width: 0 }}
            animate={{ width: `${nonConformePercent}%` }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </motion.div>
        <span className="item-percent">{nonConformePercent}%</span>
      </div>
    </div>
  );
};

export default ResultsDistribution;
