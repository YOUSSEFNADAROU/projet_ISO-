import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Sparkles } from 'lucide-react';

const stages = [
  { icon: Search, label: 'Analyse de la question' },
  { icon: Shield, label: 'Recherche du contexte ISO' },
  { icon: Sparkles, label: 'Generation de la reponse' },
];

const TypingIndicator = () => {
  return (
    <div className="message message-bot">
      <div className="assistant-rail">
        <div className="assistant-avatar">
          <Shield size={15} />
        </div>
        <div className="assistant-label">Expert ISO</div>
      </div>

      <div className="message-bubble loading loading-card premium-loading">
        <div className="thinking-wave">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="loading-copy">
          <p>Analyse ISO en cours...</p>
          <div className="loading-stages">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.label}
                  className="loading-stage-pill"
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.35 }}
                >
                  <Icon size={12} />
                  <span>{stage.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
