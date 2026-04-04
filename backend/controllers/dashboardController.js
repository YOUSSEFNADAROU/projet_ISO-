const Control = require('../models/Control');
const Evaluation = require('../models/Evaluation');

exports.getDashboard = async (req, res) => {
  try {
    const companyId = req.query.companyId || 'default';
    const totalControls = await Control.countDocuments();
    
    // Récupérer les évaluations uniques par controlId (prendre la plus récente)
    const uniqueEvaluations = await Evaluation.aggregate([
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
          status: { $first: '$status' }
        }
      },
      {
        $lookup: {
          from: 'controls',
          localField: '_id',
          foreignField: '_id',
          as: 'control'
        }
      }
    ]);
    
    const evaluated = uniqueEvaluations.length;
    const conforme = uniqueEvaluations.filter(e => e.status === 'Conforme').length;
    const partiellementConforme = uniqueEvaluations.filter(e => e.status === 'Partiellement conforme').length;
    const nonConforme = uniqueEvaluations.filter(e => e.status === 'Non conforme').length;
    
    const progress = totalControls > 0 ? (evaluated / totalControls) * 100 : 0;
    res.json({
      totalControls,
      evaluated,
      conforme,
      partiellementConforme,
      nonConforme,
      progress: Math.round(progress),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint de diagnostic pour vérifier s'il y a des doublons
exports.getDiagnostics = async (req, res) => {
  try {
    // Trouver tous les contrôles avec plusieurs évaluations
    const duplicates = await Evaluation.aggregate([
      {
        $group: {
          _id: '$controlId',
          count: { $sum: 1 },
          evaluationIds: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalEvaluations = await Evaluation.countDocuments();
    const totalControls = await Control.countDocuments();
    const uniqueEvaluations = await Evaluation.distinct('controlId');

    res.json({
      summary: {
        totalControls,
        totalEvaluations,
        uniqueControls: uniqueEvaluations.length,
        duplicateCount: duplicates.length,
        hasDuplicates: duplicates.length > 0
      },
      duplicates: duplicates.map(dup => ({
        controlId: dup._id,
        totalEvaluations: dup.count,
        evaluationIds: dup.evaluationIds,
        message: `Ce contrôle a ${dup.count} évaluations (devrait avoir 1)`
      })),
      recommendation: duplicates.length > 0 
        ? "Exécutez 'node backend/scripts/cleanupDuplicates.js' pour nettoyer les doublons"
        : "Votre base de données est propre - aucun doublon détecté"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};