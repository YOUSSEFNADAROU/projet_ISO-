#!/bin/bash

# 🔍 Diagnostic Script - Valider Chatbot Contextuel Installation

echo "======================================================"
echo "🔍 DIAGNOSTIC - Chatbot Contextuel Installation"
echo "======================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
CHECKS_PASSED=0
CHECKS_FAILED=0

# Fonction check
check() {
  local name=$1
  local command=$2
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $name"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌${NC} $name"
    ((CHECKS_FAILED++))
  fi
}

check_file() {
  local name=$1
  local file=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $name"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌${NC} $name"
    ((CHECKS_FAILED++))
  fi
}

check_content() {
  local name=$1
  local file=$2
  local pattern=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $name"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌${NC} $name"
    ((CHECKS_FAILED++))
  fi
}

# ====== FICHIERS CRÉÉS ======
echo -e "${BLUE}📁 FICHIERS CRÉÉS${NC}"
echo ""

check_file "Service contextuel existe" "backend/services/contextualChatService.js"
check_file "Component ChatPanel_v2 existe" "frontend/src/components/ChatPanel_v2.jsx"
check_file "CSS ChatPanel_v2 existe" "frontend/src/components/ChatPanel_v2.css"
check_file "Guide intégration existe" "INTEGRATION_GUIDE.md"
check_file "Quick start existe" "QUICK_START.md"

echo ""

# ====== CONTENU FICHIERS ======
echo -e "${BLUE}📝 CONTENU FICHIERS${NC}"
echo ""

check_content "Service contient analyzeAndFetchData" "backend/services/contextualChatService.js" "analyzeAndFetchData"
check_content "Service contient detectQuestionType" "backend/services/contextualChatService.js" "detectQuestionType"
check_content "Service contient buildStructuredResponse" "backend/services/contextualChatService.js" "buildStructuredResponse"
check_content "Component importe ChatPanel_v2.css" "frontend/src/components/ChatPanel_v2.jsx" "ChatPanel_v2.css"
check_content "Component utilise /report/chat-contextual" "frontend/src/components/ChatPanel_v2.jsx" "chat-contextual"

echo ""

# ====== MODIFICATIONS ======
echo -e "${BLUE}🔄 MODIFICATIONS${NC}"
echo ""

check_content "reportController importe contextualChatService" "backend/controllers/reportController.js" "contextualChatService"
check_content "reportController contient chatContextual" "backend/controllers/reportController.js" "chatContextual"
check_content "report.js route /chat-contextual existe" "backend/routes/report.js" "chat-contextual"

echo ""

# ====== PORT CHECK ======
echo -e "${BLUE}🌐 CONNEXION${NC}"
echo ""

check "Backend accessible (5000)" "curl -s http://localhost:5000/health > /dev/null 2>&1 || true"
check "Frontend accessible (5175)" "curl -s http://localhost:5175 > /dev/null 2>&1 || true"

echo ""

# ====== MONGODB ======
echo -e "${BLUE}💾 MONGODB${NC}"
echo ""

check_file "Script listEvaluations existe" "backend/scripts/listEvaluations.js"

echo ""

# ====== RÉSUMÉ ======
echo "======================================================"
echo -e "${BLUE}📊 RÉSUMÉ${NC}"
echo "======================================================"
echo -e "${GREEN}✅ Checks passés: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Checks échoués: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Installation OK!${NC}"
  echo ""
  echo "Prochaines étapes:"
  echo "1. Importer ChatPanel_v2 dans frontend/src/App.jsx"
  echo "2. Redémarrer backend et frontend"
  echo "3. Tester: http://localhost:5175/"
  echo "4. Poser question au chatbot: 'Status A.9.1.1?'"
  echo ""
else
  echo -e "${RED}⚠️  Certains checks ont échoué!${NC}"
  echo "Voir l'erreurs ci-dessus et vérifier les fichiers"
  echo ""
fi

# ====== COMMANDES UTILES ======
echo -e "${BLUE}🛠️  COMMANDES UTILES${NC}"
echo ""
echo "Vérifier données MongoDB:"
echo "  cd backend && node scripts/listEvaluations.js"
echo ""
echo "Redémarrer services:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Tester endpoint directement:"
echo "  curl -X POST http://localhost:5000/report/chat-contextual -H 'Content-Type: application/json' -d '{\"question\": \"Status A.9.1.1?\", \"context\": {}}'"
echo ""
