import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ children, hover = true, className = '' }) => {
  return (
    <motion.div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : {}}
    >
      {children}
    </motion.div>
  );
};

export default Card;
