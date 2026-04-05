# 🎨 Guide du Thème et des Couleurs - ISO Audit System

## Vue d'ensemble

Ce guide documente le nouveau système de couleurs cohérent appliqué à l'application ISO Audit Simulator, basé sur le thème **Dark Blue + Dark Gray avec indicateurs Green/Red**.

---

## 📋 Palette de Couleurs

### Couleurs Primaires

| Variable | Code Hex | Utilisation |
|----------|----------|-------------|
| `--color-primary-dark` | `#0d2438` | Navigation primaire, headers |
| `--color-primary` | `#1a3a52` | Accents, boutons secondaires |
| `--color-primary-light` | `#2d5a7b` | Hover states, bordures actives |

### Échelle de Gris

| Variable | Code Hex | Utilisation |
|----------|----------|-------------|
| `--color-gray-900` | `#0f172a` | Texte très sombre |
| `--color-gray-800` | `#1e293b` | Texte primaire |
| `--color-gray-700` | `#334155` | Texte secondaire fort |
| `--color-gray-600` | `#3d4d5c` | Texte secondaire |
| `--color-gray-500` | `#64748b` | Texte tertiaire |
| `--color-gray-400` | `#94a3b8` | Placeholders |
| `--color-gray-300` | `#cbd5e1` | Bordures claires |
| `--color-gray-200` | `#e2e8f0` | Bordures normales |
| `--color-gray-100` | `#f1f5f9` | Background léger |
| `--color-gray-50` | `#f8fafc` | Background très léger |

### Indicateurs de Statut

| Statut | Couleur | Code Hex | Utilisation |
|--------|---------|----------|-------------|
| Success | Green | `#10b981` | Conformes, réussis |
| Error | Red | `#ef4444` | Non-conforme, erreurs |
| Warning | Amber | `#f59e0b` | Partiellement conforme, avertissements |
| Info | Blue | `#2563eb` | Informations, liens |

### Variantes de Statut

```css
--color-success-light: #d1fae5;      /* Background Success */
--color-error-light: #fee2e2;        /* Background Error */
--color-warning-light: #fef3c7;      /* Background Warning */
--color-info-light: #dbeafe;         /* Background Info */
```

---

## 🎯 Utilisation des Couleurs

### Navigation & Headers

```css
/* Sidebar */
background: linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);

/* Links actifs */
background-color: var(--color-info);
```

### Boutons

#### Bouton Primaire
```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%);
  color: white;
  box-shadow: var(--shadow-md);
}
```

#### Bouton Succès
```css
.btn-success {
  background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);
  color: white;
}
```

#### Bouton Danger
```css
.btn-danger {
  background: linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%);
  color: white;
}
```

### Cartes & Conteneurs

Toutes les cartes utilisent maintenant:
```css
.card {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 50%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  
  /* Barre latérale accent */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-info) 100%);
  }
}
```

### Badges & Statuts

#### Badge Conforme
```css
.status-conforme {
  background: linear-gradient(135deg, var(--color-success-light) 0%, rgba(16, 185, 129, 0.08) 100%);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
```

#### Badge Partiellement Conforme
```css
.status-partiellement {
  background: linear-gradient(135deg, var(--color-warning-light) 0%, rgba(245, 158, 11, 0.08) 100%);
  color: #92400e;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
```

