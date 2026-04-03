import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './ControlCard.css';

const ControlCard = ({ control, evaluation }) => {
  return (
    <motion.div
      className="control-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <div className="control-card-header">
        <div className="control-card-code">{control.code}</div>
        {evaluation && <StatusBadge status={evaluation.status} size="sm" />}
      </div>
      
      <h3 className="control-card-title">{control.title}</h3>
      
      <p className="control-card-category">{control.category}</p>
      
      <p className="control-card-description">{control.description.substring(0, 100)}...</p>
      
      <Link to={`/controls/${control._id}`} className="control-card-link">
        <span>Voir détails</span>
        <ChevronRight size={16} />
      </Link>
    </motion.div>
  );
};

export default ControlCard;