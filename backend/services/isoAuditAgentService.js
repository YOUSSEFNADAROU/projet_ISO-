const contextualChatService = require('./contextualChatService');
const aiExpertServiceV2 = require('./aiExpertServiceV2');
const geminiService = require('./geminiService');
const { getControlByCode, searchControls } = require('./controlKnowledgeBase');
const {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
} = require('../prompts/isoAuditGeminiPrompt');

function sanitizeQuestion(question) {
  return typeof question === 'string' ? question.trim() : '';
}

function normalizeRiskLevel(evaluation = {}) {
  if (evaluation.riskLevel) {
    return evaluation.riskLevel;
  }

  const severity = String(evaluation.severity || '').toLowerCase();
  const probability = String(evaluation.probability || '').toLowerCase();

  if (severity.includes('elev') && probability.includes('elev')) return 'Critique';
  if (severity.includes('elev') || probability.includes('elev')) return 'Eleve';
  if (severity.includes('moy') || probability.includes('moy')) return 'Moyen';
  if (severity.includes('faib') && probability.includes('faib')) return 'Faible';

  return 'Moyen';
}

function determineAuditRisk(evaluations = []) {
  if (evaluations.some((evaluation) => normalizeRiskLevel(evaluation) === 'Critique')) {
    return 'Critique';
  }
  if (evaluations.some((evaluation) => normalizeRiskLevel(evaluation) === 'Eleve')) {
    return 'Eleve';
  }
  if (evaluations.some((evaluation) => normalizeRiskLevel(evaluation) === 'Moyen')) {
    return 'Moyen';
  }
  return evaluations.length ? 'Faible' : 'Moyen';
}

function inferExpertRisk(question = '', analysis = {}) {
  const text = `${question} ${analysis.category || ''} ${analysis.intention || ''} ${analysis.severity || ''}`.toLowerCase();

  if (/critique|urgent|incident|attaque|breach|ransom|vuln|non conforme/.test(text)) {
    return 'Eleve';
  }
  if (/preuve|audit|conformit|controle|controle|acces|backup|journal|logging/.test(text)) {
    return 'Moyen';
  }
  return 'Moyen';
}

function dedupeByCode(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const code = item?.code;
    if (!code || seen.has(code)) {
      return false;
    }
    seen.add(code);
    return true;
  });
}

function getRelevantKnowledgeControls(question, analysis) {
  const exactControls = [];
  if (analysis.controlCode) {
    const exact = getControlByCode(analysis.controlCode.toUpperCase());
    if (exact) {
      exactControls.push(exact);
    }
  }

  return dedupeByCode([
    ...exactControls,
    ...searchControls(question).slice(0, 5),
    ...(analysis.relatedControls || []),
  ]);
}

function buildApplicationFacts(data, frontendContext = {}) {
  const facts = [];
  const { controls = [], evaluations = [], scenario } = data;

  if (scenario) {
    facts.push(`Scenario metier reel: ${scenario.name} (${scenario.sector}, taille ${scenario.size}).`);
    if (scenario.auditObjective) {
      facts.push(`Objectif d'audit: ${scenario.auditObjective}.`);
    }
    if (scenario.securityContext) {
      facts.push(`Contexte de securite: ${scenario.securityContext}.`);
    }
  }

  if (controls.length > 0) {
    facts.push(
      `Controles applicatifs identifies: ${controls.map((control) => `${control.code} ${control.title}`).join('; ')}.`
    );
  }

  if (evaluations.length > 0) {
    facts.push(
      `Evaluations reelles disponibles: ${evaluations.map((evaluation) => `${evaluation.status} / risque ${normalizeRiskLevel(evaluation)}`).join('; ')}.`
    );
  }

  if (frontendContext && Object.keys(frontendContext).length > 0) {
    facts.push(`Contexte frontend fourni: ${JSON.stringify(frontendContext)}.`);
  }

  return facts;
}

