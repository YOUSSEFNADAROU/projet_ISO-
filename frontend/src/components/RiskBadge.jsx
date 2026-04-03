import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './RiskBadge.css';

const RiskBadge = ({ level, severity, probability }) => {
  if (!level) return null;

  const riskMap = {
    'Élevé': { className: 'risk-high', color: '#ef4444' },
    'Moyen': { className: 'risk-medium', color: '#f59e0b' },
    'Faible': { className: 'risk-low', color: '#16a34a' },
  };

  const config = riskMap[level] || riskMap['Moyen'];

  return (
    <div className={`risk-badge ${config.className}`}>
      <div className="risk-header">
        <AlertTriangle size={16} />
        <span className="risk-level">{level}</span>
      </div>
      {(severity || probability) && (
        <div className="risk-details">
          {severity && <span>Gravité: <strong>{severity}</strong></span>}
          {probability && <span>Probabilité: <strong>{probability}</strong></span>}
        </div>
      )}
    </div>
  );
};

export default RiskBadge;
