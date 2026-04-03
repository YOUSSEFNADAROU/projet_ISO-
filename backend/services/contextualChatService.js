/**
 * Service de Chat Contextuel - Lié aux Données Réelles
 * Utilise les données MongoDB et fournit réponses structurées et pertinentes
 */

const Control = require('../models/Control');
const Evaluation = require('../models/Evaluation');
const Scenario = require('../models/Scenario');
const axios = require('axios');

/**
 * Analyser question et chercher les contrôles/données correspondantes
 */
async function analyzeAndFetchData(question, context = {}) {
  // Patterns de reconnaissance
  const patterns = {
    controlCode: /A\.\d+(\.\d+){2,}/gi, // A.9.1.1
    controlName: /contrôle|control|mesure/i,
    status: /(conforme|non conforme|partiellement)/i,
    evaluation: /évaluation|évalué|status/i,
    remediation: /remédiation|corriger|plan d'action/i,
    compliance: /conformité|compliance|percent/i,
    stats: /statistiques|stats|nombre|total|count/i,
    scenario: /contexte|situation|cas|scenario|entreprise/i,
  };

  // Chercher codes de contrôles mentionnés
  const controlMatches = [...question.matchAll(patterns.controlCode)];
  let controlCodes = controlMatches.map(m => m[0].toUpperCase());

  // Chercher tous les contrôles si demande générale
  let allControls = null;
  if (!controlCodes.length && question.toLowerCase().includes('tous')) {
    allControls = await Control.find();
  }

  // Chercher données réelles
  let controls = [];
  let evaluations = [];
  
  if (controlCodes.length > 0) {
    // Chercher contrôles spécifiques par code
    controls = await Control.find({ 
      code: { $in: controlCodes } 
    }).lean();
    
    // Chercher évaluations pour ces contrôles
    if (controls.length > 0) {
      evaluations = await Evaluation.find({
        controlId: { $in: controls.map(c => c._id) }
      })
      .sort({ updatedAt: -1 })
      .lean();
    }
  }

  // Chercher scénario
  const scenario = await Scenario.findOne().lean();

  // Détecter type de question
  const analysisType = detectQuestionType(question);

  return {
    question,
    controlCodes,
    controls,
    evaluations,
    scenario,
    analysisType,
    hasRealData: controls.length > 0 || evaluations.length > 0
  };
}

/**
 * Détecter le type de question
 */
function detectQuestionType(question) {
  const q = question.toLowerCase();

  if (/status|état|conforme|compliant/i.test(q)) return 'status';
  if (/remédiation|corriger|action|plan/i.test(q)) return 'remediation';
  if (/preuve|evidence|document/i.test(q)) return 'evidence';
  if (/risque|risk|danger|critical/i.test(q)) return 'risk';
  if (/imple|mettre en place|applic/i.test(q)) return 'implementation';
  if (/audit|vérif|test/i.test(q)) return 'audit';
  if (/statistic|nombre|total|count|combien/i.test(q)) return 'statistics';
  if (/contexte|situation|cas|scenario/i.test(q)) return 'context';

  return 'general';
}

/**
 * Construire réponse structurée avec données réelles
 */
async function buildStructuredResponse(data) {
  const { controls, evaluations, scenario, analysisType, controlCodes, question } = data;

  let response = {
    type: analysisType,
    hasRealData: data.hasRealData,
    content: {},
    suggestions: [],
    actions: []
  };

  // ========== CONTRÔLE SPÉCIFIQUE ==========
  if (controls.length > 0) {
    response.content.controls = controls.map(ctrl => ({
      code: ctrl.code,
      title: ctrl.title,
      description: ctrl.description,
      objective: ctrl.objective,
      category: ctrl.category
    }));

    // Chercher évaluation pour ce contrôle
    const evaluation = evaluations.find(e => 
      e.controlId?.toString() === controls[0]._id?.toString()
    );

    if (evaluation) {
      response.content.evaluation = {
        status: evaluation.status, // Conforme, Partiellement, Non conforme
        severity: evaluation.severity,
        probability: evaluation.probability,
        riskLevel: evaluation.riskLevel,
        justification: evaluation.justification,
        recommendation: evaluation.recommendation,
        remediationScore: evaluation.remediationScore,
        remediationDeadline: evaluation.remediationDeadline
      };
    }
  }

  // ========== RÉPONDRE SELON TYPE ==========
  switch (analysisType) {
    case 'status':
      response = await generateStatusResponse(response, evaluations, controls);
      break;

    case 'remediation':
      response = await generateRemediationResponse(response, evaluations, controls);
      break;

    case 'evidence':
      response = await generateEvidenceResponse(response, evaluations, controls);
      break;

    case 'risk':
      response = await generateRiskResponse(response, evaluations);
      break;

    case 'statistics':
      response = await generateStatisticsResponse(response, scenario);
      break;

    case 'context':
      response = await generateContextResponse(response, scenario);
      break;

    default:
      response = await generateGeneralResponse(response, controls, evaluations);
  }

  return response;
}

