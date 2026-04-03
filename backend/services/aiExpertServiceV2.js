/**
 * Service IA Expert v2.0 - Avec ChatGPT + Base de Contrôles ISO
 * Fournit des réponses intelligentes liées aux contrôles spécifiques
 */

const axios = require('axios');
const { searchControls, getControlByCode, getControlsByCategory } = require('./controlKnowledgeBase');

/**
 * Configuration OpenAI
 */
const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4-turbo',
  fallbackModel: 'gpt-3.5-turbo',
  timeout: 30000
};

/**
 * Analyser une question pour détecter:
 * - Catégorie (contrôles, risques, conformité, etc)
 * - Code de contrôle (A.9.1.1)
 * - Intention (explique, conseille, exemple)
 * - Confiance (0-1)
 */
function analyzeQuestion(question, context = {}) {
  const q = question.toLowerCase();
  
  // Chercher code de contrôle (A.X.X.X)
  const controlMatch = question.match(/A\.\d+\.\d+(\.\d+)?/i);
  const controlCode = controlMatch ? controlMatch[0] : null;

  // Détecter l'intention
  const intentions = {
    explanatory: /^(qu[''e]s?-ce|comment|pourquoi|expli|défini|c[''e]s quoi)/i,
    advisory: /^(comment (améliorer|gérer|implém|résou)|que (faire|me recommandez|devrais)|plan d[''e]action|steps|étapes|quelles (mesures|actions)|mettre en place)/i,
    example: /^(exemple|donnez|cas (concret|d[''e]usage)|utilisé|appliqu)/i,
    comparison: /^(compar|différence|vs|versus|contrairement|alors que)/i,
    urgent: /(urgent|critical|emergency|crisis|immédiat|sévère|grave|attack|breach|incident)/i
  };

  let intention = 'general';
  let confidence = 0.5;

  for (const [type, regex] of Object.entries(intentions)) {
    if (regex.test(q)) {
      intention = type;
      confidence = 0.8;
      break;
    }
  }

  // Détecter catégorie
  const categories = {
    controls: /contrôle|control|mesure|safeguard|A\.\d+/i,
    risks: /risque|threat|vulnérab|menace|danger|critical|grave/i,
    compliance: /conformité|compliance|conforme|compatible/i,
    remediation: /remédiat|corriger|améliorer|solution|fix|plan d[''e]action/i,
    evidence: /preuve|justi|evidence|document|test/i,
    audit: /audit|évaluer|audit/i,
    incident: /incident|attaque|breach|compromis|non autoriso/i
  };

  let category = 'controls';
  for (const [cat, regex] of Object.entries(categories)) {
    if (regex.test(q)) {
      category = cat;
      break;
    }
  }

  // Severity
  const severities = {
    critical: /urgent|critical|immediate|emergency|sévère|grave|attaque|breach/i,
    high: /important|majeur|danger|issue|problème/i,
    medium: /moyen|devrais|considérer/i,
    low: /mineur|info|question/i
  };

  let severity = 'medium';
  for (const [sev, regex] of Object.entries(severities)) {
    if (regex.test(q)) {
      severity = sev;
      break;
    }
  }

  // Chercher contrôles mentionnés
  let relatedControls = [];
  if (controlCode) {
    const control = getControlByCode(controlCode);
    if (control) relatedControls.push(control);
    confidence = 0.9;
  } else {
    relatedControls = searchControls(question).slice(0, 3);
  }

  return {
    category,
    intention,
    severity,
    controlCode,
    relatedControls,
    confidence,
    originalQuestion: question,
    context
  };
}

/**
 * Appeler ChatGPT avec contexte ISO 2700x
 */
async function callChatGPT(question, analysis, context = {}) {
  if (!OPENAI_CONFIG.apiKey) {
    return null;
  }

  try {
    const systemPrompt = buildSystemPrompt(analysis, context);
    const userPrompt = buildUserPrompt(question, analysis);

    const response = await axios.post(
      `${OPENAI_CONFIG.baseUrl}/chat/completions`,
      {
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: OPENAI_CONFIG.timeout
      }
    );

    return {
      source: 'ChatGPT (GPT-4)',
      answer: response.data.choices[0].message.content,
      model: OPENAI_CONFIG.model,
      confidence: 0.95
    };
  } catch (error) {
    console.error('ChatGPT Error:', error.message);
    return null;
  }
}