function buildFindings(controls = [], evaluations = []) {
  const findings = controls.map((control) => {
    const evaluation = evaluations.find((item) => String(item.controlId) === String(control._id));

    if (!evaluation) {
      return {
        controlCode: control.code,
        title: control.title,
        status: 'A confirmer en audit',
        riskLevel: 'Moyen',
        detail: 'Le controle doit etre verifie sur le terrain pour confirmer son niveau reel de mise en oeuvre et d efficacite.',
      };
    }

    return {
      controlCode: control.code,
      title: control.title,
      status: evaluation.status,
      riskLevel: normalizeRiskLevel(evaluation),
      detail: evaluation.justification || 'Le controle doit etre confirme par revue documentaire et verification terrain.',
      recommendation: evaluation.recommendation || null,
    };
  });

  const statusRank = {
    'Non conforme': 0,
    'Partiellement conforme': 1,
    Conforme: 2,
    'A confirmer en audit': 3,
  };

  const riskRank = {
    Critique: 0,
    Eleve: 1,
    Moyen: 2,
    Faible: 3,
  };

  return findings
    .sort((left, right) => {
      const statusDelta = (statusRank[left.status] ?? 9) - (statusRank[right.status] ?? 9);
      if (statusDelta !== 0) {
        return statusDelta;
      }
      return (riskRank[left.riskLevel] ?? 9) - (riskRank[right.riskLevel] ?? 9);
    })
    .slice(0, 6);
}

function inferExpertIsoContext(question = '', analysis = {}, knowledgeControls = []) {
  if (knowledgeControls.length > 0) {
    return knowledgeControls
      .slice(0, 3)
      .map((control) => `${control.code} - ${control.title} (${control.domain || control.category || 'ISO 27001/27002'})`)
      .join('\n');
  }

  const text = `${question} ${analysis.category || ''}`.toLowerCase();

  if (/preuve|document|evidence|audit/.test(text)) {
    return 'Domaines ISO concernes : documentation, conservation des preuves, surveillance et audit interne.';
  }
  if (/acces|habilitation|compte|identit/.test(text)) {
    return 'Domaines ISO concernes : gestion des identites, habilitations, moindre privilege, revues d acces et tracabilite.';
  }
  if (/sauvegarde|backup|restauration|continuite/.test(text)) {
    return 'Domaines ISO concernes : sauvegarde, restauration, continuite d activite et resilience operationnelle.';
  }
  if (/risque|non conforme|conformit/.test(text)) {
    return 'Domaines ISO concernes : traitement des risques, maitrise des non-conformites, amelioration continue et pilotage du SMSI.';
  }
  return 'Domaines ISO concernes : gouvernance du SMSI, maitrise operationnelle des controles et demonstration de conformite ISO 27001/27002.';
}

function buildExpertFallbackRecommendations(question = '', analysis = {}, knowledgeControls = [], scenario = null) {
  const recommendations = [];

  knowledgeControls.slice(0, 2).forEach((control) => {
    (control.implementation || []).slice(0, 2).forEach((step) => {
      recommendations.push(`${control.code}: ${step}`);
    });
  });

  if (recommendations.length === 0) {
    recommendations.push('Identifier le processus concerne, le proprietaire du controle et le niveau d application reel.');
    recommendations.push('Formaliser une regle ou procedure applicable immediatement et la communiquer aux equipes concernees.');
    recommendations.push('Tester le fonctionnement du controle sur un echantillon representatif et corriger les ecarts constates.');
  }

  if (scenario?.keySystems?.length) {
    recommendations.push(`Prioriser la mise en oeuvre sur les systemes cles suivants : ${scenario.keySystems.slice(0, 3).join(', ')}.`);
  }

  return [...new Set(recommendations)].slice(0, 6);
}

function buildEvidenceList(knowledgeControls = [], findings = []) {
  const evidence = [];

  knowledgeControls.forEach((control) => {
    (control.evidences || []).slice(0, 4).forEach((item) => {
      evidence.push(`${control.code}: ${item}`);
    });
  });

  findings.forEach((finding) => {
    if (finding.status === 'Non conforme' || finding.status === 'Partiellement conforme') {
      evidence.push(`${finding.controlCode}: preuve de remediation, validation de correction et trace de revue de suivi.`);
    }
  });

  return [...new Set(evidence)];
}

function buildExpertFallbackEvidence(question = '', knowledgeControls = []) {
  const evidence = buildEvidenceList(knowledgeControls, []);

  if (evidence.length === 0) {
    evidence.push('Procedure, politique ou standard approuve lie au sujet pose.');
    evidence.push('Preuves d application operationnelle : tickets, journaux, captures, exports ou rapports.');
    evidence.push('Trace de revue, de test ou de validation par un responsable competent.');
  }

  return [...new Set(evidence)].slice(0, 6);
}

function buildExpertFallbackNextSteps(question = '', knowledgeControls = []) {
  const nextSteps = [];

  if (knowledgeControls.length > 0) {
    nextSteps.push(`Verifier l efficacite operationnelle de ${knowledgeControls[0].code} sur un cas reel.`);
    nextSteps.push(`Preparer les preuves d audit attendues pour ${knowledgeControls[0].code}.`);
  }

  if (nextSteps.length === 0) {
    nextSteps.push('Valider le perimetre exact concerne par la question avec le responsable metier ou securite.');
    nextSteps.push('Comparer la pratique actuelle au controle ISO attendu et documenter les ecarts.');
  }

  nextSteps.push('Programmer une revue de suivi avec decisions, responsables et echeances.');

  return [...new Set(nextSteps)].slice(0, 5);
}