/**
 * Réponse: Status de Conformité
 */
async function generateStatusResponse(response, evaluations, controls) {
  if (evaluations.length === 0) {
    response.text = "❌ Aucune évaluation trouvée pour ce contrôle.";
    response.suggestions = [
      "Créer une évaluation pour ce contrôle",
      "Lister tous les contrôles",
      "Afficher les statistiques générales"
    ];
    return response;
  }

  const eval = evaluations[0];
  let statusColor = '🔴';
  let statusText = 'NON CONFORME';

  if (eval.status === 'Conforme') {
    statusColor = '🟢';
    statusText = 'CONFORME';
  } else if (eval.status === 'Partiellement conforme') {
    statusColor = '🟡';
    statusText = 'PARTIELLEMENT CONFORME';
  }

  response.text = `
${statusColor} **STATUS: ${statusText}**

Contrôle: ${response.content.controls[0].code} - ${response.content.controls[0].title}
État: ${eval.status}
Sévérité: ${eval.severity || 'N/A'}
Probabilité: ${eval.probability || 'N/A'}
Niveau de Risque: ${eval.riskLevel || 'N/A'}

**Justification:**
${eval.justification || 'Pas de justification'}

**Recommandation:**
${eval.recommendation || 'À définir'}
`;

  if (eval.remediationDeadline) {
    response.text += `\n\n⏰ **Date limite remédiation:** ${new Date(eval.remediationDeadline).toLocaleDateString('fr-FR')}`;
  }

  response.actions = [
    { label: 'Créer Plan d\'Action', action: 'createRemediation', controlId: response.content.controls[0].code },
    { label: 'Ajouter Preuve', action: 'addEvidence', controlId: response.content.controls[0].code },
    { label: 'Créer Audit', action: 'createAudit', controlId: response.content.controls[0].code }
  ];

  response.suggestions = [
    'Afficher le plan de remédiation',
    'Lister les preuves requises',
    'Comparer avec contrôles similaires'
  ];

  return response;
}

/**
 * Réponse: Plan de Remédiation
 */
async function generateRemediationResponse(response, evaluations, controls) {
  if (controls.length === 0) {
    response.text = "Veuillez préciser le contrôle à remédier (ex: A.9.1.1)";
    response.suggestions = ["Lister tous les contrôles", "Afficher les non-conformités"];
    return response;
  }

  const eval = evaluations[0];

  response.text = `
📋 **PLAN DE REMÉDIATION - ${controls[0].code}**

**Étapes à Suivre:**
1️⃣ **DIAGNOSTIC** - Analyser le problème
   ✓ Cause racine identifiée: ${eval.justification || 'À définir'}
   
2️⃣ **PLANIFICATION** - Définir la solution
   ✓ Responsable: ${eval.recommendation || 'À assigner'}
   ✓ Date limite: ${eval.remediationDeadline ? new Date(eval.remediationDeadline).toLocaleDateString() : 'À définir'}
   ✓ Score de remédiation: ${eval.remediationScore || '0'}%
   
3️⃣ **IMPLÉMENTATION** - Appliquer les changements
4️⃣ **VÉRIFICATION** - Valider la correction
5️⃣ **MAINTENANCE** - Surveiller

**Ressources Requises:**
- Personnel qualifié
- Budget supplémentaire (si besoin)
- Outils techniques
- Documentation
`;

  response.actions = [
    { label: 'Modifier Plan', action: 'editRemediation' },
    { label: 'Ajouter Étape', action: 'addStep' },
    { label: 'Assigner Responsable', action: 'assignOwner' }
  ];

  response.suggestions = [
    'Ajouter les mesures compensatoires',
    'Estimer le budget',
    'Créer un audit de suivi'
  ];

  return response;
}

