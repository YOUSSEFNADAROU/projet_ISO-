# ⚡ Quick Start - Intégration Chatbot Contextuel

## 🎯 3 Étapes pour Démarrer

### ✅ Étape 1: Importer le composant (2 minutes)

Ouvrir [frontend/src/App.jsx](../frontend/src/App.jsx) et remplacer:

```jsx
// Ligne ~50 - Chercher l'import ChatPanel
- import ChatPanel from './components/ChatPanel';
+ import ChatPanel_v2 from './components/ChatPanel_v2';

// Puis trouver l'utilisation du composant et remplacer:
- <ChatPanel analysisContext={analysisContext} />
+ <ChatPanel_v2 analysisContext={analysisContext} />
```

### ✅ Étape 2: Redémarrer les serveurs (1 minute)

```bash
# Terminal 1 - Backend
cd backend && npm start
# Devrait voir: "Server running on http://localhost:5000"

# Terminal 2 - Frontend  
cd frontend && npm run dev
# Devrait voir: "VITE v... ready in X ms"
```

### ✅ Étape 3: Tester le chatbot (2 minutes)

1. Aller à **`http://localhost:5175/`**
2. Cliquer **💬** (bouton bleu en bas à droite)
3. Poser: **"Status A.9.1.1?"**
4. Voir réponse structurée avec données MongoDB réelles ✅

---

## 📂 Fichiers à Vérifier

✅ **Nouveaux fichiers créés:**
- [backend/services/contextualChatService.js](../backend/services/contextualChatService.js)
- [frontend/src/components/ChatPanel_v2.jsx](../frontend/src/components/ChatPanel_v2.jsx)
- [frontend/src/components/ChatPanel_v2.css](../frontend/src/components/ChatPanel_v2.css)

✅ **Fichiers modifiés:**
- [backend/controllers/reportController.js](../backend/controllers/reportController.js) - nouvel endpoint `chatContextual()`
- [backend/routes/report.js](../backend/routes/report.js) - nouvelle route `/chat-contextual`

---

## 🧪 Questions de Test

Tester avec le chatbot:

| Question | Type Attendu | Données |
|----------|-------------|---------|
| **"Status A.9.1.1?"** | status | ✅ Contrôle + Évaluation |
| **"Plan A.9.1.1?"** | remediation | ✅ 5 étapes |
| **"Preuves A.9.1.1?"** | evidence | ✅ Types de doc |
| **"Risque A.9.1.1?"** | risk | ✅ Sévérité |
| **"Conformité?"** | statistics | ✅ % compliance |
| **"Contexte?"** | context | ✅ Scenario info |

**Attendu pour chaque:** Réponse structurée + badges "✅ Données réelles"

---

## 🚨 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| **"Endpoint not found"** | Redémarrer backend |
| **"Réponses génériques"** | Vérifier MongoDB: `node scripts/listEvaluations.js` |
| **"CSS pas appliqué"** | Effacer cache browser (Ctrl+Shift+R) |
| **"Erreur serveur 500"** | Voir logs backend - vérifier MongoDB connectée |

---

## 📋 Checklist Finale

- [ ] `ChatPanel_v2` importé dans App.jsx
- [ ] Backend redémarré (port 5000)
- [ ] Frontend redémarré (port 5175)  
- [ ] MongoDB data exists: `node scripts/listEvaluations.js`
- [ ] Chat bouton 💬 visible
- [ ] Question "Status A.9.1.1?" retourne réponse structurée
- [ ] Réponse contient badge ✅ "Données réelles"
- [ ] Boutons d'action cliquables

**C'est fait! 🎉**

---

**Pour guide complet:** Voir [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