/**
 * Construire le system prompt avec contexte ISO
 */
function buildSystemPrompt(analysis, context) {
  let prompt = `Tu es un expert en sécurité de l'information ISO 2700x avec 15 ans d'expérience.

DOMAINE: ISO/IEC 27001:2022 et ISO/IEC 27002:2022

INSTRUCTIONS:
1. Répondre TOUJOURS en français
2. Être précis et actionnable
3. Inclure des exemples concrets
4. Adapter au contexte: ${analysis.severity} severity
5. Intention détectée: ${analysis.intention}
`;

  // Ajouter contexte de contrôles si détectés
  if (analysis.relatedControls && analysis.relatedControls.length > 0) {
    prompt += `\n\nCONTRÔLES PERTINENTS:\n`;
    analysis.relatedControls.forEach(ctrl => {
      prompt += `\n- ${ctrl.code}: ${ctrl.title}\n`;
      prompt += `  Domaine: ${ctrl.domain}\n`;
      prompt += `  Objectif: ${ctrl.objective}\n`;
    });
  }

  // Ajouter contexte métier
  if (context.scenario) {
    prompt += `\n\nCONTEXTE MÉTIER:\n`;
    prompt += `Secteur: ${context.scenario.sector}\n`;
    prompt += `Taille: ${context.scenario.size}\n`;
  }

  // Adapter le tone selon sévérité
  if (analysis.severity === 'critical') {
    prompt += `\n\n⚠️ RÉPONSE URGENTE REQUISE - Focus sur les actions immédiates!`;
  }

  return prompt;
}

/**
 * Construire le user prompt
 */
function buildUserPrompt(question, analysis) {
  let prompt = `Question: ${question}\n\n`;

  if (analysis.controlCode) {
    prompt += `Code de contrôle mentionné: ${analysis.controlCode}\n`;
  }

  prompt += `Intention: ${analysis.intention}\n`;
  prompt += `Catégorie: ${analysis.category}\n`;
  prompt += `Sévérité: ${analysis.severity}\n\n`;

  prompt += `Fournir une réponse: `;

  switch (analysis.intention) {
    case 'explanatory':
      prompt += `Explique clairement le concept, donne la définition, les principes et pourquoi c'est important.`;
      break;
    case 'advisory':
      prompt += `Donne un plan d'action pratique étape-par-étape avec des conseils éprouvés.`;
      break;
    case 'example':
      prompt += `Fournis 2-3 exemples concrets et applicables dans un contexte ISO 27001.`;
      break;
    case 'comparison':
      prompt += `Crée une comparaison claire avec tableau si nécessaire.`;
      break;
    case 'urgent':
      prompt += `Donne d'abord les ACTIONS IMMÉDIATES (24-48h), puis le plan long terme.`;
      break;
    default:
      prompt += `Réponds de façon complète et structurée.`;
  }

  return prompt;
}

/**
 * Générer réponse basée sur contrôle spécifique
 */
function generateControlBasedResponse(analysis) {
  if (analysis.relatedControls.length === 0) {
    return null;
  }

  const control = analysis.relatedControls[0];
  let response = `\n📋 **${control.code}: ${control.title}**\n\n`;

  response += `**Domaine:** ${control.domain}\n`;
  response += `**Catégorie:** ${control.category}\n`;
  response += `**Objectif:** ${control.objective}\n\n`;

  response += `**Description:**\n${control.description}\n\n`;

  response += `**Implémentation:**\n`;
  control.implementation.forEach(step => {
    response += `✓ ${step}\n`;
  });

  response += `\n**Risques si absent:**\n`;
  control.risks.forEach(risk => {
    response += `⚠️ ${risk}\n`;
  });

  response += `\n**Preuves/Evidences:**\n`;
  control.evidences.forEach(ev => {
    response += `📄 ${ev}\n`;
  });

  response += `\n**Bonnes pratiques:**\n`;
  control.bestPractices.forEach(bp => {
    response += `⭐ ${bp}\n`;
  });

  if (control.resources) {
    response += `\n**Ressources:**\n`;
    control.resources.forEach(res => {
      response += `📚 ${res}\n`;
    });
  }

  return response;
}