#### Badge Non-Conforme
```css
.status-non-conforme {
  background: linear-gradient(135deg, var(--color-error-light) 0%, rgba(239, 68, 68, 0.08) 100%);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

## ⚫ Système d'Ombres

```css
--shadow-xs: 0 1px 2px 0 rgba(13, 36, 56, 0.04);
--shadow-sm: 0 1px 3px 0 rgba(13, 36, 56, 0.08), 0 1px 2px 0 rgba(13, 36, 56, 0.04);
--shadow-md: 0 4px 6px -1px rgba(13, 36, 56, 0.1), 0 2px 4px -1px rgba(13, 36, 56, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(13, 36, 56, 0.15), 0 4px 6px -2px rgba(13, 36, 56, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(13, 36, 56, 0.15), 0 10px 10px -5px rgba(13, 36, 56, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(13, 36, 56, 0.25);
```

---

## 📏 Rayons de Bordure

```css
--radius-sm: 6px;     /* Petits éléments */
--radius-md: 8px;     /* Inputs, badges */
--radius-lg: 12px;    /* Cartes, modals */
--radius-xl: 16px;    /* Grands conteneurs */
```

---

## 📐 Espacement

```css
--spacing-xs: 4px;    /* Très petit espacement */
--spacing-sm: 8px;    /* Petits espacements */
--spacing-md: 12px;   /* Espacements normaux */
--spacing-lg: 16px;   /* Espacements généreux */
--spacing-xl: 24px;   /* Grandes sections */
--spacing-2xl: 32px;  /* Très grandes sections */
--spacing-3xl: 48px;  /* Énormes espacements */
```

---

## ✨ Recommandations de Style

### 1. **Hiérarchie Visuelle**
- Utilisez le dark blue primaire pour les éléments clés
- Utilisez le dark gray pour le texte secondaire
- Utilisez les indicateurs (green/red) uniquement pour les statuts

### 2. **Gradients**
Appliquez des gradients subtils pour plus de profondeur:
```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%);
```

### 3. **Transitions**
Utilisez des transitions fluides pour les interactions:
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### 4. **Hover States**
Pour les cartes et les éléments interactifs:
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}
```

### 5. **Focus States**
Pour l'accessibilité des inputs:
```css
input:focus {
  outline: none;
  border-color: var(--color-info);
  box-shadow: 0 0 0 3px var(--color-info-light);
}
```

---

## 🎬 Animations Recommandées

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Slide In
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Pulse (pour les actions)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📝 Classe Utilitaire

### Texte
```css
.text-primary    /* Dark blue */
.text-success    /* Green */
.text-error      /* Red */
.text-warning    /* Amber */
.text-info       /* Blue accent */
.text-muted      /* Gray */
```

### Background
```css
.bg-primary      /* Dark blue */
.bg-success      /* Green */
.bg-error        /* Red */
```

### Autres
```css
.rounded         /* Border radius */
.shadow          /* Box shadow */
```

---

## 🔄 Fichiers CSS Modifiés

- ✅ `index.css` - Variables globales
- ✅ `styles.css` - Styles généraux et utilities
- ✅ `components/Sidebar.css` - Navigation
- ✅ `components/Topbar.css` - Header
- ✅ `components/Card.css` - Conteneurs
- ✅ `components/StatCard.css` - Cartes statistiques
- ✅ `components/ControlCard.css` - Cartes de contrôle
- ✅ `components/StatusBadge.css` - Badges de statut
- ✅ `components/RiskBadge.css` - Badges de risque

---

## 💡 Conseils d'Implémentation

1. **Toujours utiliser les variables CSS** plutôt que les codes hex
2. **Utiliser les gradients** pour les boutons primaires et les accents
3. **Appliquer des transitions** pour une meilleure UX
4. **Tester le responsive** sur mobile (768px et moins)
5. **Vérifier le contraste** pour l'accessibilité (WCAG AA)
6. **Utiliser les ombres avec modération** pour éviter le surcharge visuelle

---

## 📱 Supports & Responsive

Le thème s'adapte automatiquement:
- **Desktop** (> 1024px): Largeur complète avec sidebar fixe
- **Tablet** (768px - 1024px): Layout optimisé
- **Mobile** (< 768px): Stack vertical, sidebar coulissante

---

## ✅ Checklist pour les Nouveaux Composants

- [ ] Utiliser les variables CSS pour toutes les couleurs
- [ ] Ajouter des transitions douces sur les hover states
- [ ] Implémenter les focus states pour l'accessibilité
- [ ] Utiliser le bon radius selon la taille du composant
- [ ] Appliquer les ombres appropriées
- [ ] Respecter l'espacement avec les variables
- [ ] Tester sur tous les appareils
- [ ] Vérifier le contraste des textes

---

**Version**: 3.0  
**Dernière mise à jour**: Avril 2026  
**Auteur**: ISO Audit System UI Team
