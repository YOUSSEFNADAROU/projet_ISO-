# 🧪 Plan de Test - Agent Expert ISO 2700x

## Accès à l'Application

**URL:** http://localhost:5175/
**Backend:** http://localhost:5000

---

## 📋 Scénarios de Test

### Test 1: Questions Explicatives ✅
**Objectif:** Vérifier que l'agent explique ISO 2700x clairement

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 1.1 | "C'est quoi ISO 2700x?" | Définition + principes clés | |
| 1.2 | "Qu'est-ce qu'un contrôle?" | Explication + exemples | |
| 1.3 | "Comment fonctionne un audit?" | Étapes + processus | |
| 1.4 | "Différence conformité vs non-conforme?" | Comparaison tableau | |

---

### Test 2: Questions Consultatives (Conseils) ✅
**Objectif:** Vérifier que l'agent donne des conseils pratiques

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 2.1 | "Que recommandez-vous pour mon audit?" | Plan d'action structuré | |
| 2.2 | "Comment gérer les risques critiques?" | Étapes d'urgence | |
| 2.3 | "Quel plan pour la remédiation?" | 5 étapes de remédiation | |
| 2.4 | "Aider mon équipe à se former?" | Conseils formation | |

---

### Test 3: Questions d'Exemples ✅
**Objectif:** Vérifier que l'agent fourni des exemples pratiques

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 3.1 | "Exemple de contrôle d'accès?" | Cas concrets MFA | |
| 3.2 | "Cas d'audit réussi?" | Scénario pratique | |
| 3.3 | "Exemple de sauvegarde?" | Bonnes pratiques backup | |
| 3.4 | "Instances de formation du personnel?" | Exemples de programmes | |

---

### Test 4: Questions de Comparaison ✅
**Objectif:** Vérifier les comparaisons structurées

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 4.1 | "Audit initial vs suivi?" | Tableau comparatif | |
| 4.2 | "Critique vs élevé?" | Matrice de sévérité | |
| 4.3 | "Technologique vs organisationnel?" | Types de contrôles | |

---

### Test 5: Domaine Risques & Menaces ⚠️
**Objectif:** Vérifier les réponses sur les risques

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 5.1 | "Problème critique détecté!" | Actions d'urgence 24-48h | |
| 5.2 | "Comment évaluer les risques?" | Matrice sévérité/probabilité | |
| 5.3 | "Risques de phishing?" | Mitigations spécifiques | |

---

### Test 6: Domaine Conformité ✅
**Objectif:** Vérifier les réponses de conformité

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 6.1 | "Sommes-nous conformes?" | Analyse critique | |
| 6.2 | "Pas conforme que faire?" | Plan d'action détaillé | |
| 6.3 | "Améliorer progressivement?" | Phases de progression | |

---

### Test 7: Domaine Contrôles 🔐
**Objectif:** Vérifier les réponses sur les contrôles

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 7.1 | "Quels contrôles existe?" | Liste ISO 2700x | |
| 7.2 | "Comment implémenter?" | Étapes de mise en place | |
| 7.3 | "Contrôle chiffrement?" | Recommandations spécifiques | |

---

### Test 8: Domaine Preuves 📚
**Objectif:** Vérifier les réponses sur la documentation

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 8.1 | "Quelles preuves fournir?" | 6 types de preuves | |
| 8.2 | "Comment documenter?" | Structuration de docs | |
| 8.3 | "Preuve valide?" | Critères d'acceptation | |

---

### Test 9: Domaine Audit 📋
**Objectif:** Vérifier les réponses d'audit

| # | Question | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 9.1 | "Se préparer à l'audit?" | Checklist complète | |
| 9.2 | "Fréquence audits?" | Calendrier recommandé | |
| 9.3 | "Auditeurs vérifient quoi?" | Domaines contrôlés | |

---

### Test 10: Suggestions de Suivi 💡
**Objectif:** Vérifier que les suggestions sont pertinentes

| # | Scenario | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 10.1 | Question risque critique → Click suggestion | Étape suivante cohérente | |
| 10.2 | Question conformité → Click suggestion | Approfondissement pertinent | |
| 10.3 | Question générique → Click suggestion | Précision progressive | |

---

### Test 11: Interface & UX 🎨
**Objectif:** Vérifier l'expérience utilisateur

| # | Scenario | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 11.1 | Ouvrir le chat | Panel s'affiche smoothly | |
| 11.2 | Taper une question | Suggestions quick tips visibles | |
| 11.3 | Envoyer question | Animation loader + réponse | |
| 11.4 | Lire réponse | Formatage clair avec emojis | |
| 11.5 | Voir suggestions | Boutons cliquables | |
| 11.6 | Click suggestion | Nouvelle question envoyée | |
| 11.7 | Fermer chat | Panel close smoothly | |

---

### Test 12: Edge Cases & Robustesse 🔧
**Objectif:** Vérifier la robustesse

| # | Scenario | Résultat Attendu | ✓ |
|---|----------|------------------|---|
| 12.1 | Question très longue (500 mots) | Réponse structurée | |
| 12.2 | Question cryptique | Aide générale proposée | |
| 12.3 | Question en majuscules | Traitement normal | |
| 12.4 | Caractères spéciaux | Pas d'erreur | |
| 12.5 | Pas de contexte audit | Réponse générique OK | |
| 12.6 | Connexion perdue | Message d'erreur clair | |

---

## 🎯 Critères de Succès Global

✅ **API Backend**
- [ ] Endpoint `/report/chat` répond correctement
- [ ] Endpoint `/report/chat-advanced` retourne analyse + suggestions
- [ ] Pas d'erreur serveur (5xx)
- [ ] Temps de réponse < 500ms (local)

✅ **Logique IA**
- [ ] Questions reconnues et catégorisées correctement
- [ ] Réponses structurées et cohérentes
- [ ] Pas de réponse répétée (même question = réponses différentes)
- [ ] Suggestions pertinentes au contexte

✅ **UI/UX Frontend**
- [ ] Animations fluides
- [ ] Affichage correct des réponses longues
- [ ] Boutons suggestions cliquables
- [ ] Responsive design (mobile/desktop)

✅ **Robustesse**
- [ ] Gestion des erreurs gracieuse
- [ ] Fallback sur endpoint basique si avancé échoue
- [ ] Pas de crash avec entrées bizarres
- [ ] Timeouts gérés

---

## 📊 Résultats de Test

**Date:** _______________
**Testeur:** _______________

### Résumé
- Tests réussis: _____ / 60
- Tests échoués: _____
- Edge cases trouvés: _____

### Observations
```
[Vos observations ici]
```

### Recommandations
```
[Vos recommandations ici]
```

---

## 🚀 Prochaines Étapes

- [ ] Tous les tests passent ✅
- [ ] Déployer en production
- [ ] Monitorer les questions réelles
- [ ] Améliorer continuellement
