/**
 * Service d'IA Expert ISO 2700x
 * Fournit des réponses intelligentes et contextuelles pour les audits de sécurité
 */

const axios = require('axios');

// Base de connaissances ISO 2700x enrichie
const knowledgeBase = {
  controls: {
    keywords: ['contrôle', 'control', 'mesure', 'safeguard'],
    answers: [
      'Les contrôles ISO 2700x sont des mesures de sécurité organisées en 4 catégories: gouvernance (A.5), organisation (A.6), personnes (A.7), et actifs (A.8).',
      'Chaque contrôle a un objectif spécifique pour protéger vos informations. Vérifiez que vous les avez mis en place et documentés.',
      'Les contrôles technologiques incluent: chiffrement, pare-feu, authentification multi-facteur. Les contrôles organisationnels incluent: politiques, formation, incident response.'
    ]
  },
  
  risks: {
    keywords: ['risque', 'menace', 'vulnérabilité', 'critical', 'grave', 'danger', 'threat'],
    recommendations: {
      critical: {
        urgency: 'IMMÉDIATE (24-48h)',
        steps: [
          '1. Isoler le système affecté si possible',
          '2. Notifier immédiatement l\'équipe de sécurité',
          '3. Documenter tous les détails de l\'incident',
          '4. Mettre en place une solution temporaire',
          '5. Planifier une correction permanente'
        ],
        timeline: '1-2 semaines pour correction complète',
        evidence: 'Documents d\'incident, logs, plans de correction'
      },
      high: {
        urgency: 'Urgent (1 semaine)',
        steps: [
          '1. Évaluer l\'impact réel',
          '2. Prioriser dans le plan d\'action',
          '3. Allouer des ressources',
          '4. Mettre en place des contrôles compensatoires si nécessaire'
        ],
        timeline: '2-4 semaines',
        evidence: 'Plan de remédiation, tests, validation'
      },
      medium: {
        urgency: 'Planifiée (2-4 semaines)',
        steps: [
          '1. Inclure dans le plan d\'action régulier',
          '2. Assigner un responsable',
          '3. Fixer une date limite réaliste'
        ],
        timeline: '4-8 semaines',
        evidence: 'Suivi du plan d\'action, rapports d\'avancement'
      }
    }
  },

  compliance: {
    keywords: ['conformité', 'compliance', 'respect', 'compatible', 'conforme'],
    levels: {
      compliant: '✅ CONFORME - Le contrôle est implémenté et fonctionnel. Continuez à le maintenir et à le tester régulièrement.',
      partial: '⚠️ PARTIELLEMENT CONFORME - Certains éléments manquent. Identifiez ce qui fait défaut et ajoutez-le progressivement.',
      nonCompliant: '❌ NON CONFORME - Le contrôle n\'est pas implémenté. Créez un plan d\'action avec étapes et délais.'
    }
  },

  remediation: {
    keywords: ['remédiation', 'corriger', 'améliorer', 'solution', 'fix', 'plan d\'action'],
    approach: `
📋 APPROCHE STRUCTURÉE DE REMÉDIATION:
1. DIAGNOSTIC: Déterminer l'état actuel et la cause racine
2. PLANIFICATION: Définir les étapes, ressources, délais
3. IMPLÉMENTATION: Exécuter le plan avec documentation
4. VÉRIFICATION: Tester et valider la correction
5. MAINTENANCE: Surveiller et maintenir la solution
    `,
    bestPractices: [
      'Impliquer les parties prenantes dès le début',
      'Prioriser par risque et faisabilité',
      'Fixer des délais réalistes avec jalons',
      'Documenter tout ce qui est fait',
      'Prévoir des tests de validation',
      'Planifier la maintenance à long terme'
    ]
  },

  evidence: {
    keywords: ['preuve', 'justification', 'evidence', 'documentation', 'document', 'test'],
    types: [
      '📸 Preuve visuelle: Photos, captures d\'écran des configurations',
      '📄 Documentation: Politiques, procédures, manuel d\'utilisateur',
      '✍️ Enregistrements: Logs, historique, rapports d\'audit',
      '🧪 Tests: Rapports de tests de sécurité, résultats d\'audit',
      '👥 Signatures: Approbations, accords, formations suivies',
      '📊 Statistiques: Métriques, KPIs, rapports d\'incident'
    ],
    requirements: 'Chaque preuve doit être: datée, identifiée, vérifiable, et liée au contrôle spécifique'
  },

  audit: {
    keywords: ['audit', 'évaluation', 'vérification', 'assessment', 'follow-up', 'suivi'],
    cycle: `
🔄 CYCLE D'AUDIT CONTINU:
- INITIAL: Diagnostic de l'état actuel
- PLANIFICATION: Définition des objectifs et du plan
- EXÉCUTION: Mise en œuvre des contrôles
- AUDIT DE SUIVI: Vérification tous les 30-60 jours
- AMÉLIORATION CONTINUE: Ajustements basés sur les résultats
    `,
    nextAudit: 'Un audit de suivi est recommandé dans 30 jours pour vérifier la progression'
  },

  timeline: {
    keywords: ['calendrier', 'timeline', 'délai', 'temps', 'quand', 'semaine', 'mois'],
    recommendation: `
⏱️ CALENDRIER RECOMMANDÉ:
- CETTE SEMAINE: Corriger les problèmes critiques
- SEMAINES 2-3: Adresser les risques élevés
- SEMAINES 4-8: Améliorer les contrôles partiellement conformes
- SEMAINE 8+: Audit de suivi et amélioration continue
    `
  }
};

