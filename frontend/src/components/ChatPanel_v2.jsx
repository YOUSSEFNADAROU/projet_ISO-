import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import './ChatPanel_v2.css';

const ChatPanel = ({ analysisContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: 'Bonjour! 👋 Je suis le Chatbot d\'Audit ISO 2700x. Je réponds basé sur vos données réelles d\'audit.',
      isWelcome: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Envoyer un message et obtenir réponse contextuelle
   */
  const sendMessage = async (messageText = null) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    // Ajouter message utilisateur
    const newMessages = [...messages, { type: 'user', text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // 🆕 Utiliser endpoint CONTEXTUAL qui utilise données réelles
      const response = await api.post('/report/chat-contextual', {
        question: text,
        context: analysisContext
      });

      if (response.data.success && response.data.response) {
        const resp = response.data.response;

        // Créer un message bot structuré
        const botMessage = {
          type: 'bot',
          text: resp.htmlContent || resp.text,
          isStructured: true,
          response: resp,
          hasRealData: response.data.data.hasRealData,
          questionType: response.data.data.questionType,
          controlsFound: response.data.data.controlsFound,
          evaluationsFound: response.data.data.evaluationsFound,
          actions: resp.actions || [],
          suggestions: resp.suggestions || []
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Réponse invalide');
      }

    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `❌ Erreur: ${error.response?.data?.message || error.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Rendre les réponses structurées
   */
  const renderMessage = (message, idx) => {
    if (message.type === 'user') {
      return (
        <div key={idx} className="message message-user">
          <div className="message-bubble">{message.text}</div>
        </div>
      );
    }

    // Message bot
    return (
      <div key={idx} className="message message-bot">
        {/* Affichage principal */}
        <div className="message-bubble">
          {message.isStructured ? (
            <div className="structured-response">
              {/* Contenu principal */}
              <div className="response-content">
                {message.text.split('\n').map((line, i) => {
                  // Titres
                  if (line.startsWith('##')) {
                    return <h3 key={i} className="response-title">{line.replace(/^#+\s/, '')}</h3>;
                  }
                  // Sections en gras
                  if (line.includes('**')) {
                    return (
                      <p key={i} className="response-section">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  // Listes
                  if (line.trim().startsWith('-') || line.trim().startsWith('✓')) {
                    return <li key={i} className="response-item">{line.replace(/^[-✓]\s/, '')}</li>;
                  }
                  // Lignes normales
                  return line.trim() && <p key={i} className="response-text">{line}</p>;
                })}
              </div>

              {/* Métadonnées */}
              <div className="message-metadata">
                {message.hasRealData && (
                  <span className="badge badge-success">
                    ✓ Données réelles encontrées
                  </span>
                )}
                <span className={`badge badge-type badge-${message.questionType}`}>
                  {message.questionType}
                </span>
                {message.controlsFound > 0 && (
                  <span className="badge badge-info">
                    {message.controlsFound} contrôle(s) trouvé(s)
                  </span>
                )}
              </div>

              {/* Actions possibles */}
              {message.actions && message.actions.length > 0 && (
                <div className="message-actions">
                  <p className="actions-title">📋 Actions possibles:</p>
                  <div className="actions-list">
                    {message.actions.map((action, ai) => (
                      <button
                        key={ai}
                        className="action-btn"
                        onClick={() => sendMessage(action.label)}
                        title={action.action}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="message-suggestions">
                  <p className="suggestions-title">💡 Questions suggérées:</p>
                  <div className="suggestions-list">
                    {message.suggestions.map((sugg, si) => (
                      <button
                        key={si}
                        className="suggestion-btn"
                        onClick={() => sendMessage(sugg)}
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>{message.text}</p>
          )}

          {message.isError && (
            <div className="message-error">
              <AlertCircle size={18} /> Erreur
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="chat-floating-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={24} />
        {messages.length > 1 && (
          <span className="chat-badge">{messages.length - 1}</span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <h3>Assistant d'Audit ISO 2700x</h3>
                <span className="chat-header-subtitle">
                  Réponses basée sur vos données réelles
                </span>
              </div>
              <button
                className="chat-close"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, idx) => renderMessage(msg, idx))}

              {isLoading && (
                <div className="message message-bot">
                  <div className="message-bubble loading">
                    <span>⏳</span>
                    <span>Chargement...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez une question sur vos contrôles, évaluations, remédiation... (en lien avec vos données réelles)"
                className="chat-textarea"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="chat-send-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