/**
 * Réponse: Evidence requises
 */
async function generateEvidenceResponse(response, evaluations, controls) {
  if (controls.length === 0) {
    response.text = "Veuillez préciser le contrôle (ex: A.9.1.1)";
    return response;
  }

  response.text = `
📄 **PREUVES REQUISES - ${controls[0].code}**

Selon ISO 27001, vous devez fournir:

✅ **Preuves Obligatoires:**
1. Politique ou procédure documentée
   └─ Document signé avec date
   
2. Implémentation effective
   └─ Logs/screenshots de configuration
   
3. Preuve de suivi/test
   └─ Rapport de test, logs d'audit
   
4. Responsabilité assignée
   └─ Nomination d'un responsable

📸 **Format des Preuves:**
- Documents: PDF, Word
- Configurations: Screenshots
- Logs: Exports de fichiers journaux
- Audits: Rapports détaillés

⏰ **Délai de Conservation:**
Minimum 3 ans (besoin légal)
`;

  response.actions = [
    { label: 'Charger Preuve', action: 'uploadEvidence' },
    { label: 'Lister les Preuves', action: 'listEvidence' },
    { label: 'Générer Rapport Preuve', action: 'generateEvidenceReport' }
  ];

  return response;
}

/**
 * Réponse: Risques
 */
async function generateRiskResponse(response, evaluations) {
  // Grouper évaluations par niveau de risque
  const riskLevels = {
    critical: evaluations.filter(e => e.severity === 'critical' || e.severity === 'Critique'),
    high: evaluations.filter(e => e.severity === 'high' || e.severity === 'Élevé'),
    medium: evaluations.filter(e => e.severity === 'medium' || e.severity === 'Moyen'),
    low: evaluations.filter(e => e.severity === 'low' || e.severity === 'Faible')
  };

  response.text = `
⚠️ **ANALYSE DES RISQUES**

🔴 **CRITIQUES:** ${riskLevels.critical.length}
${riskLevels.critical.map(e => `  └─ ${e.controlId}: ${e.riskLevel}`).join('\n') || '  ✓ Aucun'}

🟠 **ÉLEVÉS:** ${riskLevels.high.length}
${riskLevels.high.map(e => `  └─ ${e.controlId}: ${e.riskLevel}`).join('\n') || '  ✓ Aucun'}

🟡 **MOYENS:** ${riskLevels.medium.length}
${riskLevels.medium.map(e => `  └─ ${e.controlId}: ${e.riskLevel}`).join('\n') || '  ✓ Aucun'}

🟢 **FAIBLES:** ${riskLevels.low.length}
${riskLevels.low.map(e => `  └─ ${e.controlId}: ${e.riskLevel}`).join('\n') || '  ✓ Aucun'}

**Actions Prioritaires:**
IMMÉDIATE: Traiter les critiques (24-48h)
URGENTE: Traiter les élevés (1 semaine)
PLANIFIÉE: Traiter les moyens (2-4 semaines)
`;

  response.actions = [
    { label: 'Créer Plan d\'Urgence', action: 'createUrgencyPlan' },
    { label: 'Exporter Rapport Risques', action: 'exportRiskReport' }
  ];

  return response;
}

/**
 * Réponse: Statistiques
 */