/**
 * Analyse contextuelle avancée d'une question
 */
function analyzeQuestion(question, context = {}) {
  const q = question.toLowerCase();
  const analysis = {
    keywords: [],
    category: null,
    severity: null,
    context: context,
    relatedControls: [],
    intention: 'général', // général, explicatif, consultatif, exemple, comparaison
    confidence: 0
  };

  // Déterminer l'intention de la question
  if (q.includes('comment') || q.includes('quoi') || q.includes('pourquoi') || q.includes('c\'est quoi')) {
    analysis.intention = 'explicatif';
    analysis.confidence = 0.8;
  } else if (q.includes('aider') || q.includes('recommand') || q.includes('conseil') || q.includes('faut-il')) {
    analysis.intention = 'consultatif';
    analysis.confidence = 0.8;
  } else if (q.includes('exemple') || q.includes('cas') || q.includes('scénario') || q.includes('instance')) {
    analysis.intention = 'exemple';
    analysis.confidence = 0.7;
  } else if (q.includes('différence') || q.includes('comparer') || q.includes('entre') || q.includes('vs')) {
    analysis.intention = 'comparaison';
    analysis.confidence = 0.7;
  }

  // Extraire les catégories
  if (q.includes('contrôle') || q.includes('control') || q.includes('mesure') || q.includes('safeguard')) {
    analysis.category = 'controls';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('risque') || q.includes('threat') || q.includes('danger') || q.includes('vulnérabilité')) {
    analysis.category = 'risks';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('conformité') || q.includes('compliance') || q.includes('conforme') || q.includes('statut')) {
    analysis.category = 'compliance';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('remédiation') || q.includes('corriger') || q.includes('solution') || q.includes('fix') || q.includes('plan')) {
    analysis.category = 'remediation';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('preuve') || q.includes('justification') || q.includes('evidence') || q.includes('documentation') || q.includes('document')) {
    analysis.category = 'evidence';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('audit') || q.includes('évaluation') || q.includes('vérification') || q.includes('assessment')) {
    analysis.category = 'audit';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('calendrier') || q.includes('timeline') || q.includes('délai') || q.includes('temps') || q.includes('quand')) {
    analysis.category = 'timeline';
    analysis.confidence = Math.max(analysis.confidence, 0.85);
  } else if (q.includes('iso') || q.includes('2700') || q.includes('standard') || q.includes('norme')) {
    analysis.category = 'controls';
    analysis.confidence = 0.6;
  }

  // Évaluer la sévérité
  if (q.includes('critical') || q.includes('grave') || q.includes('urgent') || q.includes('immédiat') || q.includes('panique')) {
    analysis.severity = 'critical';
  } else if (q.includes('high') || q.includes('élevé') || q.includes('important') || q.includes('prioritaire')) {
    analysis.severity = 'high';
  } else if (q.includes('medium') || q.includes('moyen')) {
    analysis.severity = 'medium';
  }

  // Extraire les mots-clés techniques
  const technicalTerms = ['chiffrement', 'encryption', 'mfa', 'authentification', 'pare-feu', 'firewall', 
                         'backup', 'sauvegarde', 'incident', 'malware', 'ransomware', 'phishing',
                         'accès', 'données', 'personnel', 'confidentialité', 'intégrité', 'disponibilité',
                         'politique', 'procédure', 'test', 'formation', 'sensibilisation'];
  technicalTerms.forEach(term => {
    if (q.includes(term)) analysis.keywords.push(term);
  });

  return analysis;
}

