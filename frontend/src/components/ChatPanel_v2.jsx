import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { chatContextualApi, chatExpertApi } from '../services/api';
import ChatHeader from './chat/ChatHeader';
import ChatComposer from './chat/ChatComposer';
import ExpertResponseCard from './chat/ExpertResponseCard';
import MessageBubble from './chat/MessageBubble';
import QuickSuggestions from './chat/QuickSuggestions';
import TypingIndicator from './chat/TypingIndicator';
import { QUICK_SUGGESTIONS } from './chat/chatTheme';
import './ChatPanel_v2.css';

const ChatPanel = ({ analysisContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Bonjour, je suis votre assistant d'audit ISO 27001/27002. Je peux analyser vos donnees d'audit, structurer les risques et recommander les prochaines actions.",
      isWelcome: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const buildConversationHistory = (items) =>
    items
      .filter((item) => !item.isWelcome && item.text)
      .slice(-6)
      .map((item) => ({
        role: item.type === 'user' ? 'user' : 'assistant',
        content: item.text,
      }));

  const fetchChatResponse = async (payload) => {
    try {
      return await chatExpertApi(payload);
    } catch (error) {
      if (error.response?.status === 404) {
        return chatContextualApi(payload);
      }
      throw error;
    }
  };

  const sendMessage = async (messageText = null) => {
    const text = (messageText || inputValue).trim();
    if (!text) return;

    const userMessage = { type: 'user', text };
    const nextMessages = [...messages, userMessage];
    const payload = {
      question: text,
      context: analysisContext || {},
      conversationHistory: buildConversationHistory(nextMessages),
    };

    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetchChatResponse(payload);

      if (!response.data?.success || !response.data?.response) {
        throw new Error(response.data?.message || 'Reponse invalide');
      }

      const responsePayload = response.data;
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text:
            responsePayload.response.finalText ||
            responsePayload.response.text ||
            responsePayload.response.htmlContent ||
            '',
          isStructured: true,
          response: responsePayload.response,
          metadata: responsePayload.metadata || {},
          actions: responsePayload.response.actions || [],
          suggestions:
            responsePayload.response.suggestions ||
            responsePayload.response.nextSteps ||
            responsePayload.response.sections?.nextQuestions ||
            [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: `Impossible de recuperer la reponse d'audit. ${error.response?.data?.message || error.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message, index) => {
    return (
      <MessageBubble key={index} message={message}>
        {message.isStructured ? <ExpertResponseCard message={message} onSendMessage={sendMessage} /> : <p>{message.text}</p>}
      </MessageBubble>
    );
  };

  return (
    <>
      <motion.button
        className="chat-floating-button"
        onClick={() => setIsOpen((value) => !value)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Ouvrir l assistant audit ISO"
      >
        <MessageCircle size={22} />
        <span className="chat-floating-glow"></span>
        <span className="chat-floating-pulse"></span>
        {messages.length > 1 && <span className="chat-badge">{messages.length - 1}</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <ChatHeader onClose={() => setIsOpen(false)} />

            <div className="chat-messages">
              <div className="chat-context-banner">
                <Sparkles size={14} />
                <span>Assistant premium de pilotage audit, risques, preuves et plans d action ISO.</span>
              </div>

              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
              <QuickSuggestions suggestions={QUICK_SUGGESTIONS} onSelect={sendMessage} disabled={isLoading} />
              <ChatComposer
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyPress}
                onSend={() => sendMessage()}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