function buildLocalSections(question, analysis, data, knowledgeControls) {
  const { controls = [], evaluations = [], scenario } = data;
  const findings = buildFindings(controls, evaluations);
  const firstKnowledgeControl = knowledgeControls[0];
  const riskLevel = evaluations.length > 0 ? determineAuditRisk(evaluations) : inferExpertRisk(question, analysis);

  const summaryParts = [];
  if (controls.length > 0) {
    summaryParts.push(`La reponse s appuie sur ${controls.length} controle(s) applicatif(s) et ${evaluations.length} evaluation(s) reelle(s) lies a votre question.`);
  } else if (knowledgeControls.length > 0) {
    summaryParts.push("La question est traitee en mode expertise ISO, avec une interpretation orientee audit et des mesures directement applicables.");
  } else {
    summaryParts.push("La question est interpretee comme un besoin d orientation d audit ISO. Je fournis une reponse exploitable basee sur les bonnes pratiques attendues pour ce type de situation.");
  }

  if (scenario) {
    summaryParts.push(`Le scenario metier ${scenario.name} est pris en compte pour contextualiser les recommandations.`);
  }

  const isoContext = knowledgeControls.length > 0
    ? knowledgeControls
        .slice(0, 3)
        .map((control) => `${control.code} - ${control.title} (${control.domain || control.category || 'ISO 27001/27002'}): ${control.objective || control.description}`)
        .join('\n')
    : inferExpertIsoContext(question, analysis, knowledgeControls);

  const recommendations = [];
  findings.forEach((finding) => {
    if (finding.status === 'Non conforme' || finding.status === 'Partiellement conforme') {
      recommendations.push(`Prioriser ${finding.controlCode} (${finding.title}) avec un plan de remediation cible et un responsable nomme.`);
      recommendations.push(`Formaliser des preuves verifiables pour ${finding.controlCode} avant le prochain audit de suivi.`);
    }
  });

  if (recommendations.length === 0 && firstKnowledgeControl) {
    (firstKnowledgeControl.implementation || []).slice(0, 3).forEach((step) => {
      recommendations.push(`${firstKnowledgeControl.code}: ${step}`);
    });
  }

  if (recommendations.length === 0) {
    buildExpertFallbackRecommendations(question, analysis, knowledgeControls, scenario).forEach((item) => recommendations.push(item));
  }

  const mediumTermRecommendations = [];
  if (firstKnowledgeControl) {
    (firstKnowledgeControl.bestPractices || []).slice(0, 3).forEach((practice) => {
      mediumTermRecommendations.push(`${firstKnowledgeControl.code}: ${practice}`);
    });
  }
  if (scenario?.keySystems?.length) {
    mediumTermRecommendations.push(`Etendre le controle aux systemes cles du scenario : ${scenario.keySystems.slice(0, 4).join(', ')}.`);
  }

  const impactParts = [];
  if (findings.some((finding) => finding.status === 'Non conforme')) {
    impactParts.push("Des non-conformites peuvent conduire a un echec d audit, a une hausse du risque de securite et a une degradation de la confiance.");
  }
  if (findings.some((finding) => finding.status === 'Partiellement conforme')) {
    impactParts.push("Les controles partiellement conformes augmentent le risque residuel et affaiblissent la demonstration de maitrise du SMSI.");
  }
  if (!impactParts.length) {
    impactParts.push("L impact principal porte sur la capacite a demontrer une maitrise effective du controle, a reduire le risque operationnel et a soutenir un resultat d audit favorable.");
  }

  const evidence = findings.length > 0 || knowledgeControls.length > 0
    ? buildEvidenceList(knowledgeControls, findings)
    : buildExpertFallbackEvidence(question, knowledgeControls);

  const nextQuestions = buildExpertFallbackNextSteps(question, knowledgeControls);

  return {
    summary: `${summaryParts.join(' ')} Niveau de risque estime: ${riskLevel}.`,
    isoContext,
    riskLevel,
    impact: impactParts.join(' '),
    findings,
    recommendations: [...new Set(recommendations)].slice(0, 6),
    mediumTermRecommendations: [...new Set(mediumTermRecommendations)].slice(0, 6),
    evidence: [...new Set(evidence)].slice(0, 6),
    nextQuestions: [...new Set(nextQuestions)].slice(0, 5),
  };
}

