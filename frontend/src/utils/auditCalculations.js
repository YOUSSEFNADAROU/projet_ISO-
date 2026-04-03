// Calcul du score global d'audit
export const calculateAuditScore = (evaluations) => {
  if (!evaluations || evaluations.length === 0) return 0;
  const conforme = evaluations.filter(e => e.status === 'Conforme').length;
  return Math.round((conforme / evaluations.length) * 100);
};

// Calcul du score pondéré (avec poids pour les risques)
export const calculateWeightedScore = (evaluations) => {
  if (!evaluations || evaluations.length === 0) return 0;
  
  const scoreMap = {
    'Conforme': 100,
    'Partiellement conforme': 50,
    'Non conforme': 0
  };
  
  const totalScore = evaluations.reduce((sum, e) => sum + (scoreMap[e.status] || 0), 0);
  return Math.round(totalScore / evaluations.length);
};

// Calculer les statistiques de risque
export const calculateRiskStats = (evaluations) => {
  if (!evaluations || evaluations.length === 0) {
    return {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };
  }

  const nonConforme = evaluations.filter(e => e.status !== 'Conforme');
  
  const risks = {
    critical: nonConforme.filter(e => e.severity === 'élevée' && e.probability === 'élevée').length,
    high: nonConforme.filter(e => (e.severity === 'élevée' || e.probability === 'élevée')).length,
    medium: nonConforme.filter(e => e.severity === 'moyenne' || e.probability === 'moyenne').length,
    low: nonConforme.filter(e => e.severity === 'faible' && e.probability === 'faible').length,
    total: nonConforme.length
  };
  
  return risks;
};

// Résumé exécutif
export const generateExecutiveSummary = (evaluations, scenario) => {
  const total = evaluations.length;
  const conforme = evaluations.filter(e => e.status === 'Conforme').length;
  const partiel = evaluations.filter(e => e.status === 'Partiellement conforme').length;
  const non = evaluations.filter(e => e.status === 'Non conforme').length;
  const score = calculateAuditScore(evaluations);
  const risks = calculateRiskStats(evaluations);
  
  return {
    score,
    weightedScore: calculateWeightedScore(evaluations),
    total,
    conforme,
    partiel,
    non,
    conformePercent: Math.round((conforme / total) * 100),
    partielPercent: Math.round((partiel / total) * 100),
    nonPercent: Math.round((non / total) * 100),
    risks,
    nonConformeCount: non + partiel,
    complianceGap: 100 - score,
    auditDate: new Date().toLocaleDateString('fr-FR'),
    scenario
  };
};
