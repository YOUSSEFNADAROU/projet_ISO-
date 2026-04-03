# 📱 Intégration Frontend - Utiliser ChatGPT dans React

## 🎯 Endpoint Principal à Utiliser

```javascript
// Ancien endpoint
POST /report/chat-advanced

// ✅ NOUVEAU endpoint (recommandé)
POST /report/chat-with-controls
```

---

## 📝 Code Exemple 1: Appel Simple

```javascript
// Dans ChatPanel.jsx ou App.jsx

async function sendMessageToChatGPT(question) {
  try {
    const response = await fetch('/report/chat-with-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        context: {} // Optionnel: ajouter context métier
      })
    });

    if (!response.ok) throw new Error('Erreur API');
    
    const data = await response.json();
    
    console.log('Source:', data.source); // "Local Expert" ou "ChatGPT"
    console.log('Réponse:', data.answer);
    console.log('Suggestions:', data.suggestions);
    console.log('Confiance:', Math.round(data.confidence * 100) + '%');
    
    return data;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

// Utilisation
const result = await sendMessageToChatGPT("A.9.1.1 c'est quoi?");
```

---

## 📝 Code Exemple 2: Avec Axios (Recommandé)

```javascript
// services/chatService.js

import axios from 'axios';

const API_BASE = 'http://localhost:5000/report';

export const chatWithControls = async (question, context = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE}/chat-with-controls`,
      {
        question,
        context
      },
      {
        timeout: 10000 // 10 secondes max
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getControlInfo = async (controlCode) => {
  try {
    const response = await axios.get(
      `${API_BASE}/control/${controlCode}`
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

**Utilisation:**
```javascript
const result = await chatWithControls("Qu'est-ce que A.9.1.1?");
if (result.success) {
  console.log(result.data.answer);
  console.log(result.data.suggestions);
}
```

---

## 🔄 Code Exemple 3: Intégration dans ChatPanel

```javascript
// ChatPanel.jsx - Exemple complet

import React, { useState } from 'react';
import axios from 'axios';

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(messageText) {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    // Ajouter message utilisateur
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);

    setInputValue('');
    setIsLoading(true);

    try {
      // 🔑 APPEL ENDPOINT AVEC CHATGPT
      const response = await axios.post(
        '/report/chat-with-controls',
        {
          question: text,
          context: {}
        }
      );

      const { data } = response;

      // Construire réponse affichable
      let responseContent = data.answer;

      // Ajouter métadonnées
      responseContent += `\n\n---\n`;
      responseContent += `📊 Confiance: ${Math.round(data.confidence * 100)}%\n`;
      responseContent += `🔗 Source: ${data.source}\n`;

      if (data.analysis?.controlCode) {
        responseContent += `📋 Contrôle: ${data.analysis.controlCode}\n`;
      }

      // Ajouter message de réponse
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent,
        suggestions: data.suggestions,
        source: data.source,
        confidence: data.confidence,
        analysis: data.analysis,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error:', error);
      
      // Fallback message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erreur: Impossible de générer réponse. Réessayez.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggestionClick(suggestion) {
    // Relancer question avec suggestion
    sendMessage(suggestion);
  }

  return (
    <div className="chat-panel">
      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>

            {/* Afficher confiance pour assistant */}
            {msg.role === 'assistant' && msg.confidence && (
              <div className="message-metadata">
                <span className="confidence">
                  📊 Confiance: {Math.round(msg.confidence * 100)}%
                </span>
                <span className="source">
                  🔗 {msg.source}
                </span>
              </div>
            )}

            {/* Afficher suggestions */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="suggestions">
                <p className="suggestions-title">💡 Suggestions:</p>
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
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="spinner">⏳ Chargement...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Posez votre question ISO 2700x..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading}
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 CSS Styling

```css
/* ChatPanel.css */

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  align-self: flex-end;
  max-width: 70%;
}

.message.assistant {
  align-self: flex-start;
  max-width: 85%;
}

.message-content {
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #3b82f6;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message.assistant .message-content {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message.loading .message-content {
  background: #f3f4f6;
  font-style: italic;
}

/* Metadata */
.message-metadata {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
}

.message.user .message-metadata {
  color: #93c5fd;
}

/* Suggestions */
.suggestions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding: 12px;
  background: #f0f4ff;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
}

.suggestions-title {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin: 0;
}

.suggestion-btn {
  background: white;
  border: 1px solid #dbeafe;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: #1e40af;
}

.suggestion-btn:hover {
  background: #dbeafe;
  border-color: #3b82f6;
  transform: translateX(4px);
}

/* Chat Input */
.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.chat-input textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  max-height: 120px;
}

.chat-input button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.chat-input button:hover {
  background: #2563eb;
}

.chat-input button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

---

## 📊 Response Format Complet

```javascript
// Réponse complète du serveur

{
  // Source qui a généré la réponse
  source: "Local Expert" | "ChatGPT",

  // Réponse textuelle complète
  answer: "📋 **A.9.1.1: User registration and de-registration**\n\nDomaine: Contrôle d'accès\n...",

  // Analyse sémantique de la question
  analysis: {
    category: "controls",          // Catégorie détectée
    intention: "explanatory",      // Type de question
    severity: "medium",            // Sévérité détectée
    controlCode: "A.9.1.1",        // Code de contrôle si trouvé
    relatedControls: [             // Contrôles connexes
      {
        code: "A.9.1.1",
        title: "User registration and de-registration",
        domain: "Contrôle d'accès",
        // ... autres détails contrôle
      }
    ],
    confidence: 0.95               // Confiance 0-1
  },

  // 3 suggestions intelligentes
  suggestions: [
    "Comment implémenter A.9.1.1?",
    "Testing de user access",
    "Documentation requise"
  ],

  // Score de confiance (0-1 ou 0-100%)
  confidence: 0.95,

  // Timestamp
  timestamp: "2026-04-03T..."
}
```

---

## 🎯 Cas d'Usage

### Cas 1: Simple Question Contrôle
```javascript
const result = await chatWithControls("A.9.1.1?");

// Response:
{
  source: "Local Expert",
  answer: "Détails complets du contrôle...",
  confidence: 0.99,
  suggestions: ["Implém A.9.1.1", "Audit A.9.1.1", ...]
}
```

### Cas 2: Question Complexe
```javascript
const result = await chatWithControls(
  "Comment créer un plan d'action pour passer de 60% à 100% de conformité?"
);

// Response:
{
  source: "ChatGPT",  // ChatGPT car question complexe
  answer: "Plan complet généré par ChatGPT...",
  confidence: 0.92,
  analysis: {
    category: "remediation",
    intention: "advisory"
  }
}
```

### Cas 3: Avec Urgence
```javascript
const result = await chatWithControls(
  "URGENT: Violation de sécurité détectée!"
);

// Response:
{
  source: "Local Expert",
  answer: "Plan d'urgence 24-48h...",
  analysis: {
    severity: "critical",  // Détecté automatiquement
    ...
  },
  suggestions: ["Communication", "Isolation", "Recovery"]
}
```

---

## ⚙️ Configuration Attendue

```javascript
// Dans .env (backend)
OPENAI_API_KEY=sk-proj-xxxxx  // ou vide pour local seulement
OPENAI_MODEL=gpt-4-turbo       // ou gpt-3.5-turbo
OPENAI_TIMEOUT=30000           // 30 secondes

// Frontend - base URL
const API_BASE = 'http://localhost:5000';
```

---

## 🔄 Flow Complet

```
Frontend (React)
    │
    ├─ User: "A.9.1.1?"
    │
    └─► POST /report/chat-with-controls
        {
          question: "A.9.1.1?",
          context: {}
        }
        │
        ▼
Backend (Node.js)
    │
    ├─ analyzeQuestion()
    │  └─ Détecte: code=A.9.1.1, type=explanatory
    │
    ├─ if local_confidence > 80%:
    │  └─ generateLocalExpertResponse()
    │
    ├─ if local_confidence < 80% && OPENAI_KEY:
    │  └─ callChatGPT()
    │
    └─► Response {
          source: "Local Expert",
          answer: "...",
          confidence: 0.95,
          suggestions: [...]
        }
        │
        ▼
Frontend (React)
    │
    ├─ Affiche réponse
    ├─ Affiche "Confiance: 95%"
    ├─ Affiche "Source: Local Expert"
    └─ Affiche 3 suggestions cliquables
```

---

## ✅ Checklist Integration

- [ ] Vérifier endpoint `/report/chat-with-controls` existe
- [ ] Tester avec curl ou Postman
- [ ] Intégrer dans ChatPanel.jsx
- [ ] Afficher data.source
- [ ] Afficher data.confidence
- [ ] Afficher data.suggestions
- [ ] Cliquer suggestion = relancer question
- [ ] Tester avec clé OpenAI
- [ ] Tester sans clé OpenAI
- [ ] Valider performance (< 2s)

---

## 🚀 Ready to Use!

Copier-coller le code et adapter à votre frontend.

**Bon succès! 🎉**