function buildLocalText(sections) {
  const lines = [
    '1. Resume clair',
    sections.summary,
    '',
    '2. Contexte ISO',
    sections.isoContext,
    '',
    '3. Risque',
    `Niveau de risque: ${sections.riskLevel}`,
    '',
    '4. Analyse',
    sections.impact,
  ];

  if (sections.findings.length > 0) {
    lines.push('', 'Constats:');
    sections.findings.forEach((finding) => {
      lines.push(`- ${finding.controlCode} - ${finding.title}: ${finding.status} (${finding.riskLevel})${finding.detail ? ` - ${finding.detail}` : ''}`);
    });
  }

  if (sections.recommendations.length > 0) {
    lines.push('', '5. Recommandations immediates');
    sections.recommendations.forEach((recommendation) => lines.push(`- ${recommendation}`));
  }

  if (sections.evidence.length > 0) {
    lines.push('', '6. Preuves attendues');
    sections.evidence.forEach((item) => lines.push(`- ${item}`));
  }

  if (sections.nextQuestions.length > 0) {
    lines.push('', '7. Prochaines etapes');
    sections.nextQuestions.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join('\n');
}

function shouldUseGemini(question, analysis, data, knowledgeControls) {
  if (!geminiService.isEnabled()) {
    return false;
  }

  const hasLocalSubstance =
    (data.controls || []).length > 0 ||
    (data.evaluations || []).length > 0 ||
    knowledgeControls.length > 0;

  const isComplexIntent = ['comparison', 'advisory', 'urgent'].includes(analysis.intention);
  const isBroadQuestion = question.length > 180;
  const lowConfidence = (analysis.confidence || 0) < 0.75;

  if (!hasLocalSubstance) {
    return true;
  }

  if (isComplexIntent || isBroadQuestion || lowConfidence) {
    return true;
  }

  return false;
}

function buildGeminiPromptPayload(question, analysis, data, knowledgeControls, frontendContext, conversationHistory) {
  const facts = buildApplicationFacts(data, frontendContext);
  const compactControls = knowledgeControls.slice(0, 3).map((control) => ({
    code: control.code,
    title: control.title,
    domain: control.domain,
    objective: control.objective,
    implementation: (control.implementation || []).slice(0, 4),
    evidences: (control.evidences || []).slice(0, 4),
    bestPractices: (control.bestPractices || []).slice(0, 4),
  }));

  return {
    systemPrompt: buildGeminiSystemPrompt(),
    userPrompt: buildGeminiUserPrompt({
      question,
      analysis,
      applicationFacts: facts,
      realFindings: buildFindings(data.controls, data.evaluations),
      isoControls: compactControls,
      scenario: data.scenario || null,
      frontendContext: frontendContext || {},
      conversationHistory: conversationHistory || [],
    }),
  };
}

async function getLlmSections(question, analysis, data, knowledgeControls, frontendContext, conversationHistory) {
  if (!shouldUseGemini(question, analysis, data, knowledgeControls)) {
    return {
      sections: null,
      status: geminiService.isEnabled() ? 'not_needed' : 'disabled',
      provider: 'local',
    };
  }

  const promptPayload = buildGeminiPromptPayload(
    question,
    analysis,
    data,
    knowledgeControls,
    frontendContext,
    conversationHistory
  );

  const result = await geminiService.generateStructuredAuditResponse({
    systemPrompt: promptPayload.systemPrompt,
    userPrompt: promptPayload.userPrompt,
  });

  return {
    sections: result.sections,
    status: result.status,
    provider: result.ok ? 'gemini' : 'local',
  };
}

function asStringArray(items, fallback = []) {
  if (!Array.isArray(items)) {
    return fallback;
  }

  return items
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object') {
        return item.detail || item.title || item.label || JSON.stringify(item);
      }
      return String(item);
    })
    .filter(Boolean);
}

function mergeSections(localSections, aiSections) {
  if (!aiSections) {
    return localSections;
  }

  return {
    summary: aiSections.summary || localSections.summary,
    isoContext: aiSections.isoContext || localSections.isoContext,
    riskLevel: aiSections.riskLevel || localSections.riskLevel,
    impact: aiSections.impact || localSections.impact,
    findings: localSections.findings.length > 0 ? localSections.findings : asStringArray(aiSections.findings),
    recommendations: [...new Set([...localSections.recommendations, ...asStringArray(aiSections.recommendations)])].slice(0, 8),
    mediumTermRecommendations: [...new Set([...localSections.mediumTermRecommendations, ...asStringArray(aiSections.mediumTermRecommendations)])].slice(0, 8),
    evidence: [...new Set([...localSections.evidence, ...asStringArray(aiSections.evidence)])].slice(0, 8),
    nextQuestions: [...new Set([...localSections.nextQuestions, ...asStringArray(aiSections.nextQuestions), ...asStringArray(aiSections.nextSteps)])].slice(0, 6),
  };
}

