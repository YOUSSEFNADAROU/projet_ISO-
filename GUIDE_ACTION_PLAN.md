# 📋 Guide de Correction - Plan d'Action Non-Conformités

## ❌ Le Problème
Vous avez reçu l'erreur: **"Impossible de générer le plan d'action"**

Cela est généralement dû à des **données mal structurées** ou des **données de test invalides** comme `hhhhkklsfjhjqfdh`.

---

## ✅ La Solution

### Étape 1: Charger les bonnes données de test

Exécutez ce script pour créer des évaluations avec une structure correcte:

```bash
cd backend
node scripts/seedEvaluations.js
```

**Ce script:**
- Crée 10 évaluations (ou plus selon vos contrôles)
- 40% Conforme ✅
- 40% Partiellement conforme ⚠️
- 20% Non conforme ❌
- Toutes les données sont correctement structurées

### Étape 2: Vérifier que c'est bon

Après le script, vous devriez voir:

```
✅ Connecté à la base de données
🗑️ Évaluations précédentes supprimées
✅ 10 évaluations créées avec succès

📊 Résumé:
  ✅ Conformes: 4
  ⚠️  Partiellement: 4
  ❌ Non conformes: 2

🎯 Vous pouvez maintenant cliquer sur "Plan d'Action"!
```

### Étape 3: Tester dans l'application

1. Rafraîchissez la page frontend
2. Cliquez sur le bouton **"📋 Plan d'Action"**
3. L'application doit maintenant générer le plan correctement

---

## 📊 Structure Correcte des Évaluations

Chaque évaluation **doit avoir**:

```javascript
{
  controlId: ObjectId,           // ✅ Référence à un contrôle existant
  status: "Non conforme",        // ✅ Valeur obligatoire: 'Conforme', 'Partiellement conforme', 'Non conforme'
  justification: "Texte...",     // ✅ Description du problème
  severity: "élevée",            // ✅ 'faible', 'moyenne', 'élevée'
  probability: "élevée",         // ✅ 'faible', 'moyenne', 'élevée'
  riskLevel: "Élevé",            // Description du risque
  recommendation: "Faire..."     // Conseil de correction
}
```

### ❌ Ce qui NE FONCTIONNE PAS:

```javascript
{
  status: "hhhhkklsfjhjqfdh",     // ❌ Valeur invalide
  justification: undefined,       // ❌ Manquant
  controlId: null                 // ❌ Pas de référence au contrôle
}
```

---

## 🔧 Dépannage

### Erreur: "Aucun contrôle trouvé"
```bash
cd backend
npm run seed
```
Cela crée les contrôles ISO 2700x. Ensuite exécutez `seedEvaluations.js`.

### Erreur: "Connexion à la BD"
Vérifiez que MongoDB est **démarré**:
```bash
# Windows avec MongoDB installé
mongod

# Ou avec Docker
docker run -d -p 27017:27017 mongo
```

### Le plan d'action est vide
Cela signifie qu'**aucune non-conformité** n'a été trouvée. C'est bon! ✅
Les évaluations de test inclurennent 20% de non-conformités pour tester.

---

## 🚀 Résumé des Commandes

```bash
# 1. Créer les contrôles ISO 2700x
cd backend && npm run seed

# 2. Créer les évaluations de test
node scripts/seedEvaluations.js

# 3. Lancer le frontend
cd ../frontend && npm run dev

# 4. Aller sur http://localhost:5173
# Cliquez sur "📋 Plan d'Action"
```

---

## 💡 Points Clés

✅ Les données **DOIVENT** être structurées correctement
✅ Un `controlId` valide doit exister pour chaque évaluation
✅ Le `status` doit être l'une des 3 valeurs autorisées
✅ Les champs `severity` et `probability` doivent avoir les bonnes valeurs

Si vous avez une autre erreur, vérifiez les logs du backend dans le terminal!
