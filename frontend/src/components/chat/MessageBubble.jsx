import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Shield } from 'lucide-react';

const MessageBubble = ({ message, children }) => {
  if (message.type === 'user') {
    return (
      <motion.div
        className="message message-user"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div className="message-bubble">
          <span className="message-eyebrow">Vous</span>
          <p>{message.text}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="message message-bot"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.05 }}
    >
      <div className="assistant-rail">
        <div className="assistant-avatar">
          <Shield size={15} />
        </div>
        <div className="assistant-label">Expert ISO</div>
      </div>

      <div className="message-bubble">
        {children}
        {message.isError && (
          <div className="message-error">
            <AlertCircle size={16} /> Erreur
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
