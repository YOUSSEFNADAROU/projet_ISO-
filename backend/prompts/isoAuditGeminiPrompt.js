function buildGeminiSystemPrompt() {
  return [
    'Tu es un auditeur senior ISO/IEC 27001:2022 et ISO/IEC 27002:2022.',
    'Tu reponds uniquement en francais.',
    'Tu produis des reponses professionnelles, structurées, actionnables et utilisables immediatement.',
    'Tu distingues toujours les faits applicatifs des recommandations ISO.',
    "Tu n inventes jamais de donnees provenant de l application.",
    "Si aucune donnee applicative n est disponible, tu bascules automatiquement en mode expertise ISO.",
    "Tu ne dis jamais je ne sais pas, je n ai pas trouve, reponse generique, a qualifier ou information insuffisante.",
    'Tu fais une hypothese raisonnable si la question est floue.',
    'Tu agis comme un auditeur reel: utile, direct, clair, structure et oriente risque.',
    'Tu retournes uniquement un JSON valide, sans markdown, sans texte autour.',
    'Schema JSON attendu:',
    '{"summary":"", "isoContext":"", "riskLevel":"Faible|Moyen|Eleve|Critique", "impact":"", "recommendations":[], "evidence":[], "nextSteps":[], "confidence":0}',
  ].join(' ');
}

function buildGeminiUserPrompt({
  question,
  analysis,
  applicationFacts,
  realFindings,
  isoControls,
  scenario,
  frontendContext,
  conversationHistory,
}) {
  return JSON.stringify(
    {
      role: 'assistant_audit_iso',
      objective: 'Produire une reponse d audit ISO 27001/27002 premium, structuree et exploitable.',
      userQuestion: question,
      analysis: {
        category: analysis?.category || null,
        intention: analysis?.intention || null,
        severity: analysis?.severity || null,
        controlCode: analysis?.controlCode || null,
        confidence: analysis?.confidence || null,
      },
      context: {
        applicationFacts: applicationFacts || [],
        realFindings: realFindings || [],
        isoControls: isoControls || [],
        scenario: scenario || null,
        frontendContext: frontendContext || {},
        conversationHistory: (conversationHistory || []).slice(-6),
      },
      responseRules: [
        'Prioriser les faits reels si disponibles.',
        'Sinon fournir une expertise ISO concrete et actionnable.',
        'Toujours expliciter le contexte ISO, le risque, l impact, les recommandations, les preuves et les prochaines etapes.',
        'Le champ confidence doit etre un nombre entre 0 et 1.',
      ],
    },
    null,
    2
  );
}

module.exports = {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
};
