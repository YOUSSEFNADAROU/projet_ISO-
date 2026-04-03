# 🔍 Diagnostic Script - Valider Chatbot Contextuel Installation (Windows PowerShell)

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🔍 DIAGNOSTIC - Chatbot Contextuel Installation" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Compteurs
$checksPass = 0
$checksFail = 0

# Fonction pour vérifier les fichiers
function Check-File {
    param(
        [string]$Name,
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        Write-Host "✅ $Name" -ForegroundColor Green
        $script:checksPass++
    } else {
        Write-Host "❌ $Name" -ForegroundColor Red
        $script:checksFail++
    }
}

# Fonction pour vérifier le contenu
function Check-Content {
    param(
        [string]$Name,
        [string]$FilePath,
        [string]$Pattern
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        if ($content -match $Pattern) {
            Write-Host "✅ $Name" -ForegroundColor Green
            $script:checksPass++
        } else {
            Write-Host "❌ $Name" -ForegroundColor Red
            $script:checksFail++
        }
    } else {
        Write-Host "❌ $Name (fichier non trouvé)" -ForegroundColor Red
        $script:checksFail++
    }
}

# ====== FICHIERS CRÉÉS ======
Write-Host "📁 FICHIERS CRÉÉS" -ForegroundColor Blue
Write-Host ""

Check-File "Service contextuel existe" "backend/services/contextualChatService.js"
Check-File "Component ChatPanel_v2 existe" "frontend/src/components/ChatPanel_v2.jsx"
Check-File "CSS ChatPanel_v2 existe" "frontend/src/components/ChatPanel_v2.css"
Check-File "Guide intégration existe" "INTEGRATION_GUIDE.md"
Check-File "Quick start existe" "QUICK_START.md"

Write-Host ""

# ====== CONTENU FICHIERS ======
Write-Host "📝 CONTENU FICHIERS" -ForegroundColor Blue
Write-Host ""

Check-Content "Service contient analyzeAndFetchData" "backend/services/contextualChatService.js" "analyzeAndFetchData"
Check-Content "Service contient detectQuestionType" "backend/services/contextualChatService.js" "detectQuestionType"
Check-Content "Service contient buildStructuredResponse" "backend/services/contextualChatService.js" "buildStructuredResponse"
Check-Content "Component importe ChatPanel_v2.css" "frontend/src/components/ChatPanel_v2.jsx" "ChatPanel_v2.css"
Check-Content "Component utilise /report/chat-contextual" "frontend/src/components/ChatPanel_v2.jsx" "chat-contextual"

Write-Host ""

# ====== MODIFICATIONS ======
Write-Host "🔄 MODIFICATIONS" -ForegroundColor Blue
Write-Host ""

Check-Content "reportController importe contextualChatService" "backend/controllers/reportController.js" "contextualChatService"
Check-Content "reportController contient chatContextual" "backend/controllers/reportController.js" "chatContextual"
Check-Content "report.js route /chat-contextual existe" "backend/routes/report.js" "chat-contextual"

Write-Host ""

# ====== PORT CHECK ======
Write-Host "🌐 CONNEXION" -ForegroundColor Blue
Write-Host ""

$backend = $false
$frontend = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible (5000)" -ForegroundColor Green
        $checksPass++
        $backend = $true
    }
} catch {
    Write-Host "❌ Backend non accessible (5000) - Assurez-vous qu'il est démarré" -ForegroundColor Red
    $checksFail++
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5175/" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible (5175)" -ForegroundColor Green
        $checksPass++
        $frontend = $true
    }
} catch {
    Write-Host "❌ Frontend non accessible (5175) - Assurez-vous qu'il est démarré" -ForegroundColor Red
    $checksFail++
}

Write-Host ""

# ====== MONGODB ======
Write-Host "💾 MONGODB" -ForegroundColor Blue
Write-Host ""

Check-File "Script listEvaluations existe" "backend/scripts/listEvaluations.js"

Write-Host ""

# ====== RÉSUMÉ ======
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "✅ Checks passés: $checksPass" -ForegroundColor Green
Write-Host "❌ Checks échoués: $checksFail" -ForegroundColor Red
Write-Host ""

if ($checksFail -eq 0) {
    Write-Host "🎉 Installation OK!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Importer ChatPanel_v2 dans frontend/src/App.jsx" -ForegroundColor Yellow
    Write-Host "2. Redémarrer backend et frontend" -ForegroundColor Yellow
    Write-Host "3. Tester: http://localhost:5175/" -ForegroundColor Yellow
    Write-Host "4. Poser question au chatbot: 'Status A.9.1.1?'" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Certains checks ont échoué!" -ForegroundColor Red
    Write-Host "Voir les erreurs ci-dessus et vérifier les fichiers" -ForegroundColor Red
}

Write-Host ""

# ====== COMMANDES UTILES ======
Write-Host "🛠️  COMMANDES UTILES" -ForegroundColor Blue
Write-Host ""
Write-Host "Vérifier données MongoDB:" -ForegroundColor Yellow
Write-Host "  cd backend; node scripts/listEvaluations.js" -ForegroundColor Gray
Write-Host ""
Write-Host "Redémarrer services:" -ForegroundColor Yellow
Write-Host "  Terminal 1: cd backend; npm start" -ForegroundColor Gray
Write-Host "  Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Tester endpoint directement:" -ForegroundColor Yellow
Write-Host "  `$body = @{question='Status A.9.1.1?'; context=@{}} | ConvertTo-Json" -ForegroundColor Gray
Write-Host "  Invoke-WebRequest -Uri 'http://localhost:5000/report/chat-contextual' -Method Post -Body `$body -ContentType 'application/json'" -ForegroundColor Gray
Write-Host ""
