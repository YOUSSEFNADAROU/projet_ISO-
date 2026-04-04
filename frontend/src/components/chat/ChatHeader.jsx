import React from 'react';
import { motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-identity">
        <div className="chat-header-avatar-wrap">
          <motion.div
            className="chat-status-ring"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="chat-header-avatar">
            <Shield size={18} />
          </div>
        </div>

        <div className="chat-header-content">
          <div className="chat-header-title-row">
            <h3>Assistant Audit ISO</h3>
            <span className="chat-status-pill">
              <span className="chat-status-dot"></span>
              En ligne
            </span>
          </div>
          <span className="chat-header-subtitle">
            Copilote expert pour l analyse des risques, des controles et des plans d action ISO 27001/27002
          </span>
        </div>
      </div>

      <motion.button
        className="chat-close"
        onClick={onClose}
        whileHover={{ scale: 1.04, rotate: 90 }}
        whileTap={{ scale: 0.94 }}
      >
        <X size={18} />
      </motion.button>
    </div>
  );
};

export default ChatHeader;