/**
 * Génère une réponse intelligente basée sur le contexte
 */
function generateIntelligentResponse(question, context = {}) {
  const analysis = analyzeQuestion(question, context);
  
  let response = '';

  // Réponses structurées par catégorie
  switch (analysis.category) {
    case 'risks':
      response = generateRiskResponse(question, analysis);
      break;
    case 'compliance':
      response = generateComplianceResponse(question, analysis);
      break;
    case 'remediation':
      response = generateRemediationResponse(question, analysis);
      break;
    case 'evidence':
      response = generateEvidenceResponse(question, analysis);
      break;
    case 'audit':
      response = generateAuditResponse(question, analysis);
      break;
    case 'timeline':
      response = generateTimelineResponse(question, analysis);
      break;
    case 'controls':
      response = generateControlResponse(question, analysis);
      break;
    default:
      // Essayer de trouver une réponse intelligente même si pas de catégorie détectée
      response = generateSmartResponse(question, analysis, context);
  }

  return response;
}

/**
 * Génère une réponse intelligente pour les questions non catégorisées
 */
function generateSmartResponse(question, analysis, context) {
  const q = question.toLowerCase();
  
  // Détecter les intentions spécifiques
  if (q.includes('comment') || q.includes('quoi') || q.includes('pourquoi')) {
    return generateExplanatoryResponse(question, analysis);
  }
  
  if (q.includes('aider') || q.includes('recommand') || q.includes('conseil')) {
    return generateAdvisoryResponse(question, analysis, context);
  }
  
  if (q.includes('exemple') || q.includes('cas') || q.includes('scénario')) {
    return generateExampleResponse(question, analysis);
  }
  
  if (q.includes('différence') || q.includes('comparer') || q.includes('entre')) {
    return generateComparisonResponse(question, analysis);
  }
  
  // Fallback générique intelligent
  return generateGenericResponse(question, analysis);
}

/**
 * Réponses explicatives pour les "comment/quoi/pourquoi"
 */
function generateExplanatoryResponse(question, analysis) {
  const q = question.toLowerCase();
  
  if (q.includes('iso') || q.includes('2700')) {
    return `🔐 **ISO 2700x - Standard de Sécurité de l'Information:**

ISO 2700x est une série de normes internationales qui définit comment gérer la sécurité de l'information dans une organisation.

**Principes clés:**
- 🎯 Confidentialité: Protéger l'accès aux informations sensibles
- 🛡️ Intégrité: Garantir que les données ne sont pas modifiées sans autorisation
- ⏱️ Disponibilité: Assurer l'accès aux informations quand nécessaire

**Bénéfices:**
✅ Réduire les risques de sécurité
✅ Démontrer la conformité aux clients
✅ Améliorer la confiance des stakeholders
✅ Structurer la gestion de la sécurité`;
  }
  
  if (q.includes('audit')) {
    return `📋 **Comment fonctionne un audit ISO 2700x:**

Un audit évalue votre système de gestion de la sécurité de l'information contre les critères ISO.

**Étapes principales:**
1️⃣ **Préparation**: Collecte de documentation et d'évidences
2️⃣ **Audit initial**: Vérification de la mise en place des contrôles
3️⃣ **Audit de surveillance**: Vérification continue (tous les 3-6 mois)
4️⃣ **Audit de recertification**: Tous les 3 ans

**Ce qu'on vérifie:**
✓ Politiques et procédures en place
✓ Mise en œuvre effective des contrôles
✓ Documentation et preuves
✓ Formation du personnel
✓ Incidents et amélioration continue`;
  }
  
  return generateGenericResponse(question, analysis);
}

/**
 * Réponses pour les demandes de conseils
 */
function generateAdvisoryResponse(question, analysis, context) {
  const q = question.toLowerCase();
  
  return `💡 **Recommandations Pratiques ISO 2700x:**

Basé sur votre audit, voici mes conseils:

**Priorités Immédiates:**
🔴 Corriger les non-conformités critiques cette semaine
🟠 Planifier les corrections des risques élevés
🟡 Documenter et communiquer le plan d'action

**Approche Recommandée:**
1. Réunir l'équipe IT et direction
2. Assigner des propriétaires pour chaque action
3. Fixer des délais réalistes et mesurables
4. Documenter chaque étape
5. Tester et valider les corrections

**Points Clés de Succès:**
✅ Engagement de la direction
✅ Communication claire avec l'équipe
✅ Ressources adéquates allouées
✅ Suivi régulier de la progression
✅ Évolution continue des processus`;
}

