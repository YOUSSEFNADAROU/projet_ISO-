const Evaluation = require('../models/Evaluation');

exports.getEvaluations = async (req, res) => {
  try {
    const companyId = req.query.companyId || 'default';
    // Récupérer les évaluations uniques (dernière par controlId)
    const evaluations = await Evaluation.aggregate([
      {
        $match: { companyId }
      },
      {
        $sort: { updatedAt: -1 }
      },
      {
        $group: {
          _id: '$controlId',
          controlId: { $first: '$controlId' },
          companyId: { $first: '$companyId' },
          evaluationId: { $first: '$_id' },
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
          as: 'controlId'
        }
      },
      {
        $unwind: '$controlId'
      }
    ]);
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvaluation = async (req, res) => {
  const {
    companyId = 'default',
    controlId,
    status,
    justification,
    severity,
    probability,
    recommendation,
    remediationScore,
    remediationComments,
    remediationDeadline
  } = req.body;

  let riskLevel = null;
  let finalSeverity = severity;
  let finalProbability = probability;
  let finalRecommendation = recommendation;

  let finalRemediationScore = remediationScore ?? 0;
  let finalRemediationComments = remediationComments || '';
  let finalRemediationDeadline = remediationDeadline ? new Date(remediationDeadline) : null;

  if (status === 'Conforme') {
    finalSeverity = null;
    finalProbability = null;
    finalRecommendation = null;
    riskLevel = null;
    finalRemediationScore = 0;
    finalRemediationComments = '';
    finalRemediationDeadline = null;
  } else if (finalSeverity && finalProbability) {
    const severityScore = { faible: 1, moyenne: 2, élevée: 3 }[finalSeverity];
    const probabilityScore = { faible: 1, moyenne: 2, élevée: 3 }[finalProbability];
    const total = severityScore * probabilityScore;
    if (total <= 2) riskLevel = 'Faible';
    else if (total <= 4) riskLevel = 'Moyen';
    else riskLevel = 'Élevé';
  }

  try {
    const evaluation = await Evaluation.findOneAndUpdate(
      { controlId, companyId },
      {
        $set: {
          companyId,
          status,
          justification,
          severity: finalSeverity,
          probability: finalProbability,
          recommendation: finalRecommendation,
          riskLevel,
          remediationScore: finalRemediationScore,
          remediationComments: finalRemediationComments,
          remediationDeadline: finalRemediationDeadline
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Régénère l'état propre : supprimer toutes les évaluations orphelines restantes pour ce contrôle
    await Evaluation.deleteMany({ controlId, companyId, _id: { $ne: evaluation._id } });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// NEW: Update evaluation with remediation scoring
exports.updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { remediationScore, remediationComments, remediationDeadline } = req.body;

    const evaluation = await Evaluation.findByIdAndUpdate(
      id,
      {
        $set: {
          remediationScore: remediationScore || 0,
          remediationComments: remediationComments || '',
          remediationDeadline: remediationDeadline || null,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée.' });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};