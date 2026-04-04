import React from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

const ChatComposer = ({ value, onChange, onKeyDown, onSend, isLoading }) => {
  return (
    <div className="chat-input-shell">
      <div className="chat-input-brand">
        <div className="chat-input-brand-icon">
          <Sparkles size={16} />
        </div>
        <span>Question d audit</span>
      </div>

      <div className="chat-input-area">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Posez une question ISO 27001/27002, sur un controle, un risque, une preuve ou un plan d'action."
          className="chat-textarea"
          rows={2}
        />

        <motion.button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className="chat-send-btn"
          whileHover={!isLoading && value.trim() ? { y: -1, scale: 1.02 } : {}}
          whileTap={!isLoading && value.trim() ? { scale: 0.96 } : {}}
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatComposer;