async function generateStatisticsResponse(response, scenario) {
  // Compter les évaluations par status
  const allEvaluations = await Evaluation.find().lean();
  
  const stats = {
    total: allEvaluations.length,
    compliant: allEvaluations.filter(e => e.status === 'Conforme').length,
    partial: allEvaluations.filter(e => e.status === 'Partiellement conforme').length,
    nonCompliant: allEvaluations.filter(e => e.status === 'Non conforme').length,
  };

  const compliancePercent = stats.total > 0 
    ? Math.round((stats.compliant / stats.total) * 100)
    : 0;

  response.text = `
📊 **STATISTIQUES DE CONFORMITÉ**

**Contexte: ${scenario?.name || 'Non spécifié'}**
Secteur: ${scenario?.sector || 'N/A'}
Taille: ${scenario?.size || 'N/A'}

**Résultats Globaux:**
✅ Conformes: ${stats.compliant}/${stats.total}
⚠️ Partiellement: ${stats.partial}/${stats.total}
❌ Non conformes: ${stats.nonCompliant}/${stats.total}

**Taux de Conformité: ${compliancePercent}%**

${compliancePercent >= 80 ? '🟢 BON - Continuer les efforts' : 
  compliancePercent >= 60 ? '🟡 MOYEN - Accélérer les remédiation' :
  '🔴 CRITIQUE - Action d\'urgence requise'}
`;

  response.stats = stats;
  response.compliancePercent = compliancePercent;

  response.actions = [
    { label: 'Générer Rapport Complet', action: 'generateFullReport' },
    { label: 'Exporter en Excel', action: 'exportToExcel' },
    { label: 'Planning Remédiation', action: 'createRemediationPlan' }
  ];

  return response;
}

/**
 * Réponse: Contexte Scénario
 */
async function generateContextResponse(response, scenario) {
  if (!scenario) {
    response.text = "Aucun scénario défini. Veuillez créer un contexte d'audit.";
    response.actions = [
      { label: 'Créer Scénario', action: 'createScenario' }
    ];
    return response;
  }

  response.text = `
🏢 **CONTEXTE D'AUDIT**

**Entreprise:** ${scenario.name}
**Secteur:** ${scenario.sector}
**Taille:** ${scenario.size}

**Systèmes Clés:**
${scenario.keySystems?.map((sys, i) => `${i+1}. ${sys}`).join('\n') || 'Non spécifiés'}

**Contexte de Sécurité:**
${scenario.securityContext || 'À définir'}

**Objectif d'Audit:**
${scenario.auditObjective || 'À définir'}

**Stratégie ISO 27001:**
- Mise à jour de la politique de sécurité
- Évaluation des contrôles existants
- Plan d'implémentation des contrôles
- Documentation et preuves
- Audits périodiques
`;

  response.context = scenario;

  response.actions = [
    { label: 'Modifier Scénario', action: 'editScenario' },
    { label: 'Ajouter Système', action: 'addSystem' }
  ];

  response.suggestions = [
    'Afficher les statistiques',
    'Créer plan d\'audit',
    'Exporter contexte'
  ];

  return response;
}

/**
 * Réponse: Générale
 */
async function generateGeneralResponse(response, controls, evaluations) {
  if (controls.length === 0) {
    response.text = `
❓ **Bienvenue dans l'Assistant d'Audit ISO 2700x**

Vous pouvez me poser les questions suivantes:

📋 **Contrôles:**
  "Quel est le status du contrôle A.9.1.1?"
  "Comment implémenter A.9.1.1?"
  
📊 **Statistiques:**
  "Quel est mon taux de conformité?"
  "Combien de contrôles sont conformes?"
  
📝 **Plans d'Action:**
  "Créer un plan de remédiation pour A.9.1.1"
  "Quelles sont les étapes de remédiation?"
  
📄 **Preuves:**
  "Quelles preuves sont requises pour A.9.1.1?"
  "Comment documenter le contrôle?"
  
⚠️ **Risques:**
  "Quels sont les risques critiques?"
  "Analyser les risques"
  
🏢 **Contexte:**
  "Afficher le contexte d'audit"
  "Quels systèmes sont audités?"
`;
  } else {
    response.text = `
ℹ️ **Contrôle trouvé: ${controls[0].code}**
${controls[0].title}

${evaluations.length > 0 
  ? `**Status:** ${evaluations[0].status}`
  : '**Status:** Non évalué'
}

Je peux vous aider à:
✓ Vérifier le status et conformité
✓ Créer un plan de remédiation
✓ Documenter les preuves requises
✓ Analyser les risques
✓ Générer un rapport
`;
  }

  response.suggestions = [
    'Afficher tous les contrôles',
    'Voir les statistiques',
    'Créer une évaluation'
  ];

  return response;
}

/**
 * Exporter réponse en format HTML structuré
 */
function formatResponseForDisplay(response) {
  return {
    ...response,
    htmlContent: response.text // Sera formattées par le frontend en HTML/Markdown
  };
}

module.exports = {
  analyzeAndFetchData,
  buildStructuredResponse,
  formatResponseForDisplay,
  detectQuestionType
};
