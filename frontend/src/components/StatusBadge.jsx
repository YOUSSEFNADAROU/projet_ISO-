import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import './StatusBadge.css';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusMap = {
    'Conforme': { 
      icon: CheckCircle2, 
      className: 'status-conforme',
      label: 'Conforme'
    },
    'Partiellement conforme': { 
      icon: AlertCircle, 
      className: 'status-partiellement',
      label: 'Partiellement conforme'
    },
    'Non conforme': { 
      icon: XCircle, 
      className: 'status-non-conforme',
      label: 'Non conforme'
    }
  };

  const config = statusMap[status] || statusMap['Non conforme'];
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className} badge-${size}`}>
      <Icon size={size === 'sm' ? 14 : 16} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;