/**
 * Réponses avec exemples pratiques
 */
function generateExampleResponse(question, analysis) {
  const q = question.toLowerCase();
  
  if (q.includes('contrôle') || q.includes('implémentation')) {
    return `📝 **Exemples de Contrôles ISO 2700x en Action:**

**Contrôle d'Accès (A.9):**
- ✅ Système d'authentification multi-facteur
- ✅ Révision trimestrielle des accès
- ✅ Documentation des modifications d'accès

**Sécurité du Personnel (A.7):**
- ✅ Formation annuelle obligatoire
- ✅ Documents à signer par tous les employés
- ✅ Procédure de départ documentée

**Gestion des Incidents (A.16):**
- ✅ Plan de réaction aux incidents
- ✅ Matrice de classification des incidents
- ✅ Rapports d'incident avec leçons apprises

**Sauvegarde des Données (A.12):**
- ✅ Sauvegardes quotidiennes automatisées
- ✅ Tests de restauration mensuels
- ✅ Stockage hors-site sécurisé`;
  }
  
  return generateGenericResponse(question, analysis);
}

/**
 * Réponses pour les comparaisons
 */
function generateComparisonResponse(question, analysis) {
  return `⚖️ **Comparaisons ISO 2700x:**

**Conformité vs Non-conformité:**
| Aspect | Conforme ✅ | Non-conforme ❌ |
|--------|-----------|-----------------|
| **État** | Contrôle implémenté et fonctionnel | Contrôle absent ou défaillant |
| **Risque** | Maîtrisé | Exposé |
| **Action** | Maintenir et auditer | Corriger d'urgence |
| **Délai** | Proactif | Réactif |

**Audit Initial vs Audit de Suivi:**
- **Initial**: Diagnostic complet (7-10 jours)
- **Suivi**: Vérification continue (1-2 jours)
- **Fréquence**: Tous les 30-60 jours

**Problématiques:**
- **Critique**: Action immédiate (24-48h)
- **Élevée**: Action urgente (1 semaine)
- **Modérée**: Action planifiée (2-4 semaines)`;
}

/**
 * Réponse générique intelligente pour les questions non reconnues
 */
function generateGenericResponse(question, analysis) {
  return `📚 **Réponse Générale - Agent Expert ISO 2700x:**

Votre question sur: "${question}"

**Ce que je sais faire:**

🔐 **Contrôles de Sécurité**
- Structure et implémentation des contrôles ISO
- Bonnes pratiques par domaine (accès, personnel, incidents, etc.)

⚠️ **Gestion des Risques**
- Analyse et classification des risques
- Planification de remédiation

✅ **Conformité**
- Évaluation du statut de conformité
- Mise en œuvre progressive

📋 **Audits**
- Processus d'audit ISO 2700x
- Préparation et documentation

🔧 **Plans d'Action**
- Création et suivi des plans de remédiation
- Priorisation des actions

**Pour une réponse plus précise:**
- Soyez spécifique sur le domaine (accès, données, incidents, etc.)
- Incluez le contexte de votre situation
- Mentionnez le statut actuel (non-conforme, partiel, conforme)

📞 **Suggestion:** Pouvez-vous reformuler votre question avec plus de détails?`;
}

/**
 * Réponse sur les risques
 */
function generateRiskResponse(question, analysis) {
  let response = '🚨 ANALYSE DE RISQUE ISO 2700x:\n\n';
  
  if (analysis.severity === 'critical') {
    response += `⚠️ CRITICITÉ ÉLEVÉE - Action requise IMMÉDIATEMENT:\n`;
    response += knowledgeBase.risks.recommendations.critical.steps.join('\n') + '\n\n';
    response += `Urgence: ${knowledgeBase.risks.recommendations.critical.urgency}\n`;
    response += `Délai de correction: ${knowledgeBase.risks.recommendations.critical.timeline}\n`;
    response += `Documentation requise: ${knowledgeBase.risks.recommendations.critical.evidence}`;
  } else if (analysis.severity === 'high') {
    response += `⚠️ PRIORITÉ ÉLEVÉE - À adresser rapidement:\n`;
    response += knowledgeBase.risks.recommendations.high.steps.join('\n') + '\n\n';
    response += `Délai: ${knowledgeBase.risks.recommendations.high.timeline}`;
  } else {
    response += `📋 À inclure dans votre plan d'action régulier:\n`;
    response += knowledgeBase.risks.recommendations.medium.steps.join('\n') + '\n\n';
    response += `Délai: ${knowledgeBase.risks.recommendations.medium.timeline}`;
  }

  return response;
}

