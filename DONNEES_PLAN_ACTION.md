# 📋 Données Structurées pour Plan d'Action

## Structure Générale

Chaque **action dans le plan d'action** doit avoir cette structure:

```javascript
{
  "controlCode": "A.X.X.X",              // Code ISO 2700x
  "controlTitle": "Titre du contrôle",   // Nom du contrôle
  "status": "Non conforme",              // État actuel
  "priority": "Critique",                // Niveau de priorité
  "steps": ["étape 1", "étape 2"],      // Étapes à suivre
  "resources": ["ressource 1"],          // Ressources nécessaires
  "timeline": "1-2 semaines",            // Délai estimé
  "owner": "Manager IT/Sécurité",        // Responsable
  "expectedOutcome": "Description"       // Résultat attendu
}
```

---

## 🎯 Exemples Complets par Domaine

### 1️⃣ CONTRÔLE D'ACCÈS PHYSIQUE ❌ Non Conforme

```javascript
{
  "controlCode": "A.6.1.1",
  "controlTitle": "Périmètre physique de sécurité",
  "status": "Non conforme",
  "priority": "Critique",
  "steps": [
    "1. Réaliser un audit du périmètre physique actuel",
    "2. Identifier les points d'entrée/sortie",
    "3. Installer des systèmes de contrôle d'accès (badges, portails)",
    "4. Mettre en place une politique d'accès",
    "5. Former le personnel aux mesures de sécurité",
    "6. Vérifier et documenter la conformité"
  ],
  "resources": [
    "Système de contrôle d'accès (badges RFID)",
    "Caméras de surveillance",
    "Personnel IT/Sécurité",
    "Budget: 5000-10000€"
  ],
  "timeline": "3-4 semaines",
  "owner": "Responsable Sécurité Physique",
  "expectedOutcome": "Tous les accès physiques sont contrôlés et documentés"
}
```

---

### 2️⃣ GESTION DES MOTS DE PASSE ⚠️ Partiellement Conforme

```javascript
{
  "controlCode": "A.9.2.1",
  "controlTitle": "Gestion des mots de passe utilisateur",
  "status": "Partiellement conforme",
  "priority": "Haute",
  "steps": [
    "1. Analyser la politique de mots de passe actuelle",
    "2. Renforcer les critères (longueur min 12 caractères, complexité)",
    "3. Implémenter l'authentification multi-facteurs (MFA)",
    "4. Mettre en place un gestionnaire de mots de passe",
    "5. Former les utilisateurs aux bonnes pratiques",
    "6. Auditer et valider la conformité"
  ],
  "resources": [
    "Outil MFA (Azure AD, Okta)",
    "Gestionnaire de mots de passe (LastPass, Bitwarden)",
    "Formation utilisateurs",
    "Support IT"
  ],
  "timeline": "2-3 semaines",
  "owner": "Manager IT/Administrateur Système",
  "expectedOutcome": "100% des utilisateurs ont MFA activé et utilisent des mots de passe forts"
}
```

---

### 3️⃣ CHIFFREMENT DES DONNÉES ❌ Non Conforme

```javascript
{
  "controlCode": "A.10.1.1",
  "controlTitle": "Chiffrement des données sensibles",
  "status": "Non conforme",
  "priority": "Critique",
  "steps": [
    "1. Inventorier toutes les données sensibles (BDD clients, paiements)",
    "2. Évaluer les niveaux de chiffrement requis",
    "3. Implémenter le chiffrement en transit (HTTPS, TLS 1.3)",
    "4. Implémenter le chiffrement au repos (AES-256)",
    "5. Gérer les clés de chiffrement (HSM ou vault)",
    "6. Documenter et tester les scenarios de récupération"
  ],
  "resources": [
    "Certificats SSL/TLS",
    "Solution HSM (Hardware Security Module)",
    "Ou Azure Key Vault / AWS KMS",
    "Infrastructure cloud sécurisée",
    "Experts en cryptographie"
  ],
  "timeline": "4-6 semaines",
  "owner": "Responsable Infrastructure / DPO",
  "expectedOutcome": "Toutes les données sensibles sont chiffrées en transit et au repos"
}
```

---

### 4️⃣ GESTION DES SAUVEGARDES ⚠️ Partiellement Conforme

```javascript
{
  "controlCode": "A.12.3.1",
  "controlTitle": "Sauvegardes régulières des données",
  "status": "Partiellement conforme",
  "priority": "Haute",
  "steps": [
    "1. Définir une politique de sauvegarde (RTO/RPO)",
    "2. Automatiser les sauvegardes quotidiennes",
    "3. Répliquer les sauvegardes sur site secondaire",
    "4. Tester régulièrement les restaurations",
    "5. Documenter les processus de secours",
    "6. Valider les SLA (Service Level Agreements)"
  ],
  "resources": [
    "Solution de sauvegarde (Veeam, Acronis, Azure Backup)",
    "Infrastructure secondaire",
    "Personnel qualifié IT",
    "Plans de continuité de service"
  ],
  "timeline": "2-3 semaines",
  "owner": "Administrateur Base de Données / IT",
  "expectedOutcome": "Sauvegardes automatisées, répliquées, testées mensuellement avec RTO < 4h"
}
```