function buildActions(sections, findings) {
  const actions = [];

  findings
    .filter((finding) => finding.status === 'Non conforme' || finding.status === 'Partiellement conforme')
    .slice(0, 3)
    .forEach((finding) => {
      actions.push({
        label: `Plan de remediation ${finding.controlCode}`,
        action: 'createRemediationPlan',
        controlCode: finding.controlCode,
      });
    });

  sections.nextQuestions.slice(0, 2).forEach((question) => {
    actions.push({
      label: question,
      action: 'askFollowUp',
    });
  });

  return actions.slice(0, 5);
}

async function generateChatResponse(question, options = {}) {
  const sanitizedQuestion = sanitizeQuestion(question);

  if (!sanitizedQuestion) {
    const error = new Error('Question requise.');
    error.statusCode = 400;
    throw error;
  }

  const frontendContext = options.context || {};
  const conversationHistory = Array.isArray(options.conversationHistory) ? options.conversationHistory : [];

  console.log(`[isoAuditAgentService] Question recue: ${sanitizedQuestion}`);

  const analysis = aiExpertServiceV2.analyzeQuestion(sanitizedQuestion, frontendContext);
  const data = await contextualChatService.analyzeAndFetchData(sanitizedQuestion, frontendContext);
  const knowledgeControls = getRelevantKnowledgeControls(sanitizedQuestion, analysis);
  const localSections = buildLocalSections(sanitizedQuestion, analysis, data, knowledgeControls);
  const llmResult = await getLlmSections(
    sanitizedQuestion,
    analysis,
    data,
    knowledgeControls,
    frontendContext,
    conversationHistory
  );

  const aiSections = llmResult.sections;
  const sections = mergeSections(localSections, aiSections);
  const sourceUsed = aiSections
    ? ['gemini']
    : llmResult.status === 'quota_exceeded' || llmResult.status === 'fallback'
      ? ['local_fallback']
      : ['local'];

  const actions = buildActions(sections, localSections.findings);
  const text = buildLocalText(sections);
  const confidence = Number(
    Math.max(
      0.55,
      Math.min(
        0.98,
        (analysis.confidence || 0.6) +
          (data.hasRealData ? 0.15 : 0) +
          (knowledgeControls.length > 0 ? 0.1 : 0.05) +
          (aiSections ? 0.1 : 0)
      )
    ).toFixed(2)
  );

  return {
    success: true,
    response: {
      summary: sections.summary,
      isoContext: sections.isoContext,
      riskLevel: sections.riskLevel,
      impact: sections.impact,
      recommendations: sections.recommendations,
      evidence: sections.evidence,
      nextSteps: sections.nextQuestions,
      finalText: text,
      text,
      htmlContent: text,
      sections: {
        summary: sections.summary,
        isoContext: sections.isoContext,
        riskLevel: sections.riskLevel,
        impact: sections.impact,
        findings: sections.findings,
        recommendations: sections.recommendations,
        mediumTermRecommendations: sections.mediumTermRecommendations,
        evidence: sections.evidence,
        nextQuestions: sections.nextQuestions,
      },
      actions,
      suggestions: sections.nextQuestions,
    },
    metadata: {
      sources: sourceUsed,
      sourceUsed,
      llmStatus:
        aiSections
          ? 'ok'
          : llmResult.status === 'quota_exceeded'
            ? 'quota_exceeded'
            : llmResult.status === 'fallback'
              ? 'fallback'
              : 'ok',
      openaiStatus: 'disabled',
      confidence,
      controlsFound: data.controls.length,
      evaluationsFound: data.evaluations.length,
      knowledgeControlsFound: knowledgeControls.length,
      questionType: data.analysisType,
      openAIEnabled: Boolean(process.env.OPENAI_API_KEY),
      geminiEnabled: geminiService.isEnabled(),
    },
    data: {
      hasRealData: data.hasRealData,
      questionType: data.analysisType,
      controlsFound: data.controls.length,
      evaluationsFound: data.evaluations.length,
    },
  };
}

module.exports = {
  generateChatResponse,
};