/**
 * Réponse sur la conformité
 */
function generateComplianceResponse(question, analysis) {
  let response = '✅ ANALYSE DE CONFORMITÉ ISO 2700x:\n\n';
  response += 'Les 3 niveaux de conformité:\n';
  response += `${knowledgeBase.compliance.levels.compliant}\n\n`;
  response += `${knowledgeBase.compliance.levels.partial}\n\n`;
  response += `${knowledgeBase.compliance.levels.nonCompliant}\n\n`;
  response += '🎯 ACTION: Commencez par les non-conformités, puis adressez les conformités partielles.';
  
  return response;
}

/**
 * Réponse sur la remédiation
 */
function generateRemediationResponse(question, analysis) {
  let response = knowledgeBase.remediation.approach + '\n\n';
  response += '✅ BONNES PRATIQUES:\n';
  response += knowledgeBase.remediation.bestPractices.map(bp => `• ${bp}`).join('\n');
  return response;
}

/**
 * Réponse sur les preuves
 */
function generateEvidenceResponse(question, analysis) {
  let response = '📚 TYPES DE PREUVES ACCEPTÉES:\n\n';
  response += knowledgeBase.evidence.types.join('\n') + '\n\n';
  response += `💡 Important: ${knowledgeBase.evidence.requirements}`;
  return response;
}

/**
 * Réponse sur l'audit
 */
function generateAuditResponse(question, analysis) {
  let response = knowledgeBase.audit.cycle + '\n\n';
  response += `📅 ${knowledgeBase.audit.nextAudit}`;
  return response;
}

/**
 * Réponse sur le calendrier
 */
function generateTimelineResponse(question, analysis) {
  return knowledgeBase.timeline.recommendation;
}

/**
 * Réponse sur les contrôles
 */
function generateControlResponse(question, analysis) {
  let response = '🔐 CONTRÔLES ISO 2700x:\n\n';
  response += knowledgeBase.controls.answers[0] + '\n\n';
  response += knowledgeBase.controls.answers[1] + '\n\n';
  response += knowledgeBase.controls.answers[2];
  return response;
}

/**
 * Réponse générale (fallback)
 */
function generateGeneralResponse(question, context) {
  return `Je suis votre expert ISO 2700x. Je peux vous aider sur:
  
🔐 **Contrôles**: Structure et implémentation
⚠️ **Risques**: Analyse et priorisation
✅ **Conformité**: Niveaux et statuts
🔧 **Remédiation**: Plans d'action
📚 **Preuves**: Documentation et validation
📋 **Audit**: Cycles et suivi
⏱️ **Calendrier**: Délais et jalons

Posez votre question de manière précise pour une meilleure réponse!`;
}

/**
 * Utilise OpenAI si disponible, sinon utilise le système local
 */
exports.generateAIResponse = async (question, context = {}) => {
  const apiKey = process.env.OPENAI_API_KEY;

  // Essayer OpenAI si la clé est disponible
  if (apiKey) {
    try {
      return await callOpenAI(question, context, apiKey);
    } catch (error) {
      console.warn('OpenAI error, falling back to local expert:', error.message);
    }
  }

  // Fallback sur l'expert local
  return {
    source: 'local-expert',
    answer: generateIntelligentResponse(question, context)
  };
};

/**
 * Appel à l'API OpenAI
 */
async function callOpenAI(question, context, apiKey) {
  const systemPrompt = `Tu es un expert reconnu en ISO 2700x, un standard de sécurité de l'information international.
Tu dois:
1. Répondre en français de manière claire et structurée
2. Fournir des conseils pratiques et actionnables
3. Adapter ton niveau de détail à la complexité de la question
4. Mentionner les standards et bonnes pratiques ISO 2700x
5. Proposer des solutions concrètes avec délais réalistes
6. Utiliser des emojis pour améliorer la lisibilité
7. Être concis mais complet dans tes réponses

Contexte audit fourni: ${context && Object.keys(context).length > 0 ? JSON.stringify(context, null, 2) : 'Non fourni'}`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 1000,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const answer = response.data?.choices?.[0]?.message?.content || 'Impossible de générer une réponse.';

    return {
      source: 'openai-gpt4',
      answer: answer
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Interface d'analyse enrichie pour le frontend
 */
exports.analyzeQuestion = analyzeQuestion;
exports.generateIntelligentResponse = generateIntelligentResponse;
