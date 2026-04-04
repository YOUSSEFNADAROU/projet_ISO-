import React from 'react';
import { motion } from 'framer-motion';

const QuickSuggestions = ({ suggestions, onSelect, disabled }) => {
  return (
    <div className="quick-suggestions">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          className="quick-suggestion-btn"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: index * 0.03 }}
          whileHover={!disabled ? { y: -2 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickSuggestions;
