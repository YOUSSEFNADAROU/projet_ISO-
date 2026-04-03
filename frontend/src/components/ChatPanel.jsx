import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Lightbulb, Zap } from 'lucide-react';
import api from '../services/api';
import './ChatPanel.css';

const ChatPanel = ({ analysisContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Bonjour! Je suis votre agent d\'audit expert ISO 2700x. Posez-moi vos questions sur l\'audit. Je peux vous aider sur les risques, conformité, remédiation, preuves, calendrier et bien plus.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    // Ajouter le message utilisateur
    const newMessages = [...messages, { type: 'user', text }];
    setMessages(newMessages);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Utiliser l'endpoint avancé pour des analyses plus riches
      const response = await api.post('/report/chat-advanced', {
        question: text,
        context: analysisContext
      });

      // Ajouter la réponse du bot avec analyses et suggestions
      const botMessage = {
        type: 'bot',
        text: response.data.answer,
        source: response.data.source,
        suggestions: response.data.suggestions,
        analysis: response.data.analysis
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Mettre à jour les suggestions pour le prochain message
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Fallback sur l'endpoint basique en cas d'erreur
      try {
        const fallbackResponse = await api.post('/report/chat', {
          question: text,
          context: analysisContext
        });

        setMessages(prev => [...prev, {
          type: 'bot',
          text: fallbackResponse.data.answer,
          source: fallbackResponse.data.source
        }]);
      } catch (fallbackError) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Erreur: ${fallbackError.response?.data?.message || fallbackError.message}`,
          isError: true
        }]);
      }
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

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
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
        {messages.length > 1 && <span className="chat-badge">{messages.length - 1}</span>}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <h3>🤖 Expert AI ISO 2700x</h3>
                <p className="chat-header-subtitle">Assistant intelligent en audit de sécurité</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="chat-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`chat-message ${msg.type} ${msg.isError ? 'error' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                  {msg.source && (
                    <div className="chat-source">
                      <Zap size={12} /> {msg.source}
                    </div>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="chat-suggestions">
                      <p className="suggestions-title">
                        <Lightbulb size={14} /> Suggestions de suivi:
                      </p>
                      <div className="suggestions-list">
                        {msg.suggestions.map((sugg, sidx) => (
                          <button
                            key={sidx}
                            className="suggestion-btn"
                            onClick={() => handleSuggestionClick(sugg)}
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  className="chat-message bot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="chat-bubble loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions when no active suggestions */}
            {!isLoading && messages.length <= 1 && !showSuggestions && (
              <div className="chat-quick-tips">
                <p>💡 Les sujets que je maîtrise:</p>
                <div className="quick-tips-grid">
                  <button onClick={() => handleSuggestionClick('Comment gérer les problèmes critiques?')}>
                    ⚠️ Risques Critiques
                  </button>
                  <button onClick={() => handleSuggestionClick('Qu\'est-ce que la conformité ISO 2700x?')}>
                    ✅ Conformité
                  </button>
                  <button onClick={() => handleSuggestionClick('Comment créer un plan de remédiation?')}>
                    🔧 Remédiation
                  </button>
                  <button onClick={() => handleSuggestionClick('Quelles preuves dois-je fournir?')}>
                    📄 Preuves
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="chat-input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question sur l'audit... (Entrée pour envoyer)"
                rows="2"
                disabled={isLoading}
                className="chat-input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="chat-send-btn"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
