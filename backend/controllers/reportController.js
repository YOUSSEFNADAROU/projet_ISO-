const Scenario = require('../models/Scenario');
const Control = require('../models/Control');
const Evaluation = require('../models/Evaluation');
const AuditHistory = require('../models/AuditHistory');
const aiExpertService = require('../services/aiExpertService');
const aiExpertServiceV2 = require('../services/aiExpertServiceV2');
const contextualChatService = require('../services/contextualChatService');
const axios = require('axios');

exports.getReport = async (req, res) => {
  try {
    const scenario = await Scenario.findOne();
    const controls = await Control.find();
    
    // Récupérer les évaluations uniques (dernière par controlId)
    const evaluations = await Evaluation.aggregate([
      {
        $sort: { updatedAt: -1 } // Trier par date de mise à jour décroissante
      },
      {
        $group: {
          _id: '$controlId',
          controlId: { $first: '$controlId' },
          status: { $first: '$status' },
          justification: { $first: '$justification' },
          severity: { $first: '$severity' },
          probability: { $first: '$probability' },
          riskLevel: { $first: '$riskLevel' },
          recommendation: { $first: '$recommendation' },
          remediationScore: { $first: '$remediationScore' },
          remediationComments: { $first: '$remediationComments' },
          remediationDeadline: { $first: '$remediationDeadline' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' }
        }
      },
      {
        $lookup: {
          from: 'controls',
          localField: '_id',
          foreignField: '_id',
          as: 'control'
        }
      },
      {
        $unwind: '$control'
      }
    ]);
    
    res.json({
      scenario,
      controls,
      evaluations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeAuditExpert = (report) => {
  const evaluations = report.evaluations || [];
  const total = evaluations.length;
  const conforme = evaluations.filter(e => e.status === 'Conforme').length;
  const partiel = evaluations.filter(e => e.status === 'Partiellement conforme').length;
  const nonConforme = evaluations.filter(e => e.status === 'Non conforme').length;

  const complianceRatio = total > 0 ? Number(((conforme / total) * 100).toFixed(1)) : 0;

  const riskStats = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };
  const failureReasons = {};
  const controlsByCategory = {};
  const weakEvidence = [];

  evaluations.forEach(e => {
    const severity = (e.severity || '').toLowerCase();
    const probability = (e.probability || '').toLowerCase();
    if (e.status === 'Non conforme') {
      if (severity === 'élevée' && probability === 'élevée') riskStats.critical += 1;
      else if (severity === 'élevée' || probability === 'élevée') riskStats.high += 1;
      else if (severity === 'moyenne' || probability === 'moyenne') riskStats.medium += 1;
      else if (severity === 'faible' && probability === 'faible') riskStats.low += 1;
      else riskStats.unknown += 1;
    }

    const cat = e.control?.category || 'Non catégorisé';
    controlsByCategory[cat] = controlsByCategory[cat] || { total: 0, nonConforme: 0, partiel: 0, conforme: 0 };
    controlsByCategory[cat].total += 1;
    controlsByCategory[cat][e.status === 'Conforme' ? 'conforme' : e.status === 'Partiellement conforme' ? 'partiel' : 'nonConforme'] += 1;

    if (e.status !== 'Conforme') {
      const key = `${e.status} - ${e.severity || 'inconnue'} / ${e.probability || 'inconnue'}`;
      failureReasons[key] = (failureReasons[key] || 0) + 1;

      if (!e.justification || e.justification.trim().length < 25) {
        weakEvidence.push({ 
          control: e.control?.code || 'N/A', 
          title: e.control?.title || 'N/A',
          status: e.status, 
          severity: e.severity, 
          probability: e.probability, 
          justification: e.justification 
        });
      }
    }
  });

  const topRisks = Object.entries(failureReasons)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => `${entry[0]} : ${entry[1]} contrôles`);

  const categoriesSummary = Object.entries(controlsByCategory)
    .map(([cat, stats]) => ({
      category: cat,
      total: stats.total,
      conformePercent: stats.total > 0 ? Math.round((stats.conforme / stats.total) * 100) : 0,
      partielCount: stats.partiel,
      nonConformeCount: stats.nonConforme,
      status: stats.nonConforme > 0 ? 'CRITIQUE' : stats.partiel > 0 ? 'À RENFORCER' : 'CONFORME'
    }));

  const recommendations = [
    `Commencer par corriger les ${riskStats.critical} problèmes prioritaires dans les 1-2 semaines.`,
    `Faire un plan simple pour les ${riskStats.high} problèmes importants (2-4 semaines max).`,
    `Revoir les ${partiel} contrôles incomplets et ajouter les éléments manquants.`,
    `Prévoir un second audit dans environ 30 jours pour voir les progrès.`,
    `Noter toutes les actions faites pour prouver que vous progressez.`,
    `Former l'équipe aux règles de sécurité importantes.`
  ];

  const gapAnalysis = [];
  if (complianceRatio < 50) gapAnalysis.push('⚠️ Situation urgent : Moins de 50% des contrôles sont OK. Besoin d\'agir rapidement.');
  if (riskStats.critical > 0) gapAnalysis.push(`⚠️ Problèmes graves : ${riskStats.critical} contrôles demandent une action immédiate.`);
  if (weakEvidence.length > total * 0.2) gapAnalysis.push(`⚠️ Preuves manquantes : Plus de 20% des contrôles n'ont pas assez de justifications.`);

  return {
    aiSource: 'local-expert-analysis',
    overview: `Audit sécurité : ${total} contrôles vérifiés, ${complianceRatio}% sont OK. ${conforme} conformes, ${partiel} incomplets, ${nonConforme} à corriger.`,
    executiveSummary: `Vous avez ${complianceRatio}% de conformité. Il y a ${riskStats.critical} problèmes graves et ${riskStats.high} problèmes importants à traiter. Une action rapide est nécessaire.`,
    metrics: {
      total,
      countByStatus: { conforme, partiel, nonConforme },
      complianceRatio,
      riskStats,
      weakEvidenceCount: weakEvidence.length,
      conformanceGap: 100 - complianceRatio,
    },
    categoriesSummary,
    topRisks,
    gapAnalysis,
    weakEvidenceDetails: weakEvidence.slice(0, 15),
    recommendations,
    actionPlan: [
      { priority: '🔴 À faire d\'urgence', action: 'Corriger les problèmes graves cette semaine', timeline: '1-2 semaines' },
      { priority: '🟠 Très important', action: 'Améliorer les contrôles incomplets', timeline: '2-4 semaines' },
      { priority: '🟡 Important', action: 'Préparer et tester les corrections', timeline: '4-8 semaines' },
      { priority: '🟢 Suivi', action: 'Continuer à améliorer progressivement', timeline: '8-12 semaines' }
    ],
  };
};

exports.analyzeReport = async (req, res) => {
  try {
    const report = req.body;
    if (!report || !report.evaluations || !Array.isArray(report.evaluations)) {
      return res.status(400).json({ message: 'Report data invalide pour analyse.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json(analyzeAuditExpert(report));
    }

    const prompt = `Tu es un agent d\'audit ISO 2700x expert. Scénario: ${report.scenario ? JSON.stringify(report.scenario) : 'non fourni'}. Évaluations (${report.evaluations.length}): ` +
      report.evaluations.map(e => `${e.control?.code || 'N/A'} - ${e.status} (sévérité: ${e.severity || 'N/A'}, probabilité: ${e.probability || 'N/A'})`).join('; ');

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Tu es un expert en audit ISO 2700x, synthétise et propose actions.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data?.choices?.[0]?.message?.content || 'Aucune réponse.';

    res.json({
      aiSource: 'openai',
      analysis: content,
    });
  } catch (error) {
    console.error('Erreur analyzeReport:', error.message);
    return res.status(502).json({ message: 'Erreur: ' + error.message });
  }
};

// ============= Interactive Chat about Analysis (AI Expert) =============
exports.chatAboutAnalysis = async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question requise.' });
    }

    // Utiliser le service IA expert avancé
    const result = await aiExpertService.generateAIResponse(question, context);
    
    res.json(result);
  } catch (error) {
    console.error('Erreur chat analysis:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============= Advanced Chat with Deep Analysis =============
exports.chatAdvanced = async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question requise.' });
    }

    // Analyse la question pour extraire l'intention
    const questionAnalysis = aiExpertService.analyzeQuestion(question, context);
    
    // Si la confiance est très basse ET on a une clé OpenAI, utiliser GPT-4
    if (questionAnalysis.confidence < 0.5 && process.env.OPENAI_API_KEY) {
      try {
        const aiResult = await aiExpertService.generateAIResponse(question, context);
        return res.json({
          source: aiResult.source,
          answer: aiResult.answer,
          analysis: questionAnalysis,
          suggestions: generateFollowUpSuggestions(questionAnalysis, question),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('OpenAI fallback failed, using local expert');
      }
    }
    
    // Sinon, utiliser l'analyse intelligente locale
    const enrichedAnswer = aiExpertService.generateIntelligentResponse(question, context);
    
    // Suggestions de suivi automatiques
    const suggestions = generateFollowUpSuggestions(questionAnalysis, question);

    res.json({
      source: 'advanced-local-expert',
      answer: enrichedAnswer,
      analysis: questionAnalysis,
      suggestions: suggestions,
      confidence: questionAnalysis.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur chat advanced:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Génère les suggestions de suivi basées sur les questions
 */
function generateFollowUpSuggestions(analysis, question) {
  const suggestions = [];

  // Suggestions basées sur la catégorie
  if (analysis.category === 'risks' && analysis.severity === 'critical') {
    suggestions.push('Créer un plan d\'action d\'urgence');
    suggestions.push('Alerter les responsables IT');
    suggestions.push('Documenter les mesures temporaires');
  } else if (analysis.category === 'risks') {
    suggestions.push('Évaluer l\'impact réel');
    suggestions.push('Prioriser le plan d\'action');
    suggestions.push('Identifier les ressources nécessaires');
  } else if (analysis.category === 'remediation') {
    suggestions.push('Définir les responsabilités');
    suggestions.push('Déterminer le budget');
    suggestions.push('Planifier des tests');
  } else if (analysis.category === 'compliance') {
    suggestions.push('Vérifier la conformité des autres contrôles');
    suggestions.push('Créer un plan d\'amélioration');
    suggestions.push('Planifier un audit de suivi');
  } else if (analysis.category === 'evidence') {
    suggestions.push('Collecter les preuves manquantes');
    suggestions.push('Organiser la documentation');
    suggestions.push('Configurer des tests de suivi');
  } else if (analysis.category === 'audit') {
    suggestions.push('Planifier le prochain audit');
    suggestions.push('Définir les critères d\'évaluation');
    suggestions.push('Assigner les auditeurs');
  } else if (analysis.category === 'controls') {
    suggestions.push('Explorer un contrôle spécifique');
    suggestions.push('Vérifier l\'implémentation');
    suggestions.push('Tester l\'efficacité');
  }

  // Suggestions basées sur l'intention
  if (analysis.intention === 'explicatif') {
    if (!suggestions.some(s => s.includes('Vérifier') || s.includes('explorer'))) {
      suggestions.unshift('Discuter d\'un cas pratique');
    }
  } else if (analysis.intention === 'consultatif') {
    if (!suggestions.some(s => s.includes('plan'))) {
      suggestions.push('Créer un plan d\'action détaillé');
    }
  } else if (analysis.intention === 'exemple') {
    suggestions.unshift('Voir d\'autres exemples');
  } else if (analysis.intention === 'comparaison') {
    suggestions.unshift('Comparer avec d\'autres normes');
  }

  // Suggestions génériques si rien d\'autre
  if (suggestions.length === 0) {
    suggestions.push('Poser une question plus spécifique');
    suggestions.push('Discuter d\'une situation concrète');
    suggestions.push('Explorer les recommandations');
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

// ============= Générer Plan d'Action pour Non-Conformités =============
exports.generateActionPlan = async (req, res) => {
  try {
    const report = req.body;
    
    // Validation stricte
    if (!report) {
      return res.status(400).json({ 
        message: 'Corps de requête manquant.',
        error: 'MISSING_BODY'
      });
    }

    if (!report.evaluations || !Array.isArray(report.evaluations)) {
      return res.status(400).json({ 
        message: 'Données de rapport invalides. "evaluations" doit être un tableau.',
        error: 'INVALID_EVALUATIONS'
      });
    }

    if (report.evaluations.length === 0) {
      return res.status(400).json({ 
        message: 'Aucune évaluation trouvée.',
        error: 'NO_EVALUATIONS'
      });
    }

    // Valider que chaque évaluation a les champs requis
    const invalidEvals = report.evaluations.filter((e, idx) => {
      if (!e.control) return true;
      if (!e.status) return true;
      if (!['Conforme', 'Partiellement conforme', 'Non conforme'].includes(e.status)) return true;
      return false;
    });

    if (invalidEvals.length > 0) {
      return res.status(400).json({ 
        message: `${invalidEvals.length} évaluation(s) invalide(s). Chaque évaluation doit avoir un contrôle et un statut valide.`,
        error: 'INVALID_EVALUATIONS',
        invalid_count: invalidEvals.length
      });
    }

    // Filtrer les non-conformités
    const nonConformities = report.evaluations.filter(
      e => e.status === 'Non conforme' || e.status === 'Partiellement conforme'
    );

    if (nonConformities.length === 0) {
      return res.json({
        source: 'local',
        actionPlan: [],
        message: 'Aucune non-conformité détectée. Bravo !'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Construire le prompt
    const prompt = `Tu es un expert en audit ISO 2700x. Pour chaque non-conformité ci-dessous, génère un plan d'action détaillé au format JSON.
Contexte: ${report.scenario ? JSON.stringify(report.scenario) : 'N/A'}

Non-conformités à traiter:
${nonConformities.map(e => `- ${e.control?.code || 'N/A'}: ${e.control?.title || 'N/A'} (${e.status}) - Sévérité: ${e.severity || 'N/A'}, Probabilité: ${e.probability || 'N/A'}`).join('\n')}

Retourne un JSON valide avec cette structure pour chaque non-conformité:
{
  "items": [
    {
      "controlCode": "A.X.X.X",
      "controlTitle": "Titre",
      "status": "status",
      "priority": "Critique|Haute|Moyenne|Basse",
      "steps": ["étape 1", "étape 2", ...],
      "resources": ["ressource 1", "ressource 2", ...],
      "timeline": "X semaines",
      "owner": "rôle responsable",
      "expectedOutcome": "résultat attendu"
    }
  ]
}`;

    // Avec API OpenAI
    if (apiKey) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Tu es un expert en audit ISO 2700x qui génère des plans d\'action structurés en JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.3
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const content = response.data?.choices?.[0]?.message?.content || '{}';
        try {
          const parsed = JSON.parse(content);
          return res.json({
            source: 'openai',
            actionPlan: parsed.items || []
          });
        } catch (e) {
          console.log('Fallback: IA response not JSON');
          return res.json({
            source: 'openai-text',
            actionPlan: generateLocalActionPlan(nonConformities)
          });
        }
      } catch (error) {
        console.error('Erreur OpenAI generateActionPlan:', error.message);
        // Fallback to local
        return res.json({
          source: 'local',
          actionPlan: generateLocalActionPlan(nonConformities)
        });
      }
    }

    // Fallback local
    res.json({
      source: 'local',
      actionPlan: generateLocalActionPlan(nonConformities)
    });
  } catch (error) {
    console.error('Erreur génération plan d\'action:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la génération du plan d\'action.',
      error: error.message 
    });
  }
};

// Fonction pour générer un plan d'action local
function generateLocalActionPlan(nonConformities) {
  const priorityMap = {
    'Critique': 'Critique',
    'High': 'Haute',
    'Medium': 'Moyenne',
    'Low': 'Basse'
  };

  return nonConformities.map(e => ({
    controlCode: e.control?.code || 'N/A',
    controlTitle: e.control?.title || 'N/A',
    status: e.status,
    priority: priorityMap[e.severity] || 'Moyenne',
    steps: [
      '1. Analyser le problème et ses causes racines',
      '2. Réunir l\'équipe responsable',
      '3. Définir les solutions et les responsabilités',
      '4. Mettre en place les correctifs',
      '5. Documenter les actions prises',
      '6. Vérifier l\'efficacité des solutions'
    ],
    resources: [
      'Personnel qualifié',
      'Documentation ISO 2700x',
      'Outils d\'implémentation',
      'Budget pour ressources'
    ],
    timeline: e.severity === 'Critique' ? '1-2 semaines' : (e.severity === 'High' ? '2-4 semaines' : '4-8 semaines'),
    owner: 'Manager IT/Sécurité',
    expectedOutcome: `Amener le contrôle ${e.control?.code} à l'état "Conforme"`
  }));
}

// ============= Chat with Controls (V2 with ChatGPT Integration) =============
/**
 * Nouvel endpoint avec ChatGPT intégré
 * Détecte automatiquement les codes de contrôle et fournit des réponses liées
 */
exports.chatWithControls = async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question requise.' });
    }

    // Construire le contexte avec scénario si disponible
    let fullContext = context || {};
    if (!fullContext.scenario) {
      try {
        const scenario = await Scenario.findOne();
        if (scenario) {
          fullContext.scenario = scenario;
        }
      } catch (e) {
        // Si pas de scénario, ce n'est pas grave
      }
    }

    // Utiliser le service V2 avec ChatGPT
    const result = await aiExpertServiceV2.generateIntelligentResponse(question, fullContext);

    // Trier les suggestions et les limiter à 3
    const suggestions = result.suggestions || [];

    res.json({
      source: result.source,
      answer: result.answer,
      analysis: result.analysis,
      suggestions: suggestions.slice(0, 3),
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur chat with controls:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Endpoint pour chercher un contrôle spécifique
 */
exports.getControlInfo = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ message: 'Code de contrôle requise.' });
    }

    // Chercher dans la base locale
    const { getControlByCode, searchControls } = require('../services/controlKnowledgeBase');
    
    const control = getControlByCode(code.toUpperCase());
    if (control) {
      return res.json({
        source: 'local-knowledge-base',
        control,
        found: true
      });
    }

    // Sinon chercher avec ChatGPT
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `En tant qu'expert ISO 2700x, fournis les informations complètes sur le contrôle ${code} au format JSON structured:\n{
  code: "code",
  title: "titre",
  domain: "domaine",
  category: "catégorie",
  description: "description",
  objective: "objectif",
  implementation: ["étapes"],
  bestPractices: ["pratiques"],
  risks: ["risques"],
  evidences: ["preuves"]
}`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Tu es un expert ISO 2700x. Réponds TOUJOURS en JSON formaté.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        try {
          const parsed = JSON.parse(response.data.choices[0].message.content);
          return res.json({
            source: 'chatgpt',
            control: parsed,
            found: true
          });
        } catch (e) {
          return res.status(404).json({ message: `Contrôle ${code} non trouvé.`, found: false });
        }
      } catch (error) {
        return res.status(404).json({ message: `Contrôle ${code} non trouvé.`, found: false });
      }
    }

    res.status(404).json({ message: `Contrôle ${code} non trouvé dans la base locale.`, found: false });
  } catch (error) {
    console.error('Erreur getControlInfo:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============= Chat Contextuel - Lié aux Données Réelles =============
/**
 * Nouveau endpoint: Réponses basées sur les données réelles de l'application
 * Les réponses font référence aux contrôles/évaluations/scénario réels
 */
exports.chatContextual = async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question requise.' });
    }

    // 1. Analyser question et récupérer données réelles
    const analysisData = await contextualChatService.analyzeAndFetchData(question, context);

    // 2. Construire réponse structurée avec données réelles
    const response = await contextualChatService.buildStructuredResponse(analysisData);

    // 3. Formater pour affichage
    const formattedResponse = contextualChatService.formatResponseForDisplay(response);

    // 4. Retourner réponse structurée
    res.json({
      success: true,
      response: formattedResponse,
      data: {
        hasRealData: analysisData.hasRealData,
        questionType: analysisData.analysisType,
        controlsFound: analysisData.controls.length,
        evaluationsFound: analysisData.evaluations.length,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur chat contextual:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};