/**
 * Générer réponse locale intelligente
 */
function generateLocalExpertResponse(question, analysis) {
  let response = '';

  // Ajouter réponse basée sur contrôle si détecté
  if (analysis.relatedControls.length > 0) {
    response += generateControlBasedResponse(analysis);
  }

  // Ajouter conseils selon intention
  switch (analysis.intention) {
    case 'advisory':
      if (analysis.severity === 'critical') {
        response += `\n\n🚨 **PLAN D'ACTION - URGENT (24-48h)**\n`;
        response += `1️⃣ Notifier immédiatement l'équipe de sécurité\n`;
        response += `2️⃣ Isoler le système affecté si possible\n`;
        response += `3️⃣ Documenter complètement l'incident\n`;
        response += `4️⃣ Mettre en place une solution temporaire\n`;
        response += `5️⃣ Planifier la correction permanente\n`;
      }
      break;

    case 'example':
      response += `\n\n📝 **EXEMPLES CONCRETS**\n`;
      response += `Exemples ajoutés via base de connaissance ISO 2700x...\n`;
      break;
  }

  return response || 'Réponse non trouvée. Utilisez ChatGPT pour plus de détails.';
}

/**
 * Générer des suggestions de suivi
 */
function generateFollowUpSuggestions(analysis, question) {
  const suggestions = [];

  // Suggestions basées sur contrôles
  if (analysis.relatedControls.length > 0) {
    const control = analysis.relatedControls[0];
    
    if (analysis.intention !== 'explanatory') {
      suggestions.push(`Comment implémenter ${control.code}?`);
    }
    if (analysis.intention !== 'example') {
      suggestions.push(`Exemples pratiques du ${control.code}`);
    }
    suggestions.push(`Audit du ${control.code}?`);
  }

  // Suggestions basées sur sévérité
  if (analysis.severity === 'critical') {
    suggestions.push('Procédure communication de l\'incident');
    suggestions.push('Plan de récupération');
  }

  // Suggestions basées sur catégorie
  if (analysis.category === 'risks') {
    suggestions.push('Analyse des risques structurée');
    suggestions.push('Matrice de risques');
  }

  // Suggestions génériques
  if (suggestions.length < 3) {
    suggestions.push('Comment documenter cela?');
    suggestions.push('Preuves requises?');
  }

  return suggestions.slice(0, 3);
}

/**
 * Réponse intelligente principale
 */
async function generateIntelligentResponse(question, context = {}) {
  // Analyser la question
  const analysis = analyzeQuestion(question, context);

  // Essayer ChatGPT si clé disponible et confiance < 0.8
  if (OPENAI_CONFIG.apiKey && analysis.confidence < 0.8) {
    const gptResponse = await callChatGPT(question, analysis, context);
    if (gptResponse) {
      return {
        source: 'ChatGPT',
        answer: gptResponse.answer,
        analysis,
        suggestions: generateFollowUpSuggestions(analysis, question),
        confidence: gptResponse.confidence
      };
    }
  }

  // Générer réponse locale
  const localResponse = generateLocalExpertResponse(question, analysis);

  return {
    source: 'Local Expert',
    answer: localResponse,
    analysis,
    suggestions: generateFollowUpSuggestions(analysis, question),
    confidence: Math.min(0.9, analysis.confidence + (analysis.relatedControls.length * 0.1))
  };
}

module.exports = {
  analyzeQuestion,
  generateIntelligentResponse,
  callChatGPT,
  generateFollowUpSuggestions,
  searchControls
};
