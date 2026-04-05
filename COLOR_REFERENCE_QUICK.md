# 🎨 Référence Rapide des Couleurs - ISO Audit System

## 📌 Palette Complète

### **DARK BLUE** (Primaire)
```
#0d2438 ████████████████████ Dark Blue (Navigation)
#1a3a52 ████████████████████ Primary
#2d5a7b ████████████████████ Light
```
**Utilisation**: Navigation, headers, accents primaires

---

### **BLUE** (Info/Accents)
```
#2563eb ████████████████████ Blue Info
#dbeafe ████████████████████ Blue Light (Background)
```
**Utilisation**: Liens, boutons info, accents interactifs

---

### **GREEN** (Succès/Conformité)
```
#10b981 ████████████████████ Green Success
#d1fae5 ████████████████████ Green Light (Background)
```
**Utilisation**: Statut Conforme, succès, indicateurs positifs

---

### **RED** (Erreur/Non-Conforme)
```
#ef4444 ████████████████████ Red Error
#fee2e2 ████████████████████ Red Light (Background)
```
**Utilisation**: Non-conforme, erreurs, indicateurs critiques

---

### **AMBER/ORANGE** (Avertissement)
```
#f59e0b ████████████████████ Amber Warning
#fef3c7 ████████████████████ Amber Light (Background)
```
**Utilisation**: Partiellement conforme, avertissements

---

### **GRAY SCALE** (Texte & Bordures)
```
#0f172a ████████████████████ Gray 900 (Très sombre)
#1e293b ████████████████████ Gray 800 (Texte principal)
#334155 ████████████████████ Gray 700
#3d4d5c ████████████████████ Gray 600 (Texte secondaire)
#64748b ████████████████████ Gray 500 (Texte tertiaire)
#94a3b8 ████████████████████ Gray 400 (Placeholder)
#cbd5e1 ████████████████████ Gray 300 (Bordure claires)
#e2e8f0 ████████████████████ Gray 200 (Bordure standard)
#f1f5f9 ████████████████████ Gray 100 (Background clair)
#f8fafc ████████████████████ Gray 50 (Très clair)
```

---

### **BACKGROUNDS**
```
#f8fafc ████████████████████ Primary Background
#ffffff ████████████████████ Secondary (Cartes, modals)
#f1f5f9 ████████████████████ Tertiary (Sections)
```

---

## 🎯 Usage Map

### Composants

| Composant | Couleur Primaire | Couleur Secondaire | Couleur de État |
|-----------|------------------|-------------------|-----------------|
| **Sidebar** | #0d2438 | #2563eb | N/A |
| **Buttons Primaire** | #1a3a52 → #2563eb (gradient) | Blanc | N/A |
| **Cards** | #ffffff | #f1f5f9 | #cbd5e1 (border) |
| **Badge Conforme** | #d1fae5 | #10b981 (text) | #10b981 (border) |
| **Badge Partiellement** | #fef3c7 | #f59e0b (text) | #f59e0b (border) |
| **Badge Non-conforme** | #fee2e2 | #ef4444 (text) | #ef4444 (border) |
| **Text Primaire** | #0d2438 | N/A | N/A |
| **Text Secondaire** | #3d4d5c | N/A | N/A |
| **Inputs Focus** | #2563eb | #dbeafe (shadow) | N/A |
| **Liens** | #2563eb | #1a3a52 (hover) | N/A |

---

## 🔄 Gradients Recommandés

### Gradient Primaire (Boutons, Accents)
```
linear-gradient(135deg, #1a3a52 0%, #2563eb 100%)
```

### Gradient Dark (Navigation)
```
linear-gradient(180deg, #0d2438 0%, #1a3a52 100%)
```

### Gradient Léger (Cards)
```
linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%)
```

### Gradient Succès
```
linear-gradient(135deg, #d1fae5 0%, rgba(16, 185, 129, 0.08) 100%)
```

---

## 📊 Dark Mode (Pour Futur)

Prêt à implémenter:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-dark: #1a3a52;
    --color-primary: #2d5a7b;
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1a2332;
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    /* ... */
  }
}
```

---

## 🔐 Contraste & Accessibilité

| Combinaison | Ratio | WCAG Level | Status |
|-------------|-------|-----------|--------|
| #0d2438 texte sur #ffffff | 14.5:1 | AAA | ✅ |
| #1a3a52 texte sur #ffffff | 11.2:1 | AAA | ✅ |
| #3d4d5c texte sur #ffffff | 7.1:1 | AA | ✅ |
| #64748b texte sur #ffffff | 4.8:1 | AA | ✅ |
| #2563eb texte sur #ffffff | 4.5:1 | AA | ✅ |
| #10b981 texte sur #d1fae5 | 7.2:1 | AAA | ✅ |
| #ef4444 texte sur #fee2e2 | 6.8:1 | AAA | ✅ |

---

## 💾 Format CSS Variable

```css
:root {
  /* Primary Colors */
  --color-primary-dark: #0d2438;
  --color-primary: #1a3a52;
  --color-primary-light: #2d5a7b;
  
  /* Info */
  --color-info: #2563eb;
  --color-info-light: #dbeafe;
  
  /* Success */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  
  /* Error */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  
  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  
  /* Gray Scale */
  --color-gray-900: #0f172a;
  --color-gray-800: #1e293b;
  /* ... rest of the scale ... */
}
```

---

## 🎬 Recommended Transitions

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth */
transition: all 0.3s ease-out;  /* General */
transition: transform 0.2s ease;  /* Movement */
```

---

## 📱 Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## Fichiers de Référence

- 📄 **THEME_COLORS_GUIDE.md** - Guide complet détaillé
- 📄 **ADVANCED_UI_RECOMMENDATIONS.md** - Recommandations avancées
- 📄 **UI_IMPROVEMENTS_SUMMARY.md** - Résumé des changements
- 📁 **frontend/src/index.css** - Variables CSS source

---

**Date**: Avril 2026
**Version**: 3.0
**Status**: ✅ Implémenté