---

### 5️⃣ AUTHENTIFICATION ET AUTORISATION ❌ Non Conforme

```javascript
{
  "controlCode": "A.9.1.1",
  "controlTitle": "Authentification des utilisateurs",
  "status": "Non conforme",
  "priority": "Critique",
  "steps": [
    "1. Auditer l'authentification actuelle (authentification faible détectée)",
    "2. Implémenter l'authentification centralisée (LDAP/Active Directory)",
    "3. Activer MFA pour tous les utilisateurs",
    "4. Mettre en place le SSO (Single Sign-On) si applicable",
    "5. Implémenter le logging global (audit trail)",
    "6. Vérifier la conformité avec audits réguliers"
  ],
  "resources": [
    "Serveur Active Directory / LDAP",
    "Solution MFA",
    "Solution SSO (Okta, Azure AD)",
    "Outils de monitoring (SIEM)",
    "Formation IT"
  ],
  "timeline": "3-4 semaines",
  "owner": "Manager IT / Sécurité",
  "expectedOutcome": "Tous les accès utilisateurs authentifiés centralement avec MFA"
}
```

---

## 📊 Tableau Récapitulatif - À Remplir

| Code | Titre | Priorité | Timeline | Étapes | Ressources | Responsable | État |
|------|-------|----------|----------|--------|-----------|-------------|------|
| A.6.1.1 | Périmètre physique | Critique | 3-4 sem | 6 | Badges, caméras | Resp. Sécurité | ⏳ En cours |
| A.9.2.1 | Mots de passe | Haute | 2-3 sem | 6 | MFA, gestionnaire | Manager IT | ⏳ En cours |
| A.10.1.1 | Chiffrement | Critique | 4-6 sem | 6 | HSM, certificats | DPO | ⏳ En cours |
| A.12.3.1 | Sauvegardes | Haute | 2-3 sem | 6 | Veeam, réplication | DBA | ⏳ En cours |
| A.9.1.1 | Authentification | Critique | 3-4 sem | 6 | AD, MFA, SSO | Manager IT | ⏳ En cours |

---

## 🔑 Points Clés pour Chaque Champ

### **controlCode** (Requis)
- Format ISO: `A.X.X.X`
- Exemples: A.6.1.1, A.9.2.1, A.10.1.1, A.12.3.1

### **priority** (Requis)
- **Critique**: Risque très élevé, action immédiate (< 2 sem)
- **Haute**: Risque élevé, action rapide (2-4 sem)
- **Moyenne**: Risque modéré (4-8 sem)
- **Basse**: Risque faible (> 8 sem)

### **timeline** (Requis)
- `"1-2 semaines"` pour Critique
- `"2-4 semaines"` pour Haute
- `"4-8 semaines"` pour Moyenne
- `"8+ semaines"` pour Basse

### **steps** (Array de 5-6 étapes)
1. Audit/Analyse
2. Définition/Planification
3. Implémentation/Installation
4. Configuration/Intégration
5. Formation/Documentation
6. Validation/Vérification

### **resources** (Array minimum 3)
- Personnel/Rôles
- Outils/Logiciels
- Infrastructure
- Budget (si applicable)

### **owner**
- Rôles courants:
  - Manager IT
  - Responsable Sécurité
  - DBA (Database Admin)
  - DPO (Data Protection Officer)
  - Administrateur Système

---

## 💾 Format JSON pour Import Direct

```json
{
  "actionPlan": [
    {
      "controlCode": "A.6.1.1",
      "controlTitle": "Périmètre physique de sécurité",
      "status": "Non conforme",
      "priority": "Critique",
      "steps": ["Étape 1...", "Étape 2..."],
      "resources": ["Ressource 1...", "Ressource 2..."],
      "timeline": "3-4 semaines",
      "owner": "Responsable Sécurité Physique",
      "expectedOutcome": "Tous les accès physiques contrôlés"
    }
  ]
}
```

---

## 🎯 Prochaines Étapes

1. **Sélectionnez** les contrôles non-conformes de votre rapport
2. **Utilisez** les structures ci-dessus comme templates
3. **Adaptez** les données à votre contexte spécifique
4. **Remplissez** et sauvegardez la liste des actions
5. **Assignez** les responsables et délais
6. **Suivez** la progression mensuellement
